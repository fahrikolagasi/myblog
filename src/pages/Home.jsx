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

                {/* Footer */}
                <footer className="w-full max-w-2xl mx-auto px-6 pb-8 text-center">
                    <p className="text-xs text-zinc-600 dark:text-zinc-500 font-medium">
                        &copy; {new Date().getFullYear()} Fahri Kolağası. Tüm hakları saklıdır.
                    </p>
                </footer>
            </main>

        </div>
    );
};

export default Home;
