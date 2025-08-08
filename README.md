                                                         CodeSync - Real-Time Collaborative Code Editor
CodeSync is a full-stack web application that allows multiple users to write and edit code together in a shared project environment, similar to a simplified version of VS Code Live Share or Google Docs for developers.

 About The Project  =>
In today's remote-first world, developers need better tools to collaborate. Screen sharing is often laggy and non-interactive, while sending code snippets back and forth is inefficient. I built CodeSync to solve this problem directly. It's a web-based platform that provides a shared, real-time environment for pair programming, technical interviews, or educational mentoring, making remote collaboration feel as seamless as being in the same room.

Key Features
⚡ Real-Time Sync: Powered by WebSockets, code changes are broadcast instantly to all connected users without delay.

🗂️ Full Project Structure: Go beyond single files. Organize your work with a complete hierarchical file and folder system.

✍️ Professional Editor: Integrates the Monaco Editor—the engine behind VS Code—for a familiar, feature-rich coding experience with syntax highlighting.

💾 Persistent Storage: Projects are saved to a MongoDB database, so you can close your browser and pick up right where you left off.

🔗 Sharable Workspaces: Every project gets a unique URL, making it easy to invite collaborators to your session.

Built With
This project leverages a modern, robust tech stack to handle real-time communication and dynamic UI rendering.

Frontend: React, TypeScript, Vite, Tailwind CSS, Monaco Editor

Backend: Node.js, Express.js, Socket.io

Database: MongoDB with Mongoose

Getting Started
To get a local copy up and running, follow these steps.

Prerequisites
You'll need Node.js (v18+) and a free MongoDB Atlas account.

Clone the repository

git clone https://github.com/your-username/your-repo-name.git
cd codesync

Set up the Backend

# Navigate to the server directory
cd server

# Install dependencies
npm install

# Create a .env file and add your MongoDB connection string
# MONGO_URI=mongodb+srv://...

# Start the server
npm run dev

Your backend will be running on http://localhost:3001.

Set up the Frontend

# Open a new terminal and navigate to the client directory
cd client

# Install dependencies
npm install

# Start the client
npm run dev

Your frontend will open on http://localhost:5173 (or a similar port).
