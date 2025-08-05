// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidV4 } = require('uuid');
const { connectDB, Project } = require('./db');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5184"],
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

const PORT = process.env.PORT || 3001;

// --- Helper functions to find nodes in the tree ---
const findNodeById = (nodes, id) => {
    for (const node of nodes) {
        if (node._id.toString() === id) return node;
        if (node.children && node.children.length > 0) {
            const found = findNodeById(node.children, id);
            if (found) return found;
        }
    }
    return null;
};

const findParentAndRemove = (nodes, id) => {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i]._id.toString() === id) {
            nodes.splice(i, 1);
            return true;
        }
        if (nodes[i].children && nodes[i].children.length > 0) {
            if (findParentAndRemove(nodes[i].children, id)) {
                return true;
            }
        }
    }
    return false;
};


// --- API Routes ---
app.post('/projects', async (req, res) => {
    try {
        const projectId = uuidV4();
        const defaultFile = { name: 'index.js', type: 'file', content: '// Welcome!' };
        const newProject = new Project({ _id: projectId, root: [defaultFile] });
        await newProject.save();
        res.status(201).json({ projectId });
    } catch (error) {
        res.status(500).json({ message: 'Error creating project', error: error.message });
    }
});

app.get('/projects/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching project', error: error.message });
    }
});

// Add a new file or folder
app.post('/projects/:projectId/nodes', async (req, res) => {
    try {
        const { name, type, parentId } = req.body;
        const project = await Project.findById(req.params.projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const newNode = { name, type, children: type === 'folder' ? [] : undefined };

        if (parentId) {
            const parentFolder = findNodeById(project.root, parentId);
            if (!parentFolder || parentFolder.type !== 'folder') {
                return res.status(400).json({ message: 'Parent must be a folder' });
            }
            parentFolder.children.push(newNode);
        } else {
            project.root.push(newNode);
        }
        
        await project.save();
        io.to(req.params.projectId).emit('receive-project-structure-change', project.root);
        res.status(201).json(project.root);

    } catch (error) {
        res.status(500).json({ message: 'Error adding node', error: error.message });
    }
});

// Update a file's content
app.put('/projects/:projectId/nodes/:nodeId/content', async (req, res) => {
    try {
        const { content } = req.body;
        const project = await Project.findById(req.params.projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const file = findNodeById(project.root, req.params.nodeId);
        if (!file || file.type !== 'file') return res.status(404).json({ message: 'File not found' });
        
        file.content = content;
        await project.save();
        res.json(file);
    } catch (error) {
        res.status(500).json({ message: 'Error updating file content', error: error.message });
    }
});

// **NEW** - Rename a file or folder
app.put('/projects/:projectId/nodes/:nodeId/rename', async (req, res) => {
    try {
        const { newName } = req.body;
        const project = await Project.findById(req.params.projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const node = findNodeById(project.root, req.params.nodeId);
        if (!node) return res.status(404).json({ message: 'Node not found' });

        node.name = newName;
        await project.save();
        io.to(req.params.projectId).emit('receive-project-structure-change', project.root);
        res.json(project.root);
    } catch (error) {
        res.status(500).json({ message: 'Error renaming node', error: error.message });
    }
});

// **NEW** - Delete a file or folder
app.delete('/projects/:projectId/nodes/:nodeId', async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const success = findParentAndRemove(project.root, req.params.nodeId);
        if (!success) return res.status(404).json({ message: 'Node not found' });
        
        await project.save();
        io.to(req.params.projectId).emit('receive-project-structure-change', project.root);
        res.status(200).json(project.root);
    } catch (error) {
        res.status(500).json({ message: 'Error deleting node', error: error.message });
    }
});


// Socket.io logic
io.on('connection', (socket) => {
    socket.on('join-project', (projectId) => socket.join(projectId));
    socket.on('file-content-change', (data) => {
        socket.to(data.projectId).emit('receive-file-content-change', data);
    });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
