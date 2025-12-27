import React, { useEffect, useState, useRef } from 'react';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { motion } from "framer-motion";

const ProjectsSection = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [width, setWidth] = useState(0);
    const carousel = useRef();

    useEffect(() => {
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProjects(items);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (carousel.current) {
            setWidth(carousel.current.scrollWidth - carousel.current.offsetWidth);
        }
    }, [projects]);

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto mt-12 mb-20 px-4">
                <div className="h-8 w-48 bg-zinc-800/50 rounded mx-auto mb-8 animate-pulse"></div>
                <div className="flex gap-6 overflow-hidden">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="min-w-[280px] h-64 bg-zinc-800/10 dark:bg-zinc-800/50 rounded-xl border border-white/5 animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto mt-12 mb-20 px-4">
            <h2 className="text-2xl font-bold text-center mb-8 text-white drop-shadow-md">
                Yapılan İşler
            </h2>

            <motion.div ref={carousel} className="cursor-grab overflow-hidden" whileTap={{ cursor: "grabbing" }}>
                <motion.div
                    drag="x"
                    dragConstraints={{ right: 0, left: -width }}
                    className="flex gap-6"
                >
                    {/* Project Cards */}
                    {projects.map((project) => (
                        <motion.div
                            key={project.id}
                            className="min-w-[280px] max-w-[280px] bg-zinc-900 rounded-xl overflow-hidden shadow-lg border border-zinc-700 relative group"
                        >
                            <div className="h-40 overflow-hidden relative">
                                <img
                                    src={project.thumbnailUrl}
                                    alt={project.title}
                                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-white font-bold truncate">{project.title}</h3>
                                <a
                                    href={project.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-green-400 mt-1 block hover:underline truncate"
                                >
                                    Siteyi Ziyaret Et
                                </a>
                            </div>
                        </motion.div>
                    ))}

                    {/* "Coming Soon" Card */}
                    <motion.div className="min-w-[280px] max-w-[280px] bg-zinc-900/50 rounded-xl border border-zinc-700 border-dashed flex items-center justify-center p-6 text-center">
                        <div>
                            <p className="text-2xl mb-2">🚀</p>
                            <h3 className="text-zinc-300 font-bold text-sm">Çok Yakında</h3>
                            <p className="text-zinc-500 text-xs mt-1">Yeni projelerimiz sizlerle olacak!</p>
                        </div>
                    </motion.div>

                </motion.div>
            </motion.div>
        </div>
    );
};

export default ProjectsSection;
