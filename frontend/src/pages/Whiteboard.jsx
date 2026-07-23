import { useRef, useState, useEffect } from "react";
import Navbar from "../components/Navbar";

function Whiteboard() {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState("#ffffff");
    const [brushSize, setBrushSize] = useState(3);

    useEffect(() => {
        const canvas = canvasRef.current;
        // Support high DPI screens
        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;
        canvas.style.width = `${canvas.offsetWidth}px`;
        canvas.style.height = `${canvas.offsetHeight}px`;

        const context = canvas.getContext("2d");
        context.scale(2, 2);
        context.lineCap = "round";
        context.strokeStyle = color;
        context.lineWidth = brushSize;
        contextRef.current = context;

        // Fill background with black for contrast
        context.fillStyle = "#090d16";
        context.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = color;
            contextRef.current.lineWidth = brushSize;
        }
    }, [color, brushSize]);

    function startDrawing({ nativeEvent }) {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    }

    function draw({ nativeEvent }) {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
    }

    function stopDrawing() {
        contextRef.current.closePath();
        setIsDrawing(false);
    }

    function clearCanvas() {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.fillStyle = "#090d16";
        context.fillRect(0, 0, canvas.width, canvas.height);
    }

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex h-screen overflow-hidden">
            <Navbar />
            <main className="flex-1 min-w-0 pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-6 flex flex-col h-full">
                <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 font-heading">
                            Whiteboard
                        </h1>
                        <p className="text-zinc-400 text-sm md:text-base font-medium">
                            Brainstorm venture architecture, wireframes, and strategy layouts.
                        </p>
                    </div>
                    <div className="flex items-center gap-3.5">
                        <select 
                            className="minimal-input py-1.5 px-3 text-xs cursor-pointer"
                            value={brushSize}
                            onChange={(e) => setBrushSize(Number(e.target.value))}
                        >
                            <option value="2">Thin Brush</option>
                            <option value="4">Medium Brush</option>
                            <option value="8">Thick Brush</option>
                        </select>
                        <input 
                            type="color"
                            className="w-8 h-8 rounded border border-zinc-800 bg-transparent cursor-pointer p-0.5"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                        />
                        <button 
                            className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
                            onClick={clearCanvas}
                        >
                            Clear Board
                        </button>
                    </div>
                </header>

                <div className="flex-1 min-h-0 minimal-card p-2 rounded-2xl relative overflow-hidden border border-zinc-800 bg-[#090d16] mb-4">
                    <canvas 
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        className="w-full h-full cursor-crosshair rounded-xl"
                    />
                </div>
            </main>
        </div>
    );
}

export default Whiteboard;
