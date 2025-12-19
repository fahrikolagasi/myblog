import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Typewriter = ({ words, delay = 100, pause = 2000 }) => {
    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);
    const [blink, setBlink] = useState(true);

    // Blinking cursor
    useEffect(() => {
        const timeout2 = setTimeout(() => {
            setBlink((prev) => !prev);
        }, 500);
        return () => clearTimeout(timeout2);
    }, [blink]);

    // Typing logic
    useEffect(() => {
        if (index >= words.length) {
            setIndex(0); // Loop back
            return;
        }

        if (subIndex === words[index].length + 1 && !reverse) {
            setTimeout(() => setReverse(true), pause);
            return;
        }

        if (subIndex === 0 && reverse) {
            setReverse(false);
            setIndex((prev) => (prev + 1) % words.length);
            return;
        }

        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, Math.max(reverse ? 75 : delay, parseInt(Math.random() * 50)));

        return () => clearTimeout(timeout);
    }, [subIndex, index, reverse, words, delay, pause]);

    return (
        <span className="font-mono text-neon-blue">
            {`${words[index].substring(0, subIndex)}${blink ? "|" : " "}`}
        </span>
    );
};

const Hero = () => {
    // Smoother scroll to projects
    const scrollToProjects = () => {
        const projectsSection = document.getElementById('projects');
        if (projectsSection) {
            projectsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
const Hero = () => {
            // Smoother scroll to projects
            const scrollToProjects = () => {
                const projectsSection = document.getElementById('projects');
                if (projectsSection) {
                    projectsSection.scrollIntoView({ behavior: 'smooth' });
                }
            };

            return (
                <section id="hero" className="relative w-full h-screen overflow-hidden bg-void-900 flex items-center justify-center text-white">

                    {/* Dynamic Background Elements */}
                    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                        {/* Gradient Blobs */}
                        <motion.div
                            animate={{
                                x: [0, 100, 0],
                                y: [0, -100, 0],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-neon-purple rounded-full mix-blend-multiply filter blur-[128px] opacity-40"
                        />
                        <motion.div
                            animate={{
                                x: [0, -100, 0],
                                y: [0, 100, 0],
                                scale: [1, 1.3, 1]
                            }}
                            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-neon-blue rounded-full mix-blend-multiply filter blur-[128px] opacity-40"
                        />
                        <motion.div
                            animate={{
                                x: [0, 50, 0],
                                y: [0, 50, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-[30%] right-[30%] w-[400px] h-[400px] bg-neon-pink rounded-full mix-blend-multiply filter blur-[100px] opacity-30"
                        />

                        {/* Grid Overlay for "Dev" aesthetic */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>
                        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] z-0 pointer-events-none"></div>
                    </div>

                    {/* Content Container */}
                    <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <h2 className="text-neon-blue font-mono text-lg tracking-widest mb-4 uppercase">
                                Hello, I'm
                            </h2>
                            <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 drop-shadow-lg">
                                A Creative Developer
                            </h1>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="text-2xl md:text-4xl font-light text-gray-300 mb-10 h-16"
                        >
                            I build beautiful and functional web experiences.
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                        >
                            <button
                                onClick={scrollToProjects}
                                className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full border border-glass-stroke text-white font-semibold transition-all duration-300 hover:scale-105 hover:border-neon-blue hover:shadow-[0_0_20px_rgba(0,212,255,0.5)]"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    View My Work <span className="group-hover:translate-x-1 transition-transform">↓</span>
                                </span>
                                <div className="absolute inset-0 bg-neon-blue opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                            </button>
                        </motion.div>
                    </div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
                    >
                        <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-white to-transparent opacity-50"></div>
                    </motion.div>

                </section>
            );
        };

    export default Hero;
