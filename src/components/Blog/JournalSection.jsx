import React from 'react';
import { motion } from 'framer-motion';

const articles = [
    {
        id: 1,
        category: "Design",
        date: "Dec 18, 2024",
        title: "The Beauty of Void",
        snippet: "Exploring negative space in modern UI design.",
        image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2000&auto=format&fit=crop"
    },
    {
        id: 2,
        category: "Development",
        date: "Nov 12, 2024",
        title: "React Server Components",
        snippet: "A deep dive into the future of React.",
        image: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=2000&auto=format&fit=crop"
    },
    {
        id: 3,
        category: "Philosophy",
        date: "Oct 25, 2024",
        title: "Digital Minimalism",
        snippet: "Why less is more in a crowded web.",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2000&auto=format&fit=crop"
    }
];

const ArticleCard = ({ article, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        viewport={{ once: true }}
        className="group relative flex-shrink-0 w-[300px] md:w-[400px] flex flex-col gap-4 cursor-pointer"
    >
        {/* Image Container */}
        <div className="relative h-[250px] w-full overflow-hidden rounded-sm bg-gray-900">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
            <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale group-hover:grayscale-0"
            />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-sans tracking-widest text-gray-500 uppercase">
                <span>{article.category}</span>
                <span>{article.date}</span>
            </div>
            <h3 className="text-2xl font-serif text-gray-200 group-hover:text-luxury-gold transition-colors duration-300">
                {article.title}
            </h3>
            <p className="text-sm text-gray-400 font-sans leading-relaxed">
                {article.snippet}
            </p>
            <span className="text-xs text-white uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                Read Article →
            </span>
        </div>
    </motion.div>
);

const JournalSection = () => {
    return (
        <section className="py-20 px-6 md:px-20 bg-luxury-black border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                        <h2 className="font-serif text-4xl md:text-5xl text-white mb-2">The Journal</h2>
                        <p className="text-gray-400 font-sans">Thoughts, stories, and ideas.</p>
                    </div>
                    <a href="#" className="text-xs font-bold uppercase tracking-widest text-luxury-gold hover:text-white transition-colors">
                        View Archive
                    </a>
                </div>

                {/* Articles Scroll */}
                <div className="flex gap-8 overflow-x-auto pb-10 scrollbar-hide">
                    {articles.map((article, index) => (
                        <ArticleCard key={article.id} article={article} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default JournalSection;
