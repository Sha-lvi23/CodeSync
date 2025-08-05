// client/src/pages/EditorPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { Save, Share2, FilePlus, FolderPlus, FileText, Folder, Trash2, Pencil } from 'lucide-react';

const API_URL = 'http://localhost:3001';

// --- Interfaces ---
interface FileSystemNode {
    _id: string;
    name: string;
    type: 'file' | 'folder';
    content?: string;
    children?: FileSystemNode[];
}
interface Project { _id: string; root: FileSystemNode[]; }
interface NotificationState { message: string; type: 'success' | 'error'; }

// --- Recursive File Tree Component ---
const FileTree: React.FC<{
    nodes: FileSystemNode[];
    onSelectFile: (id: string) => void;
    onAddNode: (type: 'file' | 'folder', parentId: string | null) => void;
    onRenameNode: (id: string, currentName: string) => void;
    onDeleteNode: (id: string) => void;
    activeFileId: string | null;
    level?: number;
}> = ({ nodes, onSelectFile, onAddNode, onRenameNode, onDeleteNode, activeFileId, level = 0 }) => {
    return (
        <ul style={{ paddingLeft: `${level * 16}px` }}>
            {nodes.map(node => (
                <li key={node._id}>
                    <div className={`flex items-center justify-between p-1 rounded-md group hover:bg-gray-700 ${activeFileId === node._id ? 'bg-indigo-600' : ''}`}>
                        <button type="button" onClick={() => node.type === 'file' && onSelectFile(node._id)} className="flex items-center gap-2 text-sm flex-grow text-left">
                            {node.type === 'folder' ? <Folder size={16} /> : <FileText size={16} />}
                            {node.name}
                        </button>
                        <div className="hidden group-hover:flex items-center gap-2">
                            {node.type === 'folder' && (
                                <>
                                    <button type="button" title="Add File" onClick={() => onAddNode('file', node._id)}><FilePlus size={14} /></button>
                                    <button type="button" title="Add Folder" onClick={() => onAddNode('folder', node._id)}><FolderPlus size={14} /></button>
                                </>
                            )}
                            <button type="button" title="Rename" onClick={() => onRenameNode(node._id, node.name)}><Pencil size={14} /></button>
                            <button type="button" title="Delete" onClick={() => onDeleteNode(node._id)}><Trash2 size={14} /></button>
                        </div>
                    </div>
                    {node.type === 'folder' && node.children && (
                        <FileTree nodes={node.children} onSelectFile={onSelectFile} onAddNode={onAddNode} onRenameNode={onRenameNode} onDeleteNode={onDeleteNode} activeFileId={activeFileId} level={level + 1} />
                    )}
                </li>
            ))}
        </ul>
    );
};

