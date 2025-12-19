import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProjects } from '../services/api';
import { useTranslation } from 'react-i18next';

const ProjectCard = ({ project, index }) => {
    const { t } = useTranslation();
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className={`relative group overflow-hidden rounded-2xl border border-glass-stroke bg-glass-white backdrop-blur-md shadow-lg ${project.featured ? 'md:col-span-2 md:row-span-2' : ''
                }`}
        >
            {/* Background Image / Gradient */}
            <div className="absolute inset-0 z-0">
                {project.image ? (
                    <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-void-800 to-void-700 opacity-90" />
                )}
                <div className="absolute inset-0 bg-void-900/60 transition-opacity duration-300 group-hover:opacity-40" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                <h3 className="text-2xl font-bold text-white mb-2 transform transition-transform duration-300 group-hover:-translate-y-2">
                    {project.title || "Untitled Project"}
                </h3>
                <p className="text-gray-300 text-sm line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100">
                    {project.description || "A cutting-edge web application built with modern technologies."}
                </p>

                {/* Buttons */}
                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-200">
                    {project.demoUrl && (
                        <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-void-900 bg-neon-blue rounded-full hover:bg-white transition-colors"
                        >
                            {t('projects.visit')}
                        </a>
                    )}
                    {project.codeUrl && (
                        <a
                            href={project.codeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white border border-white/30 rounded-full hover:bg-white/10 transition-colors"
                        >
                            Code
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const SkeletonCard = ({ className }) => (
    <div className={`rounded-2xl bg-white/5 border border-white/5 overflow-hidden relative animate-pulse ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer" />
    </div>
);

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        const loadProjects = async () => {
            try {
                // Mock data fallback if fetch fails (since API keys are empty)
                const data = await fetchProjects().catch(() => [
                    { id: 1, title: "Neon E-Commerce", description: "Full stack shop with realtime inventory.", featured: true, image: "", demoUrl: "#", codeUrl: "#" },
                    { id: 2, title: "AI Dashboard", description: "Data visualization for ML models.", featured: false, image: "", demoUrl: "#", codeUrl: "#" },
                    { id: 3, title: "Crypto Tracker", description: "Realtime prices via WebSocket.", featured: false, image: "", demoUrl: "#", codeUrl: "#" },
                    { id: 4, title: "Social Graph", description: "Graph database visualization.", featured: false, image: "", demoUrl: "#", codeUrl: "#" },
                    { id: 5, title: "Portfolio V1", description: "My previous work.", featured: false, image: "", demoUrl: "#", codeUrl: "#" },
                ]);

                // If fetch returns empty (likely due to missing config), use mocks
                if (!data || data.length === 0) throw new Error("Empty");

                setProjects(data);
            } catch (err) {
                // Fallback mock data for visual demonstration
                setProjects([
                    { id: 1, title: "Neon E-Commerce", description: "Full stack shop with realtime inventory.", featured: true, image: "", demoUrl: "#", codeUrl: "#" },
                    { id: 2, title: "AI Dashboard", description: "Data visualization for ML models.", featured: false, image: "", demoUrl: "#", codeUrl: "#" },
                    { id: 3, title: "Crypto Tracker", description: "Realtime prices via WebSocket.", featured: false, image: "", demoUrl: "#", codeUrl: "#" },
                    { id: 4, title: "Social Graph", description: "Graph database visualization.", featured: false, image: "", demoUrl: "#", codeUrl: "#" },
                    { id: 5, title: "Portfolio V1", description: "My previous work.", featured: false, image: "", demoUrl: "#", codeUrl: "#" },
                ]);
            } finally {
                setLoading(false);
            }
        };

        loadProjects();
    }, []);

    return (
        <section id="projects" className="py-20 px-4 md:px-8 bg-void-900 min-h-screen text-white">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16 text-center"
                >
                    <h2 className="text-neon-purple font-mono text-sm tracking-widest uppercase mb-2">{t('projects.title')}</h2>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight">{t('projects.title')}</h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[300px] gap-6">
                    {loading ? (
                        <>
                            <SkeletonCard className="md:col-span-2 md:row-span-2" />
                            <SkeletonCard className="" />
                            <SkeletonCard className="" />
                            <SkeletonCard className="" />
                            <SkeletonCard className="" />
                        </>
                    ) : (
                        <AnimatePresence>
                            {projects.map((project, index) => (
                                <ProjectCard key={project.id} project={project} index={index} />
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
            {/* Custom Animation for Skeleton Shimmer */}
            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 1.5s infinite;
                }
            `}</style>
        </section>
    );
};


export default Projects;
