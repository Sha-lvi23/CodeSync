const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully.');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

// A self-referencing schema for a file system tree structure
const FileSystemNodeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['file', 'folder'], required: true },
    content: { type: String, default: '' }, // Only for files
    children: [this] // Only for folders
});

// Schema for a Project, which contains the root of the file system
const ProjectSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    root: [FileSystemNodeSchema] // The root is an array of files and folders
});

const Project = mongoose.model('Project', ProjectSchema);

module.exports = { connectDB, Project };
