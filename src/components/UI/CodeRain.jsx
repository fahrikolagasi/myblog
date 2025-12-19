import React, { useEffect, useRef } from 'react';

const CodeRain = () => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: -1000, y: -1000 }); // Initialize off-screen

    // Physics Configuration
    const PHYSICS = {
        friction: 0.92,      // Damping (0-1) - Lower stops faster
        spring: 0.05,        // Spring stiffness - Higher snaps back faster
        repulsion: 1.5,      // Push strength
        radius: 200,         // Interaction radius in pixels
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        let width = window.innerWidth;
        let height = window.innerHeight;

        canvas.width = width;
        canvas.height = height;

        const fontSize = 16;
        const columns = Math.ceil(width / fontSize);

        // Extended Drop Objects: { y: float, vx: float, xOffset: float }
        const drops = [];

        // Initialize drops with physics state
        for (let i = 0; i < columns; i++) {
            drops[i] = {
                y: Math.random() * -100,
                xOffset: 0,
                vx: 0
            };
        }

        const symbols = "{ } < > / ; * ! ? [ ] ( ) 0 1 _ + - = | \\ $ % & @ # :";
        const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        const characters = (symbols + latin).split("");

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        window.addEventListener('mousemove', handleMouseMove);

        const draw = () => {
            // Fade effect (Create trails)
            const isDark = document.documentElement.classList.contains('dark');

            // Smoother fade for better trails
            ctx.fillStyle = isDark ? 'rgba(26, 27, 38, 0.1)' : 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(0, 0, width, height);

            ctx.font = `${fontSize}px "Courier New", monospace`;

            // Mouse position
            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;

            for (let i = 0; i < drops.length; i++) {
                const drop = drops[i];
                const text = characters[Math.floor(Math.random() * characters.length)];

                // Color Logic
                if (isDark) {
                    ctx.fillStyle = Math.random() > 0.95 ? '#fff' : '#0F0';
                } else {
                    ctx.fillStyle = Math.random() > 0.90 ? '#000000' : '#15803d';
                }

                // Base Grid Position
                const bx = i * fontSize;
                const by = drop.y * fontSize;

                // --- ADVANCED PHYSICS ENGINE ---

                // 1. Calculate Distance to Mouse
                // We use drop.xOffset in calculation to allow for "chain reaction" (optional, but here simple repulsion)
                const actualX = bx + drop.xOffset;
                const dx = actualX - mx;
                const dy = by - my;
                const distSq = dx * dx + dy * dy;
                const dist = Math.sqrt(distSq);

                // 2. Apply Repulsion Force if within radius
                if (dist < PHYSICS.radius) {
                    const force = (PHYSICS.radius - dist) / PHYSICS.radius; // 0.0 to 1.0 (stronger when closer)
                    // Push away from mouse
                    // dx/dist is normalized vector X component
                    const angle = Math.atan2(dy, dx);

                    // We only affect X velocity/offset for the "column" effect (or can do Y too?)
                    // Let's affect X primarily to keep the rain "falling" but "bending"

                    const forceX = Math.cos(angle) * force * PHYSICS.repulsion;
                    // const forceY = Math.sin(angle) * force * PHYSICS.repulsion; // Optional: alter fall speed?

                    drop.vx += forceX;
                }

                // 3. Apply Spring Force (Pull back to 0 offset)
                // Hooke's Law: F = -k * x
                const springForce = -(drop.xOffset * PHYSICS.spring);
                drop.vx += springForce;

                // 4. Update Velocity with Friction
                drop.vx *= PHYSICS.friction;

                // 5. Update Position
                drop.xOffset += drop.vx;

                // -------------------------------

                // Draw at modified position
                ctx.fillText(text, bx + drop.xOffset, by);

                // Reset drop logic (Standard Matrix Rain)
                // Lower threshold = Faster restart = More density
                if (drop.y * fontSize > height && Math.random() > 0.940) {
                    drop.y = 0;
                }

                drop.y++;
            }
        };

        const interval = setInterval(draw, 33); // ~30FPS (Standard) -> try 33ms or 20ms for smoother physics

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };

    }, []);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            {/* High opacity for Light Mode (0.5), Low for Dark (0.2) */}
            <canvas ref={canvasRef} className="block w-full h-full opacity-[0.5] dark:opacity-[0.2]" />
        </div>
    );
};

export default CodeRain;
