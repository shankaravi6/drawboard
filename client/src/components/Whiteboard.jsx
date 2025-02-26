import React, { useRef, useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("https://drawboard-cfr8.onrender.com", {
  transports: ["websocket"],
  withCredentials: true,
});

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#000000");

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth - 50;
    canvas.height = window.innerHeight - 100;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctxRef.current = ctx;

    socket.on("loadCanvas", (paths) => paths.forEach(drawPath));
    socket.on("draw", drawPath);
    socket.on("clearCanvas", () =>
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    );

    return () => {
      socket.off("loadCanvas");
      socket.off("draw");
      socket.off("clearCanvas");
    };
  }, []);

  const startDrawing = (e) => {
    setDrawing(true);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = (e) => {
    if (!drawing) return;
    ctxRef.current.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    setDrawing(false);
    socket.emit("draw", []);
  };

  return (
    <div className="relative w-full h-screen bg-gray-100 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
      />
    </div>
  );
};

export default Whiteboard;
