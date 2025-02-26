import React, { useState, useEffect } from "react";
import Whiteboard from "./components/Whiteboard";
import JoinModal from "./components/JoinModal";
import { io } from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const socket = io("https://drawboard-cfr8.onrender.com");

const App = () => {
  const [user, setUser] = useState(localStorage.getItem("username") || null);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    socket.on("userCount", (count) => {
      setUserCount(count);
    });

    socket.on("notification", (message) => {
      toast.info(message, { position: "top-right", autoClose: 3000 });
    });

    return () => {
      socket.off("userCount");
      socket.off("notification");
    };
  }, []);

  const handleExit = () => {
    if (user) {
      socket.emit("userLeft", user);
      localStorage.removeItem("username");
      setUser(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black">
      {!user ? (
        <div className="p-6 bg-white shadow-lg rounded-2xl">
          <JoinModal setUser={setUser} />
        </div>
      ) : (
        <>
          <div className="w-full flex justify-between items-center bg-white/10 backdrop-blur-lg border border-cyan-500/30 shadow-lg p-4 fixed top-0">
            <h2 className="text-xl font-bold text-cyan-300 drop-shadow-md">
              DrawBoard
            </h2>

            {/* Exit Button */}
            <button
              onClick={handleExit}
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-lg shadow-md hover:shadow-cyan-500/50 hover:from-cyan-600 hover:to-teal-600 transition-all duration-300"
            >
              Exit
            </button>
          </div>
          <div className="mt-46 w-full flex justify-center">
            <Whiteboard />
          </div>
        </>
      )}
      <ToastContainer />
    </div>
  );
};

export default App;