// --- Main Editor Page Component ---
const EditorPage: React.FC = () => {
    const { id: projectId } = useParams<{ id: string }>();
    const [projectRoot, setProjectRoot] = useState<FileSystemNode[]>([]);
    const [activeFileId, setActiveFileId] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);

    const findAndUpdateFileContent = (nodes: FileSystemNode[], fileId: string, newContent: string): FileSystemNode[] => {
        return nodes.map(node => {
            if (node.type === 'file' && node._id === fileId) return { ...node, content: newContent };
            if (node.type === 'folder' && node.children) return { ...node, children: findAndUpdateFileContent(node.children, fileId, newContent) };
            return node;
        });
    };
    
    const findFileById = (nodes: FileSystemNode[], fileId: string): FileSystemNode | null => {
        for (const node of nodes) {
            if (node.type === 'file' && node._id === fileId) return node;
            if (node.type === 'folder' && node.children) {
                const found = findFileById(node.children, fileId);
                if (found) return found;
            }
        }
        return null;
    };

    const activeFile = activeFileId ? findFileById(projectRoot, activeFileId) : null;

    useEffect(() => {
        socketRef.current = io(API_URL, { transports: ['websocket'] });
        const socket = socketRef.current;
        if (projectId) socket.emit('join-project', projectId);

        socket.on('receive-file-content-change', (data: { fileId: string; newContent: string }) => {
            setProjectRoot(prevRoot => findAndUpdateFileContent(prevRoot, data.fileId, data.newContent));
        });
        socket.on('receive-project-structure-change', (newRoot: FileSystemNode[]) => {
            setProjectRoot(newRoot);
        });

        return () => { socket.disconnect(); };
    }, [projectId]);

    useEffect(() => {
        if (!projectId) return;
        const fetchProject = async () => {
            try {
                const response = await axios.get<Project>(`${API_URL}/projects/${projectId}`);
                setProjectRoot(response.data.root);
                const firstFile = findFileById(response.data.root, response.data.root[0]?._id || '');
                if (firstFile) setActiveFileId(firstFile._id);
            } catch (error) { console.error('Failed to fetch project:', error); }
        };
        fetchProject();
    }, [projectId]);

    const handleEditorChange = (value: string | undefined) => {
        if (!activeFileId) return;
        const newContent = value || '';
        setProjectRoot(prevRoot => findAndUpdateFileContent(prevRoot, activeFileId, newContent));
        socketRef.current?.emit('file-content-change', { projectId, fileId: activeFileId, newContent });
    };

    const handleAddNode = async (type: 'file' | 'folder', parentId: string | null) => {
        const name = prompt(`Enter the new ${type} name:`);
        if (name && projectId) {
            try {
                await axios.post(`${API_URL}/projects/${projectId}/nodes`, { name, type, parentId });
            } catch (error) { console.error(`Failed to add ${type}`, error); }
        }
    };
    
    const handleRenameNode = async (nodeId: string, currentName: string) => {
        const newName = prompt("Enter the new name:", currentName);
        if (newName && newName !== currentName && projectId) {
            try {
                await axios.put(`${API_URL}/projects/${projectId}/nodes/${nodeId}/rename`, { newName });
            } catch (error) { console.error('Failed to rename node', error); }
        }
    };

    const handleDeleteNode = async (nodeId: string) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await axios.delete(`${API_URL}/projects/${projectId}/nodes/${nodeId}`);
                if (activeFileId === nodeId) {
                    setActiveFileId(null); // Clear active file if it was deleted
                }
            } catch (error) { console.error('Failed to delete node', error); }
        }
    };

    const handleSave = async () => {
        if(!activeFile) return;
        try {
            await axios.put(`${API_URL}/projects/${projectId}/nodes/${activeFile._id}/content`, { content: activeFile.content });
            alert('File Saved!');
        } catch (error) {
            alert('Error saving file');
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Project link copied to clipboard!');
    };

    return (
        <div className="flex flex-col h-screen bg-gray-800 text-white">
            <header className="bg-gray-900 p-3 flex justify-between items-center shadow-md z-10">
                <h1 className="text-xl font-bold">CodeSync</h1>
                <div className="flex items-center gap-4">
                    {/* Re-added the Share button */}
                    <button type="button" onClick={handleCopyLink} className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-gray-700 hover:bg-gray-600">
                        <Share2 size={16} /> Share
                    </button>
                    <button type="button" onClick={handleSave} className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500" disabled={!activeFile}>
                        <Save size={16} /> Save
                    </button>
                </div>
            </header>
            <div className="flex flex-grow overflow-hidden">
                <aside className="w-64 bg-gray-900 p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Project Files</h2>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => handleAddNode('file', null)} title="Add File to Root"><FilePlus size={18} /></button>
                            <button type="button" onClick={() => handleAddNode('folder', null)} title="Add Folder to Root"><FolderPlus size={18} /></button>
                        </div>
                    </div>
                    <FileTree nodes={projectRoot} onSelectFile={setActiveFileId} onAddNode={handleAddNode} onRenameNode={handleRenameNode} onDeleteNode={handleDeleteNode} activeFileId={activeFileId} />
                </aside>
                <main className="flex-grow">
                    <Editor
                        height="100%"
                        theme="vs-dark"
                        path={activeFile?._id}
                        value={activeFile?.content ?? '// Select a file to start editing'}
                        onChange={handleEditorChange}
                        options={{ readOnly: !activeFile }}
                    />
                </main>
            </div>
        </div>
    );
};

export default EditorPage;
