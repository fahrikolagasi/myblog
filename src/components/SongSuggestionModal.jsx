import React, { useState } from 'react';
import { FaSpotify, FaSearch, FaUser, FaTimes, FaCheck, FaPaperPlane } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { searchTracks } from '../services/spotify';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

const SongSuggestionModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1); // 1: Search, 2: Details & Submit
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedSong, setSelectedSong] = useState(null);
    const [visitorName, setVisitorName] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Env vars for Spotify (Public Safe? Ideally should be proxy, but using existing pattern)
    const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        setError('');
        setHasSearched(true);
        try {
            const results = await searchTracks(searchQuery, CLIENT_ID, CLIENT_SECRET);
            setSearchResults(results);
        } catch (err) {
            setError('Şarkı ararken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSong = (track) => {
        setSelectedSong({
            songTitle: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            albumImageUrl: track.album.images[0]?.url || '',
            previewUrl: track.preview_url || '',
            songUrl: track.external_urls.spotify
        });
        setStep(2);
    };

    const handleSubmit = async () => {
        if (!visitorName.trim()) {
            setError('Lütfen isminizi girin.');
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, "song_recommendations"), {
                ...selectedSong,
                suggestedBy: visitorName,
                status: 'pending',
                createdAt: serverTimestamp()
            });
            setSuccess(true);
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err) {
            console.error(err);
            setError('Öneri gönderilemedi. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
        // Reset state after animation
        setTimeout(() => {
            setStep(1);
            setSearchQuery('');
            setSearchResults([]);
            setSelectedSong(null);
            setVisitorName('');
            setSuccess(false);
            setError('');
            setHasSearched(false);
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-[#181818] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-[#282828]">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <FaSpotify className="text-[#1DB954]" size={20} />
                            Şarkı Öner
                        </h3>
                        <button onClick={handleClose} className="text-zinc-400 hover:text-white transition-colors">
                            <FaTimes />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 min-h-[300px] flex flex-col">

                        {success ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-black mb-2">
                                    <FaCheck size={32} />
                                </div>
                                <h4 className="text-xl font-bold text-white">Teşekkürler!</h4>
                                <p className="text-zinc-400">Önerin admin paneline iletildi. Yayınlanırsa burada görebilirsin!</p>
                            </div>
                        ) : step === 1 ? (
                            <div className="space-y-4">
                                <p className="text-sm text-zinc-400">
                                    Sizce sıradaki "Günün Şarkısı" ne olmalı? Spotify'da arayın ve önerin.
                                </p>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Şarkı veya sanatçı ara..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-zinc-700 rounded-full text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954] transition-all"
                                        autoFocus
                                    />
                                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    disabled={loading || !searchQuery}
                                    className="w-full py-3 bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-full transition-colors"
                                >
                                    {loading ? 'Aranıyor...' : 'Ara'}
                                </button>

                                {/* Results List */}
                                <div className="mt-4 space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                                    {searchResults.map(track => (
                                        <button
                                            key={track.id}
                                            onClick={() => handleSelectSong(track)}
                                            className="w-full flex items-center gap-3 p-2 hover:bg-[#282828] rounded-lg transition-colors text-left group"
                                        >
                                            <img src={track.album.images[2]?.url} alt="" className="w-10 h-10 rounded object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-white font-medium truncate group-hover:text-[#1DB954] transition-colors">{track.name}</div>
                                                <div className="text-xs text-zinc-400 truncate">{track.artists.map(a => a.name).join(', ')}</div>
                                            </div>
                                        </button>
                                    ))}
                                    {searchResults.length === 0 && hasSearched && !loading && (
                                        <div className="text-center text-zinc-600 text-sm py-4">Sonuç bulunamadı.</div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Step 2: Confirm & Name
                            <div className="space-y-6">
                                <button onClick={() => setStep(1)} className="text-zinc-500 hover:text-white text-sm flex items-center gap-1">
                                    ← Taramaya Dön
                                </button>

                                <div className="flex items-center gap-4 bg-[#282828] p-4 rounded-xl border border-zinc-700">
                                    <img src={selectedSong.albumImageUrl} alt="" className="w-16 h-16 rounded-lg shadow-lg" />
                                    <div>
                                        <h4 className="text-white font-bold">{selectedSong.songTitle}</h4>
                                        <p className="text-sm text-zinc-400">{selectedSong.artist}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs uppercase text-zinc-500 font-bold ml-1">İsminiz</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Adınız Soyadınız"
                                            value={visitorName}
                                            onChange={(e) => setVisitorName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954]"
                                        />
                                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    </div>
                                </div>

                                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full py-3 bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-bold rounded-full transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Gönderiliyor...' : <><FaPaperPlane /> Gönder</>}
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SongSuggestionModal;
