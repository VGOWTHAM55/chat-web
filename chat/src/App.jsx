import MessageImage from './Message.jpg';
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import "./index.css"; // Ensure Tailwind CSS is imported

const socket = io("https://chat-backend-p8iw.onrender.com");

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("connect", () => setIsOnline(true));
    socket.on("disconnect", () => setIsOnline(false));

    return () => {
      socket.off("message");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !username.trim()) return;
    const message = { username: username.trim(), text: input.trim() };
    socket.emit("message", message);
    try {
      await axios.post("https://chat-backend-p8iw.onrender.com/api/messages", message);
    } catch (error) {
      console.error("Failed to send message to server:", error);
    }
    setInput("");
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get("https://chat-backend-p8iw.onrender.com/api/messages");
        setMessages(res.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };
    fetchMessages();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Custom Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:  `url(${MessageImage})`,
          filter: 'brightness(0.9) contrast(1.1)'
        }}
      ></div>
      
      {/* Overlay to ensure readability */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      {/* Main Chat Container - Smaller Size */}
      <div className="relative z-10 bg-white/95 shadow-2xl rounded-2xl w-full max-w-md backdrop-blur-lg border border-white/20 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold mb-1">ChatSpace</h1>
              <p className="text-blue-100 text-xs">Real-time messaging</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              <span className="text-xs font-medium">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>

        {/* Username Input */}
        <div className="p-4 pb-3 bg-gray-50/50">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full p-3 pl-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-white/80 placeholder-gray-500 text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="px-4">
          <div className="h-60 overflow-y-auto border-2 border-gray-200 rounded-lg bg-white/60 backdrop-blur-sm custom-scrollbar">
            <div className="p-3 space-y-2">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-6">
                  <svg className="w-8 h-8 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-sm font-medium">No messages yet</p>
                  <p className="text-xs">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.username === username ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs px-3 py-2 rounded-lg shadow-sm ${
                      msg.username === username 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white ml-6' 
                        : 'bg-white text-gray-800 mr-6 border border-gray-200'
                    }`}>
                      <div className={`text-xs font-semibold mb-1 ${
                        msg.username === username ? 'text-blue-100' : 'text-blue-600'
                      }`}>
                        {msg.username === username ? 'You' : msg.username}
                      </div>
                      <div className="text-xs leading-relaxed break-words">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 pt-3 bg-gray-50/50">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Type your message..."
                className="w-full p-3 pl-10 pr-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-white/80 placeholder-gray-500 text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                disabled={!username.trim()}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            <button 
              onClick={sendMessage} 
              disabled={!input.trim() || !username.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg font-semibold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          
          {!username.trim() && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Please enter your name to start chatting
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-4 text-center text-white/70 text-xs">
        <p>Built with React & Socket.IO</p>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}

export default App;
