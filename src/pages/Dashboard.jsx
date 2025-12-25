import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSiteContent } from '../context/SiteContext';
import { FaUser, FaInfoCircle, FaTools, FaShareAlt, FaSignOutAlt, FaPlus, FaTrash, FaSave, FaSpotify, FaSearch, FaCheck, FaMusic, FaProjectDiagram, FaEnvelope, FaPaperPlane, FaLightbulb, FaComments } from 'react-icons/fa';
import { doc, getDoc, setDoc, collection, addDoc, deleteDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebaseConfig";
import { searchTracks } from '../services/spotify';
import ChatHistory from '../components/ChatBot/ChatHistory';

// 1. Profile Editor Component (Defined OUTSIDE to prevent re-renders)
const ProfileEditor = ({ initialData, onSave }) => {
    const [formData, setFormData] = useState(initialData);

    // Sync with initialData if it changes externally (e.g. reset)
    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Profil Ayarları</h2>
                <button
                    onClick={() => onSave(formData)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
                >
                    <FaSave /> Güncelle
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2 space-y-2">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-700 pb-2">Temel Bilgiler</h3>
                </div>
                <div>
                    <label className="block text-xs uppercase text-zinc-500 mb-1">Ad Soyad (Ortak)</label>
                    <input
                        name="name"
                        className="w-full p-2 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-xs uppercase text-zinc-500 mb-1">Profil Resmi URL</label>
                    <input
                        name="image"
                        className="w-full p-2 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={formData.image}
                        onChange={handleChange}
                    />
                </div>

                {/* TURKISH SECTION */}
                <div className="col-span-1 md:col-span-2 mt-4 space-y-2">
                    <h3 className="font-bold text-xs flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                        <img src="https://flagcdn.com/w20/tr.png" className="w-4 h-auto" /> Türkçe İçerik
                    </h3>
                </div>
                <div>
                    <label className="block text-xs uppercase text-zinc-500 mb-1">Ünvan (TR)</label>
                    <input
                        name="title"
                        className="w-full p-2 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={formData.title}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-xs uppercase text-zinc-500 mb-1">Konum (TR)</label>
                    <input
                        name="location"
                        className="w-full p-2 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={formData.location}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs uppercase text-zinc-500 mb-1">Özlü Söz (TR)</label>
                    <textarea
                        name="quote"
                        className="w-full p-2 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-16"
                        value={formData.quote}
                        onChange={handleChange}
                    />
                </div>


                {/* AUTO-TRANSLATION NOTICE */}
                <div className="col-span-1 md:col-span-2 mt-4 space-y-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800">
                    <p className="text-xs text-blue-600 dark:text-blue-300 flex items-center gap-2">
                        <FaInfoCircle /> İngilizce çeviriler kaydettiğinizde otomatik olarak oluşturulacaktır.
                    </p>
                </div>
            </div>
        </div>
    );
};

// 2. Bio Editor Component
const BioEditor = ({ initialData, onSave }) => {
    const [formData, setFormData] = useState(initialData);

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Biyografi Düzenle</h2>
                <button
                    onClick={() => onSave(formData)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
                >
                    <FaSave /> Güncelle
                </button>
            </div>

            {/* TR Bio ONLY - EN auto-generated */}
            <div className="space-y-4 border p-4 rounded-lg border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-xs flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                        <img src="https://flagcdn.com/w20/tr.png" className="w-4 h-auto" /> Türkçe Biyografi
                    </h3>
                    <span className="text-[10px] text-zinc-400 italic">İngilizce çeviri otomatiktir.</span>
                </div>
                <div>
                    <label className="block text-xs uppercase text-zinc-500 mb-1">Hakkımda Metni</label>
                    <textarea
                        name="aboutText"
                        className="w-full h-24 p-2 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={formData.aboutText}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-xs uppercase text-zinc-500 mb-1">Paragraf 1</label>
                    <textarea
                        name="text1"
                        className="w-full h-24 p-2 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={formData.text1}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-xs uppercase text-zinc-500 mb-1">Paragraf 2</label>
                    <textarea
                        name="text2"
                        className="w-full h-24 p-2 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={formData.text2}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );
};

// 3. Services Editor Component
const ServicesEditor = ({ services, onAdd, onDelete }) => {
    // Only 'new service' inputs need local state here, list comes from props
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
        <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4">Hizmetler</h2>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map(s => (
                    <div key={s.id} className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 relative group shadow-sm hover:shadow-md transition-shadow">
                        <button
                            onClick={() => onDelete(s.id)}
                            className="absolute top-2 right-2 text-zinc-400 hover:text-red-500 transition-colors p-1"
                            title="Hizmeti Sil"
                        >
                            <FaTrash />
                        </button>
                        <h3 className="font-bold pr-6 text-zinc-800 dark:text-zinc-100">{s.title}</h3>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{s.short}</p>
                        <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-700 flex justify-between items-center">
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">EN</span>
                                <span className="text-xs text-zinc-400 truncate max-w-[150px]">{s.title_en || 'Çevriliyor...'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add New */}
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mt-6">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold flex items-center gap-2 text-blue-800 dark:text-blue-100"> <FaPlus /> Yeni Hizmet Ekle</h3>
                    <span className="text-[10px] text-blue-600 dark:text-blue-300 opacity-70">Otomatik Çeviri Aktif</span>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4">
                    {/* TR INPUTS ONLY */}
                    <div className="space-y-2">
                        <input
                            placeholder="Başlık (Örn: Web Tasarım)"
                            className="w-full p-2 rounded border border-blue-200 dark:border-blue-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newService.title}
                            onChange={e => setNewService({ ...newService, title: e.target.value })}
                        />
                        <input
                            placeholder="Kısa Açıklama"
                            className="w-full p-2 rounded border border-blue-200 dark:border-blue-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newService.short}
                            onChange={e => setNewService({ ...newService, short: e.target.value })}
                        />
                        <textarea
                            placeholder="Detaylı Açıklama"
                            className="w-full p-2 rounded border border-blue-200 dark:border-blue-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20"
                            value={newService.desc}
                            onChange={e => setNewService({ ...newService, desc: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <span className="text-xs font-bold text-zinc-500">İKON</span>
                    <select
                        className="w-full p-2 rounded border border-blue-200 dark:border-blue-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none"
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
                    className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium transition-colors shadow-sm"
                >
                    Hizmeti Ekle
                </button>
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
        localSocials.forEach(s => onUpdate(s.id, { url: s.url }));
        alert("Sosyal medya linkleri güncellendi!");
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Sosyal Medya Linkleri</h2>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
                >
                    <FaSave /> Güncelle
                </button>
            </div>
            <div className="flex flex-col gap-3">
                {localSocials.map(link => (
                    <div key={link.id} className="p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center gap-4">
                        <div className="font-bold text-zinc-700 dark:text-zinc-300 w-24">
                            {link.platform}
                        </div>
                        <div className="flex-1">
                            <label className="block text-[10px] uppercase text-zinc-500 mb-1">Profil Linki (URL)</label>
                            <div className="flex gap-2">
                                <input
                                    className="w-full p-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    value={link.url}
                                    onChange={(e) => handleChange(link.id, e.target.value)}
                                    placeholder={`https://${link.platform.toLowerCase()}.com/...`}
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
                <h2 className="text-xl font-bold flex items-center gap-2"><FaSpotify className="text-green-500" /> Günün Şarkısı</h2>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
                >
                    <FaSave /> Yayına Al
                </button>
            </div>

            {/* API Credentials Section (Collapsible details style) */}
            <details className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg text-sm">
                <summary className="cursor-pointer text-zinc-500 font-medium">Spotify API Ayarları</summary>
                <div className="mt-3 grid gap-3">
                    <div>
                        <label className="block text-xs uppercase text-zinc-500 mb-1">Client ID</label>
                        <input
                            value={credentials.clientId}
                            onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
                            className="w-full p-2 rounded border dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-zinc-500 mb-1">Client Secret</label>
                        <input
                            value={credentials.clientSecret}
                            onChange={(e) => setCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
                            type="password"
                            className="w-full p-2 rounded border dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
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
                        className="flex-1 p-3 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
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
                                    <div className="font-bold text-sm truncate">{track.name}</div>
                                    <div className="text-xs text-zinc-500 truncate">{track.artists.map(a => a.name).join(', ')}</div>
                                </div>
                                <FaPlus className="text-zinc-400" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected Song Preview */}
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
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
                            <label className="block text-xs uppercase text-zinc-500 mb-1">Şarkı Başlığı</label>
                            <input
                                name="title"
                                value={songData.title}
                                onChange={(e) => setSongData({ ...songData, title: e.target.value })}
                                className="w-full p-2 bg-transparent border-b border-zinc-200 dark:border-zinc-700 focus:border-green-500 outline-none font-bold text-lg"
                                placeholder="Başlık"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-zinc-500 mb-1">Sanatçı</label>
                            <input
                                name="artist"
                                value={songData.artist}
                                onChange={(e) => setSongData({ ...songData, artist: e.target.value })}
                                className="w-full p-2 bg-transparent border-b border-zinc-200 dark:border-zinc-700 focus:border-green-500 outline-none"
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

            // If editing and no new image provided/entered, keep the old one (logic below handles this)
            // But we need to know the OLD url if we want to keep it.
            // For simplicity: if customImageUrl is empty and file is empty, we might keep old URL.
            // Let's refactor slightly:

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
            <h2 className="text-xl font-bold flex items-center gap-2">
                <FaProjectDiagram className="text-blue-500" /> Yapılan İşler (Portfolyo)
            </h2>

            {/* Add/Edit Project Form */}
            <div className={`p-4 rounded-lg border transition-colors ${editingId ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'}`}>
                <div className="flex justify-between items-center mb-3">
                    <h3 className={`font-bold text-sm uppercase ${editingId ? 'text-yellow-800 dark:text-yellow-200' : 'text-blue-800 dark:text-blue-200'}`}>
                        {editingId ? 'Projeyi Düzenle' : 'Yeni Proje Ekle'}
                    </h3>
                    {editingId && (
                        <button onClick={handleCancelEdit} className="text-xs text-red-500 hover:underline">Vazgeç</button>
                    )}
                </div>

                <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase text-zinc-500 mb-1">Proje Başlığı</label>
                            <input
                                value={newProject.title}
                                onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                                className="w-full p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700"
                                placeholder="Örn: E-Ticaret Sitesi"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-zinc-500 mb-1">Proje URL (Ziyaret Linki)</label>
                            <input
                                value={newProject.url}
                                onChange={e => setNewProject({ ...newProject, url: e.target.value })}
                                className="w-full p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className={`border-t pt-4 ${editingId ? 'border-yellow-200 dark:border-yellow-700' : 'border-blue-200 dark:border-blue-800'}`}>
                        <label className="block text-xs uppercase text-zinc-500 mb-2 font-bold">Kapak Fotoğrafı {editingId ? '(Değiştirmek İsterseniz)' : '(İsteğe Bağlı)'}</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs text-zinc-400 block mb-1">Seçenek 1: Dosya Yükle</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                                />
                            </div>
                            <div>
                                <span className="text-xs text-zinc-400 block mb-1">Seçenek 2: Görsel Linki Yapıştır</span>
                                <input
                                    value={newProject.customImageUrl}
                                    onChange={e => setNewProject({ ...newProject, customImageUrl: e.target.value })}
                                    className="w-full p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm"
                                    placeholder={editingId ? "Mevcut URL korunur" : "https://imgur.com/..."}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={uploading}
                        className={`text-white py-2 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${editingId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {uploading ? 'İşleniyor...' : (editingId ? 'Değişiklikleri Kaydet' : 'Projeyi Ekle')}
                    </button>
                </div>
            </div>

            {/* Projects List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map(project => (
                    <div key={project.id} className={`relative group bg-white dark:bg-zinc-800 rounded-lg border overflow-hidden shadow-sm hover:shadow-md transition-all ${editingId === project.id ? 'ring-2 ring-yellow-500 border-yellow-500' : 'border-zinc-200 dark:border-zinc-700'}`}>
                        <div className="aspect-video bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden group-inner">
                            <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover object-top transition-transform duration-500 group-inner-hover:scale-105" />
                            <div className="absolute bottom-0 left-0 bg-black/50 text-white text-[10px] px-2 py-1 backdrop-blur-sm">
                                {project.thumbnailUrl && project.thumbnailUrl.includes('firebasestorage') ? '🔥 Storage' : '🔗 Link/Auto'}
                            </div>
                        </div>
                        <div className="p-3">
                            <h4 className="font-bold truncate">{project.title}</h4>
                            <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block">
                                {project.url}
                            </a>
                        </div>

                        {/* Actions */}
                        <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleEdit(project)}
                                className="bg-yellow-500 text-white p-2 rounded-full shadow-lg hover:bg-yellow-600 transition-colors"
                                title="Düzenle"
                            >
                                <FaTools size={12} />
                            </button>
                            <button
                                onClick={() => handleDelete(project.id)}
                                className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-colors"
                                title="Sil"
                            >
                                <FaTrash size={12} />
                            </button>
                        </div>
                    </div>
                ))}
                {projects.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-zinc-500">
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
                    <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
                        <FaEnvelope className="mx-auto text-4xl text-zinc-300 mb-2" />
                        <p className="text-zinc-500">Henüz hiç mesaj yok.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm relative group">
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
                <div className="text-center py-12 text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700">
                    Henüz şarkı önerisi gelmemiş.
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {recommendations.map(rec => (
                    <div key={rec.id} className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
    const { content, updateProfile, updateBio, addService, deleteService, updateSocial, resetToDefaults } = useSiteContent();
    const { profile, bio, services, socials } = content;
    const [activeTab, setActiveTab] = useState('profile');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
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
        <div className="min-h-screen bg-zinc-100 dark:bg-black text-zinc-900 dark:text-zinc-100 flex font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col p-4 fixed h-full overflow-y-auto shadow-sm z-20">
                <div className="mb-8 mt-2 flex flex-col items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white mb-2 shadow-lg">
                        <FaTools />
                    </div>
                    <h1 className="text-lg font-bold tracking-tight">Admin Panel</h1>
                </div>

                <nav className="flex-1 space-y-1">
                    <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-md transform translate-x-1' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                        <FaUser /> Profil
                    </button>
                    <button onClick={() => setActiveTab('bio')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'bio' ? 'bg-blue-600 text-white shadow-md transform translate-x-1' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                        <FaInfoCircle /> Biyografi
                    </button>
                    <button onClick={() => setActiveTab('services')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'services' ? 'bg-blue-600 text-white shadow-md transform translate-x-1' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                        <FaTools /> Hizmetler
                    </button>
                    <button onClick={() => setActiveTab('projects')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'projects' ? 'bg-blue-600 text-white shadow-md transform translate-x-1' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                        <FaProjectDiagram /> Projeler
                    </button>
                    <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2"></div>
                    <button onClick={() => setActiveTab('chat_history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'chat_history' ? 'bg-green-600 text-white shadow-md transform translate-x-1' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                        <FaComments /> Sohbetler
                    </button>
                    <button onClick={() => setActiveTab('messages')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'messages' ? 'bg-purple-600 text-white shadow-md transform translate-x-1' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                        <FaEnvelope /> Mesajlar
                    </button>
                    <button onClick={() => setActiveTab('socials')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'socials' ? 'bg-blue-600 text-white shadow-md transform translate-x-1' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                        <FaShareAlt /> İletişim
                    </button>
                    <button onClick={() => setActiveTab('spotify')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'spotify' ? 'bg-green-600 text-white shadow-md transform translate-x-1' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                        <FaSpotify /> Günün Şarkısı
                    </button>
                    <button onClick={() => setActiveTab('recommendations')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'recommendations' ? 'bg-indigo-600 text-white shadow-md transform translate-x-1' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                        <FaLightbulb /> Öneriler
                    </button>
                </nav>

                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-4 space-y-2">
                    <button onClick={resetToDefaults} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        Sıfırla
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
                        <FaSignOutAlt /> Çıkış Yap
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-8 bg-zinc-50 dark:bg-black min-h-screen">
                <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-lg border border-zinc-200 dark:border-zinc-800">
                    {/* Render active tab content */}
                    {activeTab === 'profile' && <ProfileEditor initialData={profile} onSave={handleProfileSave} />}
                    {activeTab === 'bio' && <BioEditor initialData={bio} onSave={handleBioSave} />}
                    {activeTab === 'services' && <ServicesEditor services={services} onAdd={addService} onDelete={deleteService} />}
                    {activeTab === 'projects' && <ProjectsEditor />}
                    {activeTab === 'chat_history' && <ChatHistory />}
                    {activeTab === 'messages' && <MessagesViewer />}
                    {activeTab === 'socials' && <SocialsEditor socials={socials} onUpdate={updateSocial} />}
                    {activeTab === 'spotify' && <SpotifyEditor />}
                    {activeTab === 'recommendations' && <RecommendationsEditor />}
                </div>


                <div className="h-24"></div> {/* Bottom Spacer */}

                {/* Floating Preview Button */}
                <div className="fixed bottom-8 right-8 z-50">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full font-bold shadow-2xl hover:scale-105 hover:shadow-xl transition-all duration-300 ring-2 ring-white dark:ring-black"
                    >
                        Siteyi Görüntüle →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
