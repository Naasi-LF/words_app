"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function GestureLock() {
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [points, setPoints] = useState<number[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [error, setError] = useState(false);
    const [message, setMessage] = useState("Draw pattern to unlock");

    // Grid point coordinates (3x3)
    // 1 2 3
    // 4 5 6
    // 7 8 9
    const getPointCoordinates = (index: number, width: number, height: number) => {
        const cols = 3;
        const padding = 40;
        const cellWidth = (width - padding * 2) / (cols - 1);
        const cellHeight = (height - padding * 2) / (cols - 1);

        const row = Math.floor((index - 1) / cols);
        const col = (index - 1) % cols;

        return {
            x: padding + col * cellWidth,
            y: padding + row * cellHeight,
        };
    };

    const getPointAt = (x: number, y: number, width: number, height: number) => {
        const threshold = 30; // Hit radius
        for (let i = 1; i <= 9; i++) {
            const p = getPointCoordinates(i, width, height);
            if (Math.hypot(p.x - x, p.y - y) < threshold) {
                return i;
            }
        }
        return null;
    };

    const draw = (currentPos?: { x: number; y: number }) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Draw lines
        if (points.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = error ? "#FF6B6B" : "#FF8F70"; // Coral or Red
            ctx.lineWidth = 4;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            const start = getPointCoordinates(points[0], width, height);
            ctx.moveTo(start.x, start.y);

            for (let i = 1; i < points.length; i++) {
                const p = getPointCoordinates(points[i], width, height);
                ctx.lineTo(p.x, p.y);
            }

            if (currentPos && !error) {
                ctx.lineTo(currentPos.x, currentPos.y);
            }

            ctx.stroke();
        }

        // Draw points
        for (let i = 1; i <= 9; i++) {
            const p = getPointCoordinates(i, width, height);
            const isSelected = points.includes(i);

            ctx.beginPath();
            ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = isSelected ? (error ? "#FF6B6B" : "#FF8F70") : "#E8DCD4";
            ctx.fill();

            // Outer ring for selected
            if (isSelected) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
                ctx.fillStyle = error ? "rgba(255, 107, 107, 0.2)" : "rgba(255, 143, 112, 0.2)";
                ctx.fill();
            }
        }
    };

    useEffect(() => {
        draw();
    }, [points, error]);

    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        setError(false);
        setMessage("Release to verify");
        setPoints([]);

        // Prevent scrolling on touch
        if (e.type === 'touchstart') {
            document.body.style.overflow = 'hidden';
        }
    };

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || error) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const point = getPointAt(x, y, canvas.width, canvas.height);

        if (point && !points.includes(point)) {
            // Vibrate for feedback
            if (navigator.vibrate) navigator.vibrate(10);
            setPoints(prev => [...prev, point]);
        }

        draw({ x, y });
    };

    const handleEnd = async () => {
        setIsDrawing(false);
        draw(); // clear trailing line
        document.body.style.overflow = 'auto'; // Restore scrolling

        if (points.length < 4) {
            setPoints([]);
            setMessage("Pattern too short");
            return;
        }

        setMessage("Verifying...");

        const pattern = points.join("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pattern }),
            });

            if (res.ok) {
                setMessage("Unlocked! ✨");
                if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
                setTimeout(() => {
                    router.push("/");
                    router.refresh();
                }, 500);
            } else {
                setError(true);
                setMessage("Wrong pattern, try again");
                if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
                setTimeout(() => {
                    setPoints([]);
                    setError(false);
                    setMessage("Draw pattern to unlock");
                }, 1000);
            }
        } catch {
            setError(true);
            setMessage("Error verifying");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Welcome Back</h1>
                <p className={`text-sm tracking-widest uppercase transition-colors duration-300 ${error ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                    {message}
                </p>
            </div>

            <motion.div
                className="relative bg-white rounded-3xl shadow-soft p-4"
                animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
            >
                <canvas
                    ref={canvasRef}
                    width={300}
                    height={300}
                    className="touch-none cursor-crosshair"
                    onMouseDown={handleStart}
                    onMouseMove={handleMove}
                    onMouseUp={handleEnd}
                    onMouseLeave={handleEnd}
                    onTouchStart={handleStart}
                    onTouchMove={handleMove}
                    onTouchEnd={handleEnd}
                />
            </motion.div>
        </div>
    );
}
