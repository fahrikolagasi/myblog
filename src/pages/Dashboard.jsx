import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSiteContent } from '../context/SiteContext';
import { FaUser, FaInfoCircle, FaTools, FaShareAlt, FaSignOutAlt, FaPlus, FaTrash, FaSave, FaSpotify, FaSearch, FaCheck, FaMusic, FaProjectDiagram, FaEnvelope, FaPaperPlane, FaLightbulb, FaComments } from 'react-icons/fa';
import { doc, getDoc, setDoc, collection, addDoc, deleteDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { searchTracks } from '../services/spotify';
import ChatHistory from '../components/ChatBot/ChatHistory';

// 1. Profile Editor Component (Defined OUTSIDE to prevent re-renders)
const ProfileEditor = ({ initialData, onSave }) => {
    const [formData, setFormData] = useState(initialData);

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Profil Ayarları</h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Sitenizin ana kimlik bilgilerini buradan yönetin.</p>
                </div>
                <button
                    onClick={() => onSave(formData)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all font-medium text-sm shadow-lg shadow-green-900/20 hover:shadow-green-900/40"
                >
                    <FaSave /> Kaydet
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Ad Soyad</label>
                        <div className="relative">
                            <input
                                name="name"
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/50 outline-none transition-all text-sm font-medium"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Adınız Soyadınız"
                            />
                            <FaUser className="absolute left-3.5 top-3.5 text-zinc-400 text-sm" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Ünvan</label>
                        <input
                            name="title"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/50 outline-none transition-all text-sm"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Örn: Yazılım Mühendisi"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Konum</label>
                        <input
                            name="location"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/50 outline-none transition-all text-sm"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="İl, Ülke"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Profil Fotoğrafı URL</label>
                        <input
                            name="image"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/50 outline-none transition-all text-sm"
                            value={formData.image}
                            onChange={handleChange}
                            placeholder="https://..."
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Özlü Söz / Slogan</label>
                    <textarea
                        name="quote"
                        className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/50 outline-none transition-all text-sm resize-none h-24"
                        value={formData.quote}
                        onChange={handleChange}
                        placeholder="Sizi yansıtan kısa bir söz..."
                    />
                </div>
            </div>
        </div>
    );
};

// 2. Bio Editor Component (UPDATED)
const BioEditor = ({ initialData, onSave }) => {
    // Default structure fallback
    const defaultBio = {
        about: '',
        mission: '',
        education: []
    };

    // Merge provided initialData with defaults to handle old data format if needed
    const [formData, setFormData] = useState({ ...defaultBio, ...initialData });
    const [newEdu, setNewEdu] = useState({ year: '', school: '', degree: '' });

    useEffect(() => {
        setFormData({ ...defaultBio, ...initialData });
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Education Actions
    const addEducation = () => {
        if (!newEdu.school) return;
        const newItem = { id: Date.now(), ...newEdu };
        setFormData(prev => ({
            ...prev,
            education: [...(prev.education || []), newItem]
        }));
        setNewEdu({ year: '', school: '', degree: '' });
    };

    const removeEducation = (id) => {
        setFormData(prev => ({
            ...prev,
            education: prev.education.filter(e => e.id !== id)
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Biyografi & Eğitim</h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Hakkımda, misyon ve eğitim detaylarınızı buradan düzenleyin.</p>
                </div>
                <button
                    onClick={() => onSave(formData)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all font-medium text-sm shadow-lg shadow-green-900/20 hover:shadow-green-900/40"
                >
                    <FaSave /> Güncelle
                </button>
            </div>

            {/* SECTIONS */}
            <div className="space-y-6">

                {/* 1. About */}
                <div className="bg-white dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <h3 className="font-bold text-sm mb-3 text-zinc-900 dark:text-white flex items-center gap-2">
                        <FaUser className="text-blue-500" /> Hakkımda
                    </h3>
                    <textarea
                        name="about"
                        placeholder="Kendinizi tanıtın..."
                        className="w-full h-32 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                        value={formData.about || ''}
                        onChange={handleChange}
                    />
                </div>

                {/* 2. Mission */}
                <div className="bg-white dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <h3 className="font-bold text-sm mb-3 text-zinc-900 dark:text-white flex items-center gap-2">
                        <FaLightbulb className="text-purple-500" /> Misyon
                    </h3>
                    <textarea
                        name="mission"
                        placeholder="Misyonunuz nedir?"
                        className="w-full h-24 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                        value={formData.mission || ''}
                        onChange={handleChange}
                    />
                </div>

                {/* 3. Education List */}
                <div className="bg-white dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <h3 className="font-bold text-sm mb-3 text-zinc-900 dark:text-white flex items-center gap-2">
                        <span className="text-green-500">🎓</span> Eğitim Geçmişi
                    </h3>

                    {/* List */}
                    <div className="space-y-2 mb-4">
                        {(formData.education || []).map(edu => (
                            <div key={edu.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                <div>
                                    <div className="font-bold text-sm text-zinc-900 dark:text-white">{edu.school}</div>
                                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{edu.degree} • {edu.year}</div>
                                </div>
                                <button
                                    onClick={() => removeEducation(edu.id)}
                                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <FaTrash size={12} />
                                </button>
                            </div>
                        ))}
                        {(formData.education || []).length === 0 && (
                            <div className="text-zinc-400 dark:text-zinc-600 text-xs italic text-center py-4 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl">Henüz eğitim bilgisi eklenmedi.</div>
                        )}
                    </div>

                    {/* Add Form */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-zinc-50 dark:bg-zinc-900/30 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <input
                            placeholder="Okul Adı"
                            className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 text-sm focus:outline-none focus:border-green-500"
                            value={newEdu.school}
                            onChange={e => setNewEdu({ ...newEdu, school: e.target.value })}
                        />
                        <input
                            placeholder="Bölüm / Derece"
                            className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 text-sm focus:outline-none focus:border-green-500"
                            value={newEdu.degree}
                            onChange={e => setNewEdu({ ...newEdu, degree: e.target.value })}
                        />
                        <input
                            placeholder="Yıl (2020 - 2024)"
                            className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 text-sm focus:outline-none focus:border-green-500"
                            value={newEdu.year}
                            onChange={e => setNewEdu({ ...newEdu, year: e.target.value })}
                        />
                        <button
                            onClick={addEducation}
                            className="col-span-1 md:col-span-3 mt-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg py-2 text-sm font-bold transition-colors"
                        >
                            <FaPlus className="inline mr-1" size={10} /> Ekle
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

// 3. Services Editor Component
const ServicesEditor = ({ services, onAdd, onDelete }) => {
    const [newService, setNewService] = useState({
        title: '',
        short: '',
        desc: '',
        iconName: 'FaCode'
    });

    const handleAdd = () => {
        if (newService.title) {
            onAdd(newService);
            setNewService({
                title: '',
                short: '',
                desc: '',
                iconName: 'FaCode'
            });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Hizmetler</h2>
                    <p className="text-xs text-zinc-500 mt-1">Sunduğunuz hizmetleri buradan yönetin.</p>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map(s => (
                    <div key={s.id} className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 relative group transition-all hover:border-green-500/30 hover:shadow-lg hover:shadow-green-900/10">
                        <button
                            onClick={() => onDelete(s.id)}
                            className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100"
                            title="Hizmeti Sil"
                        >
                            <FaTrash size={14} />
                        </button>
                        <div className="pr-8">
                            <h3 className="font-bold text-zinc-900 dark:text-white mb-1">{s.title}</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{s.short}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add New */}
            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800">
                <div className="mb-6">
                    <h3 className="font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-500 flex items-center justify-center">
                            <FaPlus size={12} />
                        </div>
                        Yeni Hizmet Ekle
                    </h3>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Hizmet Başlığı</label>
                            <input
                                placeholder="Örn: Web Tasarım"
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm"
                                value={newService.title}
                                onChange={e => setNewService({ ...newService, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Kısa Açıklama</label>
                            <input
                                placeholder="Kısa özet..."
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm"
                                value={newService.short}
                                onChange={e => setNewService({ ...newService, short: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Detaylı Açıklama</label>
                        <textarea
                            placeholder="Hizmet detayları..."
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm resize-none h-24"
                            value={newService.desc}
                            onChange={e => setNewService({ ...newService, desc: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">İkon Seçimi</label>
                        <select
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm"
                            value={newService.iconName}
                            onChange={e => setNewService({ ...newService, iconName: e.target.value })}
                        >
                            <option value="FaCode">Kod (FaCode)</option>
                            <option value="FaPaintBrush">Tasarım (FaPaintBrush)</option>
                            <option value="FaMobileAlt">Mobil (FaMobileAlt)</option>
                            <option value="FaSearch">SEO (FaSearch)</option>
                        </select>
                    </div>

                    <button
                        onClick={handleAdd}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40"
                    >
                        Hizmeti Ekle
                    </button>
                </div>
            </div>
        </div>
    );
};

// 4. Socials Editor Component
const SocialsEditor = ({ socials, onUpdate }) => {
    const [localSocials, setLocalSocials] = useState(socials);

    useEffect(() => {
        setLocalSocials(socials);
    }, [socials]);

    const handleChange = (id, value) => {
        setLocalSocials(prev => prev.map(s => s.id === id ? { ...s, url: value } : s));
    };

    const handleSave = () => {
        onUpdate(localSocials);
        alert("Sosyal medya linkleri güncellendi!");
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Sosyal Medya Linkleri</h2>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
                >
                    <FaSave /> Güncelle
                </button>
            </div>
            <div className="flex flex-col gap-3">
                {localSocials.map(link => (
                    <div key={link.id} className="p-4 bg-white dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                        <div className="font-bold text-zinc-700 dark:text-zinc-300 w-24">
                            {link.platform}
                        </div>
                        <div className="flex-1">
                            <label className="block text-[10px] uppercase text-zinc-500 mb-1">Profil Linki (URL)</label>
                            <div className="flex gap-2">
                                <input
                                    className="w-full p-2 rounded bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    value={link.url}
                                    onChange={(e) => handleChange(link.id, e.target.value)}
                                    placeholder={
                                        link.platform === 'Mail' || link.platform === 'E-posta'
                                            ? "ornek@email.com"
                                            : `https://${link.platform.toLowerCase()}.com/...`
                                    }
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 5. Spotify Editor Component
const SpotifyEditor = () => {
    const [songData, setSongData] = useState({
        title: '',
        artist: '',
        albumImageUrl: '',
        songUrl: '',
        previewUrl: ''
    });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Credentials state - defaulting to env vars
    const [credentials, setCredentials] = useState({
        clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID || '',
        clientSecret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || ''
    });

    useEffect(() => {
        const fetchSong = async () => {
            try {
                const docRef = doc(db, "metadata", "songOfTheDay");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSongData(docSnap.data());
                }
            } catch (error) {
                console.error("Error fetching song:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSong();
    }, []);

    const handleSearch = async () => {
        if (!searchQuery) return;
        setIsSearching(true);
        try {
            const results = await searchTracks(searchQuery, credentials.clientId, credentials.clientSecret);
            setSearchResults(results);
        } catch (error) {
            console.error("Search failed", error);
            alert("Arama başarısız. API anahtarlarınızı kontrol edin.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectSong = (track) => {
        const selectedSong = {
            title: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            albumImageUrl: track.album.images[0]?.url || '',
            songUrl: track.external_urls.spotify,
            previewUrl: track.preview_url || ''
        };
        setSongData(selectedSong);
        setSearchResults([]); // Clear results after selection
        setSearchQuery(''); // Optional: clear query
    };

    const handleSave = async () => {
        try {
            await setDoc(doc(db, "metadata", "songOfTheDay"), songData);
            alert("Günün Şarkısı güncellendi!");
        } catch (error) {
            console.error("Error saving song:", error);
            alert("Hata oluştu.");
        }
    };

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white"><FaSpotify className="text-green-500" /> Günün Şarkısı</h2>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
                >
                    <FaSave /> Yayına Al
                </button>
            </div>

            {/* API Credentials Section (Collapsible details style) */}
            <details className="bg-zinc-100 dark:bg-zinc-900/50 p-3 rounded-lg text-sm border border-zinc-200 dark:border-zinc-800">
                <summary className="cursor-pointer text-zinc-500 font-medium">Spotify API Ayarları</summary>
                <div className="mt-3 grid gap-3">
                    <div>
                        <label className="block text-xs uppercase text-zinc-500 mb-1">Client ID</label>
                        <input
                            value={credentials.clientId}
                            onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
                            className="w-full p-2 rounded border bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-zinc-500 mb-1">Client Secret</label>
                        <input
                            value={credentials.clientSecret}
                            onChange={(e) => setCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
                            type="password"
                            className="w-full p-2 rounded border bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400"
                        />
                    </div>
                </div>
            </details>

            {/* Search Section */}
            <div className="relative">
                <div className="flex gap-2">
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Şarkı veya sanatçı ara..."
                        className="flex-1 p-3 rounded-lg bg-white dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="px-6 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                        {isSearching ? '...' : <FaSearch />}
                    </button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 z-10 max-h-60 overflow-y-auto">
                        {searchResults.map(track => (
                            <div
                                key={track.id}
                                onClick={() => handleSelectSong(track)}
                                className="flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer border-b border-zinc-100 dark:border-zinc-700 last:border-0"
                            >
                                <img src={track.album.images[2]?.url} alt="" className="w-10 h-10 rounded object-cover" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm truncate text-zinc-900 dark:text-white">{track.name}</div>
                                    <div className="text-xs text-zinc-500 truncate">{track.artists.map(a => a.name).join(', ')}</div>
                                </div>
                                <FaPlus className="text-zinc-400" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected Song Preview */}
            <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                    <div className="relative group">
                        {songData.albumImageUrl ? (
                            <img src={songData.albumImageUrl} alt="Album Art" className="w-32 h-32 rounded-lg shadow-lg object-cover" />
                        ) : (
                            <div className="w-32 h-32 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-400">
                                <FaMusic size={32} />
                            </div>
                        )}
                    </div>
                    <div className="space-y-2 flex-1 w-full">
                        <div>
                            <label className="block text-xs uppercase text-zinc-500 dark:text-zinc-400 mb-1">Şarkı Başlığı</label>
                            <input
                                name="title"
                                value={songData.title}
                                onChange={(e) => setSongData({ ...songData, title: e.target.value })}
                                className="w-full p-2 bg-transparent border-b border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-green-500 outline-none font-bold text-lg"
                                placeholder="Başlık"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-zinc-500 dark:text-zinc-400 mb-1">Sanatçı</label>
                            <input
                                name="artist"
                                value={songData.artist}
                                onChange={(e) => setSongData({ ...songData, artist: e.target.value })}
                                className="w-full p-2 bg-transparent border-b border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-green-500 outline-none"
                                placeholder="Sanatçı"
                            />
                        </div>
                        {songData.previewUrl && (
                            <div className="pt-2">
                                <audio controls src={songData.previewUrl} className="w-full h-8" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 6. Projects Editor Component
const ProjectsEditor = () => {
    const [projects, setProjects] = useState([]);
    const [newProject, setNewProject] = useState({ title: '', url: '', customImageUrl: '' });
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null); // ID of project being edited

    // Fetch projects
    useEffect(() => {
        const q = collection(db, "projects");
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProjects(items);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleEdit = (project) => {
        setNewProject({
            title: project.title,
            url: project.url,
            customImageUrl: project.thumbnailUrl // Use current thumb as custom URL placeholder or keep separate?
            // Simplified: just put current URL in customImageUrl effectively pre-filling it
        });
        setImageFile(null); // Reset file input
        setEditingId(project.id);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setNewProject({ title: '', url: '', customImageUrl: '' });
        setImageFile(null);
        setEditingId(null);
    };

    const handleSave = async () => {
        if (!newProject.title || !newProject.url) {
            alert("Lütfen başlık ve Proje URL girin.");
            return;
        }

        setUploading(true);
        try {
            let finalThumbnailUrl = newProject.customImageUrl;

            if (editingId) {
                // UPDATE MODE
                const projectRef = doc(db, "projects", editingId);
                const updates = {
                    title: newProject.title,
                    url: newProject.url,
                };

                // Only update thumbnail if changed
                if (imageFile) {
                    const storageRef = ref(storage, `projects/${Date.now()}_${imageFile.name}`);
                    const snapshot = await uploadBytes(storageRef, imageFile);
                    updates.thumbnailUrl = await getDownloadURL(snapshot.ref);
                } else if (newProject.customImageUrl && newProject.customImageUrl !== projects.find(p => p.id === editingId).thumbnailUrl) {
                    // If user manually changed the URL text
                    updates.thumbnailUrl = newProject.customImageUrl;
                }

                await setDoc(projectRef, updates, { merge: true });
                alert("Proje güncellendi!");
            } else {
                // ADD MODE
                // Fallback auto-gen only for ADD mode or if explicitly wanted?
                if (!finalThumbnailUrl && !imageFile) {
                    finalThumbnailUrl = `https://image.thum.io/get/width/600/crop/800/${newProject.url}`;
                }

                if (imageFile) {
                    const storageRef = ref(storage, `projects/${Date.now()}_${imageFile.name}`);
                    const snapshot = await uploadBytes(storageRef, imageFile);
                    finalThumbnailUrl = await getDownloadURL(snapshot.ref);
                }

                await addDoc(collection(db, "projects"), {
                    ...newProject,
                    thumbnailUrl: finalThumbnailUrl || '',
                    createdAt: new Date()
                });
                alert("Proje başarıyla eklendi!");
            }

            // Reset
            setNewProject({ title: '', url: '', customImageUrl: '' });
            setImageFile(null);
            setEditingId(null);

        } catch (error) {
            console.error("Error saving project:", error);
            alert("İşlem sırasında hata oluştu: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bu projeyi silmek istediğinize emin misiniz?")) {
            try {
                await deleteDoc(doc(db, "projects", id));
                if (editingId === id) handleCancelEdit();
            } catch (error) {
                console.error("Error deleting:", error);
            }
        }
    };

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                <FaProjectDiagram className="text-blue-500" /> Yapılan İşler (Portfolyo)
            </h2>

            {/* Add/Edit Project Form */}
            <div className={`p-6 rounded-2xl border transition-colors ${editingId ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-700' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className={`font-bold text-sm uppercase ${editingId ? 'text-yellow-800 dark:text-yellow-200' : 'text-blue-800 dark:text-blue-200'}`}>
                        {editingId ? 'Projeyi Düzenle' : 'Yeni Proje Ekle'}
                    </h3>
                    {editingId && (
                        <button onClick={handleCancelEdit} className="text-xs text-red-500 hover:underline">Vazgeç</button>
                    )}
                </div>

                <div className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Proje Başlığı</label>
                            <input
                                value={newProject.title}
                                onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm"
                                placeholder="Örn: E-Ticaret Sitesi"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Proje URL (Ziyaret Linki)</label>
                            <input
                                value={newProject.url}
                                onChange={e => setNewProject({ ...newProject, url: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className={`border-t pt-6 ${editingId ? 'border-yellow-200 dark:border-yellow-800/50' : 'border-blue-200 dark:border-blue-800/50'}`}>
                        <label className="block text-xs uppercase text-zinc-500 dark:text-zinc-400 mb-3 font-bold">Kapak Fotoğrafı {editingId ? '(Değiştirmek İsterseniz)' : '(İsteğe Bağlı)'}</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <span className="text-xs text-zinc-400 block mb-1">Seçenek 1: Dosya Yükle</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-100 dark:file:bg-blue-900/40 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-200 dark:hover:file:bg-blue-900/60 transition-all cursor-pointer"
                                />
                            </div>
                            <div className="space-y-2">
                                <span className="text-xs text-zinc-400 block mb-1">Seçenek 2: Görsel Linki Yapıştır</span>
                                <input
                                    value={newProject.customImageUrl}
                                    onChange={e => setNewProject({ ...newProject, customImageUrl: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm"
                                    placeholder={editingId ? "Mevcut URL korunur" : "https://imgur.com/..."}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={uploading}
                            className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all ${editingId ? 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-900/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'} disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
                        >
                            {uploading ? 'İşleniyor...' : (editingId ? 'Değişiklikleri Kaydet' : 'Projeyi Ekle')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Projects List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map(project => (
                    <div key={project.id} className={`relative group bg-white dark:bg-zinc-900/50 rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all ${editingId === project.id ? 'ring-2 ring-yellow-500 border-yellow-500' : 'border-zinc-200 dark:border-zinc-800'}`}>
                        <div className="aspect-video bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden group-inner">
                            <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute bottom-0 left-0 bg-black/60 text-white text-[10px] px-2 py-1 backdrop-blur-sm rounded-tr-lg">
                                {project.thumbnailUrl && project.thumbnailUrl.includes('firebasestorage') ? '🔥 Storage' : '🔗 Link/Auto'}
                            </div>
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-zinc-900 dark:text-white truncate mb-1">{project.title}</h4>
                            <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:text-blue-400 hover:underline truncate block">
                                {project.url}
                            </a>
                        </div>

                        {/* Actions */}
                        <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleEdit(project)}
                                className="bg-yellow-500 text-white p-2 rounded-xl shadow-lg hover:bg-yellow-600 transition-colors"
                                title="Düzenle"
                            >
                                <FaTools size={12} />
                            </button>
                            <button
                                onClick={() => handleDelete(project.id)}
                                className="bg-red-600 text-white p-2 rounded-xl shadow-lg hover:bg-red-700 transition-colors"
                                title="Sil"
                            >
                                <FaTrash size={12} />
                            </button>
                        </div>
                    </div>
                ))}
                {projects.length === 0 && (
                    <div className="col-span-2 text-center py-12 text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                        Henüz proje eklenmemiş.
                    </div>
                )}
            </div>
        </div>
    );
};

// 7. Messages Viewer Component (Inbox)
const MessagesViewer = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Real-time listener for messages
        const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() // Convert Firestore Timestamp
            }));
            setMessages(msgs);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bu mesajı silmek istediğinize emin misiniz?")) {
            await deleteDoc(doc(db, "messages", id));
        }
    };

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <FaEnvelope className="text-purple-500" /> Gelen Kutusu ({messages.length})
            </h2>

            <div className="space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
                        <FaEnvelope className="mx-auto text-4xl text-zinc-300 mb-2" />
                        <p className="text-zinc-500">Henüz hiç mesaj yok.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className="bg-white dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm relative group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                                        <FaUser className="text-zinc-400 text-xs" /> {msg.name}
                                    </h3>
                                    <p className="text-sm text-zinc-500 flex items-center gap-1">
                                        {msg.email}
                                    </p>
                                </div>
                                <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded">
                                    {msg.createdAt?.toLocaleDateString('tr-TR')} {msg.createdAt?.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-wrap mb-4 border border-zinc-100 dark:border-zinc-800">
                                {msg.message}
                            </div>

                            <div className="flex justify-end gap-3">
                                <a
                                    href={`mailto:${msg.email}?subject=Re: İletişim Formu Mesajınız&body=Merhaba ${msg.name},\n\nMesajınız için teşekkürler.\n\n>`}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                >
                                    <FaPaperPlane size={12} /> Yanıtla
                                </a>
                                <button
                                    onClick={() => handleDelete(msg.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                >
                                    <FaTrash size={12} /> Sil
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// 8. Recommendations Editor Component
const RecommendationsEditor = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "song_recommendations"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setRecommendations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handlePublish = async (rec) => {
        if (window.confirm(`${rec.suggestedBy} tarafından önerilen "${rec.songTitle}" şarkısını yayınlamak istiyor musunuz?`)) {
            try {
                // 1. Set as Song of the Day
                await setDoc(doc(db, "metadata", "songOfTheDay"), {
                    title: rec.songTitle,
                    artist: rec.artist,
                    albumImageUrl: rec.albumImageUrl,
                    songUrl: rec.songUrl,
                    previewUrl: rec.previewUrl || ''
                });

                // 2. Delete recommendation (or mark as done)
                await deleteDoc(doc(db, "song_recommendations", rec.id));

                alert("Şarkı yayına alındı!");
            } catch (error) {
                console.error("Error publishing song:", error);
                alert("Hata oluştu.");
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bu öneriyi silmek istediğinize emin misiniz?")) {
            try {
                await deleteDoc(doc(db, "song_recommendations", id));
            } catch (error) {
                console.error("Error deleting:", error);
            }
        }
    };

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <FaLightbulb className="text-indigo-500" /> Şarkı Önerileri ({recommendations.length})
            </h2>

            {recommendations.length === 0 && (
                <div className="text-center py-12 text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700">
                    Henüz şarkı önerisi gelmemiş.
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {recommendations.map(rec => (
                    <div key={rec.id} className="bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <img src={rec.albumImageUrl} alt="" className="w-16 h-16 rounded-md shadow-sm object-cover" />

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase rounded-full tracking-wider">
                                    ÖNEREN: {rec.suggestedBy}
                                </span>
                            </div>
                            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{rec.songTitle}</h3>
                            <p className="text-sm text-zinc-500 truncate">{rec.artist}</p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            <a
                                href={rec.songUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-zinc-400 hover:text-green-500 transition-colors"
                                title="Spotify'da Dinle"
                            >
                                <FaSpotify size={20} />
                            </a>
                            <button
                                onClick={() => handlePublish(rec)}
                                className="flex-1 sm:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
                            >
                                <FaCheck className="inline mr-2" /> Yayınla
                            </button>
                            <button
                                onClick={() => handleDelete(rec.id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Sil"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { content, updateProfile, updateBio, addService, deleteService, updateSocial, updateAllSocials, resetToDefaults } = useSiteContent();
    const { profile, bio, services, socials } = content;
    const [activeTab, setActiveTab] = useState('profile');
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    const handleProfileSave = (newData) => {
        updateProfile(newData);
        alert("Profil bilgileri için 'Güncelle' işlemi başarılı!");
    };

    const handleBioSave = (newData) => {
        updateBio(newData);
        alert("Biyografi bilgileri için 'Güncelle' işlemi başarılı!");
    };

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex font-sans selection:bg-green-500/30">
            {/* Sidebar */}
            <div className="w-72 bg-zinc-900/50 backdrop-blur-xl border-r border-zinc-800 flex flex-col p-6 fixed h-full overflow-y-auto z-20">
                <div className="mb-10 mt-2 flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-black shadow-lg shadow-green-500/20">
                        <FaTools size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-white leading-tight">Yönetim</h1>
                        <p className="text-xs text-zinc-500">Panel v2.0</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1.5">
                    <div className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-3 pl-3">İçerik</div>
                    <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'profile' ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm' : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200'}`}>
                        <FaUser /> Profil
                    </button>
                    <button onClick={() => setActiveTab('bio')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'bio' ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm' : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200'}`}>
                        <FaInfoCircle /> Biyografi
                    </button>
                    <button onClick={() => setActiveTab('services')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'services' ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm' : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200'}`}>
                        <FaTools /> Hizmetler
                    </button>
                    <button onClick={() => setActiveTab('projects')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'projects' ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm' : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200'}`}>
                        <FaProjectDiagram /> Projeler
                    </button>

                    <div className="h-px bg-zinc-800 my-4 mx-2"></div>

                    <div className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-3 pl-3">Etkileşim</div>
                    <button onClick={() => setActiveTab('chat_history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'chat_history' ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-sm' : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200'}`}>
                        <FaComments /> Sohbetler
                    </button>
                    <button onClick={() => setActiveTab('messages')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'messages' ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm' : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200'}`}>
                        <FaEnvelope /> Gelen Kutusu
                    </button>
                    <button onClick={() => setActiveTab('socials')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'socials' ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm' : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200'}`}>
                        <FaShareAlt /> Sosyal Medya
                    </button>
                    <button onClick={() => setActiveTab('spotify')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'spotify' ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm' : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200'}`}>
                        <FaSpotify /> Günün Şarkısı
                    </button>
                    <button onClick={() => setActiveTab('recommendations')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'recommendations' ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm' : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200'}`}>
                        <FaLightbulb /> Öneriler
                    </button>
                </nav>

                <div className="pt-4 border-t border-zinc-800 mt-4 space-y-2">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                        <FaSignOutAlt /> Çıkış Yap
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-72 p-8 min-h-screen">
                <div className="max-w-5xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    {/* Render active tab content */}
                    {activeTab === 'profile' && <ProfileEditor initialData={profile} onSave={handleProfileSave} />}
                    {activeTab === 'bio' && <BioEditor initialData={bio} onSave={handleBioSave} />}
                    {activeTab === 'services' && <ServicesEditor services={services} onAdd={addService} onDelete={deleteService} />}
                    {activeTab === 'projects' && <ProjectsEditor />}
                    {activeTab === 'chat_history' && <ChatHistory />}
                    {activeTab === 'messages' && <MessagesViewer />}
                    {activeTab === 'socials' && <SocialsEditor socials={socials} onUpdate={updateAllSocials} />}
                    {activeTab === 'spotify' && <SpotifyEditor />}
                    {activeTab === 'recommendations' && <RecommendationsEditor />}
                </div>


                <div className="h-24"></div> {/* Bottom Spacer */}

                {/* Floating Preview Button */}
                <div className="fixed bottom-8 right-8 z-50">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold shadow-2xl hover:scale-105 hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] transition-all duration-300 transform"
                    >
                        Siteyi Görüntüle →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
