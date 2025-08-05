// client/src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FilePlus2 } from 'lucide-react';

const API_URL = 'http://localhost:3001';

// --- Sub-components for a more systematic structure ---

// A visual component that simulates a code editor
const CodeVisual: React.FC = () => {
    const codeSnippet = `// Welcome to CodeSync!
function collaborate(team) {
  const editor = new CodeSyncEditor();
  
  editor.on('change', (update) => {
    // Instantly share with your team
    share(update, team);
  });
  
  return "Happy Coding! 🎉";
}`;

    const [displayedCode, setDisplayedCode] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        if (isTyping) {
            if (displayedCode.length < codeSnippet.length) {
                const timeoutId = setTimeout(() => {
                    setDisplayedCode(codeSnippet.substring(0, displayedCode.length + 1));
                }, 50);
                return () => clearTimeout(timeoutId);
            } else {
                setIsTyping(false);
            }
        }
    }, [displayedCode, isTyping, codeSnippet]);


    return (
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-2xl border border-white/10 w-full max-w-2xl h-80 font-mono text-sm p-4 overflow-hidden">
            <div className="flex gap-1.5 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <pre className="text-gray-300 whitespace-pre-wrap">
                <code>{displayedCode}</code>
                {isTyping && <span className="bg-white w-2 h-4 inline-block animate-pulse ml-1"></span>}
            </pre>
        </div>
    );
};


// --- Main Home Page Component ---

const HomePage: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleCreateProject = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post<{ projectId: string }>(`${API_URL}/projects`);
            const { projectId } = response.data;
            navigate(`/projects/${projectId}`);
        } catch (error) {
            console.error('Failed to create project:', error);
            alert('Error: Could not create a new project. Please ensure the server is running.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center p-4 overflow-hidden relative">
            {/* Animated background gradient */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)]"></div>
            <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>

            <main className="z-10 flex flex-col items-center justify-center text-center space-y-12">
                {/* Top Content Section */}
                <div>
                    <h1 className="text-7xl md:text-8xl font-black text-white tracking-tight">
                        Code<span className="text-indigo-400">Sync</span>
                    </h1>
                    <p className="mt-4 text-lg text-gray-300 max-w-xl">
                        The seamless, real-time collaborative editor that brings your team's code together, instantly.
                    </p>
                </div>

                {/* Call to Action Button */}
                <div>
                    <button
                        type="button"
                        onClick={handleCreateProject}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-indigo-600 border border-transparent rounded-full shadow-lg transition-all duration-300 ease-in-out
                                   hover:bg-indigo-500 hover:scale-105
                                   focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50
                                   disabled:bg-indigo-400 disabled:cursor-not-allowed disabled:scale-100
                                   animate-pulse-slow"
                    >
                        <FilePlus2 className="mr-3 h-6 w-6" />
                        {isLoading ? 'Creating...' : 'Start a New Project'}
                    </button>
                </div>

                {/* Visual Element */}
                <div className="w-full max-w-3xl">
                    <CodeVisual />
                </div>
            </main>
        </div>
    );
};

export default HomePage;
