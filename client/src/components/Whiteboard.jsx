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
  const [brushSize, setBrushSize] = useState(5);
  const [path, setPath] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth - 50;
    canvas.height = window.innerHeight - 100;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;

    const fetchDrawings = async () => {
      try {
        const response = await fetch(
          "https://drawboard-cfr8.onrender.com/api/drawings"
        );
        const data = await response.json();
        console.log("existing data", data);

        if (data.length > 0) {
          data.forEach(drawPath);
        }
      } catch (error) {
        console.error("Error loading existing drawings:", error);
      }
    };

    fetchDrawings();

    socket.on("loadCanvas", (drawingHistory) => {
      drawingHistory.forEach(drawPath);
    });

    socket.on("draw", (data) => {
      drawPath(data);
    });

    socket.on("clearCanvas", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off("loadCanvas");
      socket.off("draw");
      socket.off("clearCanvas");
    };
  }, []);

  const startDrawing = (e) => {
    setDrawing(true);
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    setPath([{ x, y, color, brushSize }]);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
  };

  const draw = (e) => {
    if (!drawing) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    ctxRef.current.lineTo(x, y);
    ctxRef.current.strokeStyle = color;
    ctxRef.current.lineWidth = brushSize;
    ctxRef.current.stroke();

    setPath((prevPath) => [...prevPath, { x, y, color, brushSize }]);
  };

  const stopDrawing = () => {
    setDrawing(false);
    ctxRef.current.closePath();

    if (path.length > 0) {
      socket.emit("draw", path);
    }
  };

  const drawPath = (path) => {
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(path[0].x, path[0].y);
    ctxRef.current.strokeStyle = path[0].color;
    ctxRef.current.lineWidth = path[0].brushSize;

    path.forEach((point) => {
      ctxRef.current.lineTo(point.x, point.y);
      ctxRef.current.stroke();
    });

    ctxRef.current.closePath();
  };

  const clearCanvas = () => {
    ctxRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    socket.emit("clearCanvas");
  };

  return (
    <div className="relative w-full h-screen bg-gray-100 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        className="border border-gray-300 shadow-md rounded-lg"
      />

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-lg shadow-lg flex gap-4 items-center">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 p-1 h-10 rounded-md border border-gray-300 cursor-pointer"
        />

        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-24 cursor-pointer"
        />

        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default Whiteboard;
