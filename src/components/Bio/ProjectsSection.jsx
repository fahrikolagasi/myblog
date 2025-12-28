import React, { useEffect, useState, useRef } from 'react';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { motion } from "framer-motion";

const ProjectsSection = () => {
    const [projects, setProjects] = useState(() => {
        try {
            const saved = localStorage.getItem("projects_cache");
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    // Default loading to false if we have cached data
    const [loading, setLoading] = useState(projects.length === 0);
    const [width, setWidth] = useState(0);
    const carousel = useRef();

    useEffect(() => {
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProjects(items);
            localStorage.setItem("projects_cache", JSON.stringify(items));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (carousel.current) {
            setWidth(carousel.current.scrollWidth - carousel.current.offsetWidth);
        }
    }, [projects]);

    // Simplified: No Skeleton
    return (
        <div className="w-full max-w-4xl mx-auto mt-12 mb-20 px-4">
            <h2 className="text-2xl font-bold text-center mb-8 text-white drop-shadow-md">
                Yapılan İşler
            </h2>

            {/* Simplified: Removed draggable carousel for absolute stability, replaced with scrollable flex */}
            <div ref={carousel} className="overflow-x-auto pb-4 hide-scrollbar">
                <div
                    className="flex gap-6"
                >
                    {/* Project Cards */}
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="min-w-[280px] max-w-[280px] bg-zinc-900 rounded-xl overflow-hidden shadow-lg border border-zinc-700 relative group flex-shrink-0"
                        >
                            <div className="h-40 overflow-hidden relative">
                                <img
                                    src={project.thumbnailUrl}
                                    alt={project.title}
                                    loading="eager"
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
                        </div>
                    ))}

                    {/* "Coming Soon" Card */}
                    <div className="min-w-[280px] max-w-[280px] bg-zinc-900/50 rounded-xl border border-zinc-700 border-dashed flex items-center justify-center p-6 text-center flex-shrink-0">
                        <div>
                            <p className="text-2xl mb-2">🚀</p>
                            <h3 className="text-zinc-300 font-bold text-sm">Çok Yakında</h3>
                            <p className="text-zinc-500 text-xs mt-1">Yeni projelerimiz sizlerle olacak!</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProjectsSection;
