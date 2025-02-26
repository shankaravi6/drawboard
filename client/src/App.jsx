import React, { useState, useEffect } from "react";
import Whiteboard from "./components/Whiteboard";
import JoinModal from "./components/JoinModal";
import { io } from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const socket = io("https://drawboard-cfr8.onrender.com", {
  transports: ["websocket"],
  withCredentials: true,
});

const App = () => {
  const [user, setUser] = useState(localStorage.getItem("username") || null);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    socket.on("userCount", setUserCount);
    socket.on("notification", (message) => toast.info(message));

    return () => {
      socket.off("userCount");
      socket.off("notification");
    };
  }, []);

  const handleExit = () => {
    socket.emit("userLeft", user);
    localStorage.removeItem("username");
    setUser(null);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black">
      {!user ? (
        <JoinModal setUser={setUser} />
      ) : (
        <>
          <div className="w-full flex justify-between p-4 fixed top-0">
            <h2 className="text-xl font-bold text-cyan-300">DrawBoard</h2>
            <button
              onClick={handleExit}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Exit
            </button>
          </div>
          <Whiteboard />
        </>
      )}
      <ToastContainer />
    </div>
  );
};

export default App;
