import { useRef, useEffect, useState } from 'react';
import { Eraser, Undo, Trash2 } from 'lucide-react';

export default function DrawPad({ onSave }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Configuration
  const strokeColor = "#1E40AF"; // Deep Blue
  const lineWidth = 4;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Adapter la taille au conteneur parent
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight; // Carré ou rectangle selon l'espace

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
  }, []);

  // --- MOUSE EVENTS (Desktop) ---
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.closePath();
    setIsDrawing(false);
  };

  // --- TOUCH EVENTS (Mobile) ---
  // Il faut mapper les coordonnées touch aux coordonnées canvas
  const getTouchPos = (canvas, touchEvent) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: touchEvent.touches[0].clientX - rect.left,
      y: touchEvent.touches[0].clientY - rect.top
    };
  };

  const startTouch = (e) => {
    e.preventDefault(); // Empêche le scroll
    const pos = getTouchPos(canvasRef.current, e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const moveTouch = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const pos = getTouchPos(canvasRef.current, e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endTouch = (e) => {
    e.preventDefault(); // Important pour iOS
    stopDrawing();
  };

  const clearCanvas = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      onSave(dataUrl);
  };

  return (
    <div className="flex flex-col h-full">
        <div className="flex-1 bg-white rounded-2xl border-2 border-gray-100 overflow-hidden touch-none relative shadow-inner">
            <canvas
                ref={canvasRef}
                className="w-full h-full touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startTouch}
                onTouchMove={moveTouch}
                onTouchEnd={endTouch}
            />
        </div>
        
        <div className="flex justify-between items-center mt-4">
            <button 
                type="button"
                onClick={clearCanvas}
                className="p-3 text-gray-400 bg-gray-100 rounded-xl hover:bg-red-100 hover:text-red-500 transition-colors"
            >
                <Trash2 className="w-6 h-6" />
            </button>
            
            <button 
                type="button"
                onClick={handleSave}
                className="flex-1 ml-4 py-3 bg-deep-blue text-white font-bold rounded-xl shadow-lg shadow-deep-blue/20"
            >
                Envoyer le dessin
            </button>
        </div>
    </div>
  );
}
