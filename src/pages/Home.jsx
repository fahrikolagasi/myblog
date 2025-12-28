import React from 'react';
import ThemeToggleButton from '../components/UI/ThemeToggleButton';
import Contact from '../components/Contact';
import Hero from '../components/Bio/Hero';
import BioSection from '../components/Bio/BioSection';
import ServicesSection from '../components/Bio/ServicesSection';
import SocialGrid from '../components/Bio/SocialGrid';
import CodeRain from '../components/UI/CodeRain';
import SongOfTheDay from '../components/SongOfTheDay';
import ProjectsSection from '../components/Bio/ProjectsSection';
import ChatBot from '../components/ChatBot/ChatBot';
import SEO from '../components/SEO';

const Home = () => {
    return (
        // Global CSS handles background colors (Tokyo Night / White) via index.css
        <div className="min-h-screen transition-colors duration-300 font-sans selection:bg-green-500 selection:text-black relative overflow-hidden">

            {/* SEO Configuration */}
            <SEO />

            {/* Background Layer: Matrix Rain */}
            <CodeRain />

            {/* UI Layer */}
            <ThemeToggleButton />
            <ChatBot />

            {/* Main Content: Added backdrop-blur for readability over the rain */}
            <main className="relative z-10 flex flex-col items-center w-full max-w-xl mx-auto pt-10">

                {/* Optional: Add a subtle glassy backing to the main column for better text contrast if needed */}
                <div className="w-full px-4">
                    <Hero />

                    <BioSection />

                    <div className="mb-8 flex justify-center">
                        <SongOfTheDay />
                    </div>
                    <ServicesSection />
                    <ProjectsSection />
                    <SocialGrid />
                    <Contact />
                </div>

                <footer className="mt-12 text-center pb-8">
                    <div className="h-[1px] w-10 bg-zinc-300 dark:bg-white/20 mx-auto mb-4"></div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-500 uppercase tracking-widest opacity-70">
                        Wake Up, Neo...
                    </p>
                </footer>
            </main>

        </div>
    );
};

export default Home;
