import React, { useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://drawboard-cfr8.onrender.com", {
  transports: ["websocket"],
  withCredentials: true,
});

const JoinModal = ({ setUser }) => {
  const [name, setName] = useState("");

  const handleJoin = () => {
    if (name.trim()) {
      localStorage.setItem("username", name);
      setUser(name);
      socket.emit("userJoined", name); // Notify server
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-lg shadow-xl w-96 text-center">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-teal-500/30 blur-lg opacity-40 pointer-events-none"></div>

        <h2 className="text-2xl font-bold text-white drop-shadow-lg mb-4">
          Enter Your Name
        </h2>

        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-transparent border border-white/40 rounded-lg text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 mb-4 transition-all duration-300"
        />

        <button
          onClick={handleJoin}
          className="w-full py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-cyan-600 hover:to-teal-600 transition-all duration-300"
        >
          Join
        </button>
      </div>
    </div>
  );
};

export default JoinModal;
