import React, { useEffect, useState, useRef } from 'react';
import { subscribeToSongOfTheDay } from '../services/spotify';
import { FaSpotify, FaPlay, FaPause, FaHeadphones } from 'react-icons/fa';

const SongOfTheDay = () => {
    const [song, setSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const audioRef = useRef(null);
    const PREVIEW_DURATION = 15; // seconds

    useEffect(() => {
        const unsubscribe = subscribeToSongOfTheDay((data) => {
            setSong(data);
        });
        return () => unsubscribe();
    }, []);

    const togglePlay = (e) => {
        e.preventDefault(); // Prevent link click
        e.stopPropagation();

        if (!audioRef.current || !song?.previewUrl) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
            setShowPrompt(false);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current && audioRef.current.currentTime >= PREVIEW_DURATION) {
            audioRef.current.pause();
            setIsPlaying(false);
            setShowPrompt(true); // Show "Continue on Spotify"
            audioRef.current.currentTime = 0; // Reset
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setShowPrompt(true);
    };

    if (!song) return null;

    return (
        <div className="relative group max-w-sm w-full mx-auto">
            {/* Hidden Audio Element */}
            {song.previewUrl && (
                <audio
                    ref={audioRef}
                    src={song.previewUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleEnded}
                />
            )}

            <a
                href={song.songUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-gray-900/80 rounded-xl backdrop-blur-md border border-green-500/20 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(29,185,84,0.3)] transition-all duration-500 relative overflow-hidden"
            >
                {/* Background Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                {/* Album Art Container */}
                <div className="relative shrink-0 w-20 h-20">
                    <div className="absolute inset-0 bg-green-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
                    <img
                        src={song.albumImageUrl}
                        alt={song.title}
                        className="relative w-full h-full object-cover rounded-md shadow-lg z-10 group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Play Button Overlay (within Image) */}
                    {song.previewUrl && (
                        <button
                            onClick={togglePlay}
                            className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"
                        >
                            {isPlaying ? (
                                <FaPause className="text-white drop-shadow-md" size={24} />
                            ) : (
                                <FaPlay className="text-white drop-shadow-md pl-1" size={24} />
                            )}
                        </button>
                    )}

                    <div className="absolute -bottom-2 -right-2 bg-[#1DB954] text-black p-1.5 rounded-full shadow-[0_0_10px_#1DB954] z-20">
                        <FaSpotify size={16} />
                    </div>
                </div>

                {/* Text Content */}
                <div className="min-w-0 flex-1 relative z-10 flex flex-col justify-center h-20">
                    <p className="text-xs font-bold text-green-400 mb-1 tracking-wider uppercase drop-shadow-[0_0_2px_rgba(74,222,128,0.5)]">
                        {isPlaying ? 'ÇALIYOR...' : 'GÜNÜN ŞARKISI'}
                    </p>
                    <h3 className="text-base font-bold text-white truncate leading-tight group-hover:text-green-300 transition-colors shadow-black drop-shadow-md">
                        {song.title}
                    </h3>
                    <p className="text-xs text-gray-400 truncate mt-1">
                        {song.artist}
                    </p>
                </div>

                {/* Animation Bars (Visible when playing) */}
                {isPlaying && (
                    <div className="flex gap-1 items-end h-8 pb-1 shrink-0 ml-2">
                        <div className="w-1 bg-green-500 h-3 animate-[bounce_1s_infinite]"></div>
                        <div className="w-1 bg-green-500 h-6 animate-[bounce_1.2s_infinite]"></div>
                        <div className="w-1 bg-green-500 h-4 animate-[bounce_0.8s_infinite]"></div>
                    </div>
                )}
            </a>

            {/* "Continue on Spotify" Prompt (Absolute Overlay) */}
            {showPrompt && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md rounded-xl text-center p-4 animate-in fade-in zoom-in duration-300">
                    <FaHeadphones className="text-green-500 mb-2" size={24} />
                    <p className="text-white text-sm font-bold mb-3">Beğendin mi?</p>
                    <a
                        href={song.songUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-bold rounded-full transition-colors flex items-center gap-2"
                    >
                        <FaSpotify />
                        Spotify'da Dinle
                    </a>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setShowPrompt(false);
                        }}
                        className="text-gray-400 text-[10px] mt-3 hover:text-white"
                    >
                        Kapat
                    </button>
                </div>
            )}
        </div>
    );
};

export default SongOfTheDay;
