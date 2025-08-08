CodeSync - Real-Time Collaborative Code Editor
CodeSync is a full-stack web application that allows multiple users to write and edit code together in a shared project environment, similar to a simplified version of VS Code Live Share or Google Docs for developers.

About The Project
This project was built to solve the problem of remote collaboration for developers. Traditional tools like screen sharing are often slow and not interactive. CodeSync provides a seamless, low-latency environment for pair programming, technical interviews, and educational tutoring by broadcasting changes to all participants in real-time.

Key Features
Real-Time Collaboration: Code changes are instantly synced across all connected users using Web Sockets.

Hierarchical File System: Users can create, rename, and delete nested files and folders to organize a complete project.

Rich Code Editor: Integrates the Monaco Editor, the powerful engine behind VS Code, providing syntax highlighting and a professional editing experience.

Persistent Projects: All projects and their file structures are saved to a MongoDB database, allowing users to return to their work later.

Sharable Links: Each project has a unique, sharable URL for easy access and collaboration.

Tech Stack
This project is built with a modern, full-stack JavaScript architecture:

Backend:

Node.js & Express.js: For the server environment and REST API.

Socket.io: For managing real-time WebSocket connections.

MongoDB & Mongoose: As the database for project persistence.

Frontend:

React & TypeScript: For building a dynamic, type-safe user interface.

Vite: As the fast, modern build tool and development server.

Monaco Editor: For the core code editing experience.

Tailwind CSS: For utility-first styling.

Getting Started
To get a local copy up and running, follow these simple steps.

Prerequisites
Node.js (v18 or later)

npm

MongoDB Atlas Account: A free account is required for the database.

Installation & Setup
Clone the repo

git clone https://github.com/your-username/your-repo-name.git
cd codesync

Backend Setup

Navigate to the server directory:

cd server

Install NPM packages:

npm install

Create a .env file in the server directory and add your MongoDB connection string:

MONGO_URI=mongodb+srv://your_user:<your_password>@your_cluster...

Start the server:

npm run dev

Your backend should now be running on http://localhost:3001.

Frontend Setup

Open a new terminal and navigate to the client directory:

cd client

Install NPM packages:

npm install

Start the client:

npm run dev

Your frontend should now be running on http://localhost:5173 (or a similar port).
