import React, { createContext, useContext, useState, useEffect } from 'react';
import { FaCode, FaPaintBrush, FaMobileAlt, FaSearch, FaInstagram, FaWhatsapp, FaLinkedinIn, FaGithub, FaEnvelope } from 'react-icons/fa';
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Default Data (Fallback / Initial Setup)
const defaultData = {
    profile: {
        name: "", // Start empty to prevent "wrong spelling" flash
        title: "",
        location: "",
        image: "https://ui-avatars.com/api/?name=FK&background=0D8ABC&color=fff&size=512", // Initial generic avatar
        quote: "",
        quoteAuthor: ""
    },
    bio: {
        about: "",
        mission: "",
        education: []
    },
    services: [
        { id: 1, title: 'Web Geliştirme', short: 'Modern ve hızlı web siteleri.', desc: 'React, Vite ve TailwindCSS kullanarak yüksek performanslı, SEO uyumlu ve mobil öncelikli web uygulamaları geliştiriyorum.', iconName: 'FaCode' },
        { id: 2, title: 'UI/UX Tasarım', short: 'Kullanıcı odaklı arayüzler.', desc: 'Kullanıcı deneyimini merkeze alan, estetik ve işlevsel arayüz tasarımları yapıyorum.', iconName: 'FaPaintBrush' }
    ],
    socials: [
        { id: 1, platform: 'LinkedIn', url: 'https://linkedin.com/in/fahrikolagasi', color: '#0077b5', iconName: 'FaLinkedinIn', show: true },
        { id: 2, platform: 'GitHub', url: 'https://github.com/fahrikolagasi', color: '#333', iconName: 'FaGithub', show: true },
        { id: 3, platform: 'Instagram', url: 'https://instagram.com/fahrikolagasi', color: '#E1306C', iconName: 'FaInstagram', show: true },
        { id: 4, platform: 'Mail', url: 'iletisim@fahrikolagasi.com', color: '#EA4335', iconName: 'FaEnvelope', show: true }
    ]
};

const SiteContext = createContext();

export const useSiteContent = () => useContext(SiteContext);

export const SiteProvider = ({ children }) => {
    // Start with localStorage content if available to prevent "flash of default data"
    const [content, setContent] = useState(() => {
        try {
            const saved = localStorage.getItem("siteContent");
            return saved ? JSON.parse(saved) : defaultData;
        } catch (e) {
            console.error("Error reading from localStorage", e);
            return defaultData;
        }
    });

    const [loading, setLoading] = useState(false); // Default false for instant render using cached/default data

    // Sync with Firestore Real-time
    useEffect(() => {
        const docRef = doc(db, "siteContent", "main");

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const newData = docSnap.data();
                // Update State
                setContent(newData);
                // Update Local Cache for next reload
                localStorage.setItem("siteContent", JSON.stringify(newData));
            } else {
                // Initialize DB if empty
                setDoc(docRef, defaultData);
                setContent(defaultData);
                localStorage.setItem("siteContent", JSON.stringify(defaultData));
            }
            setLoading(false);
        }, (error) => {
            console.error("Firestore sync error:", error);
            // On error, we just stay with whatever is in state (cache or default)
        });

        return () => unsubscribe();
    }, []);

    // Helper: Save whole object to Firestore
    const saveToFirestore = async (newContent) => {
        try {
            // Optimistic update to localStorage
            localStorage.setItem("siteContent", JSON.stringify(newContent));

            await setDoc(doc(db, "siteContent", "main"), newContent);
        } catch (error) {
            console.error("Error saving to Firestore:", error);
            alert("Kaydetme sırasında bir hata oluştu! İnternet bağlantınızı kontrol edin.");
        }
    };

    // Helper to get Icon component dynamically
    const getIcon = (iconName) => {
        const icons = { FaCode, FaPaintBrush, FaMobileAlt, FaSearch, FaInstagram, FaWhatsapp, FaLinkedinIn, FaGithub, FaEnvelope };
        const IconComponent = icons[iconName];
        return IconComponent ? <IconComponent /> : <FaCode />;
    };

    // --- Actions (Updates Firestore directly) ---

    // 1. Profile
    const updateProfile = (newProfile) => {
        const updated = { ...content, profile: { ...content.profile, ...newProfile } };
        // Optimistic update for immediate feedback (though onSnapshot is fast)
        setContent(updated);
        saveToFirestore(updated);
    };

    // 2. Bio
    const updateBio = (newBio) => {
        const updated = { ...content, bio: { ...content.bio, ...newBio } };
        setContent(updated);
        saveToFirestore(updated);
    };

    // 3. Services - Add
    const addService = (service) => {
        const newService = { ...service, id: Date.now() };
        const updated = { ...content, services: [...content.services, newService] };
        setContent(updated);
        saveToFirestore(updated);
    };

    // 3. Services - Update
    const updateService = (id, updatedService) => {
        const updatedServices = content.services.map(s => s.id === id ? { ...s, ...updatedService } : s);
        const updated = { ...content, services: updatedServices };
        setContent(updated);
        saveToFirestore(updated);
    };

    // 3. Services - Delete
    const deleteService = (id) => {
        const updatedServices = content.services.filter(s => s.id !== id);
        const updated = { ...content, services: updatedServices };
        setContent(updated);
        saveToFirestore(updated);
    };

    // 4. Socials
    const updateSocial = (id, updates) => {
        const updatedSocials = content.socials.map(s => s.id === id ? { ...s, ...updates } : s);
        const updated = { ...content, socials: updatedSocials };
        setContent(updated);
        saveToFirestore(updated);
    };

    // 4b. Bulk Socials Update (Fix for overwriting issue)
    const updateAllSocials = (newSocials) => {
        const updated = { ...content, socials: newSocials };
        setContent(updated);
        saveToFirestore(updated);
    };

    // Reset
    const resetToDefaults = () => {
        if (window.confirm("Tüm değişiklikler silinecek ve varsayılanlara dönülecek. Emin misiniz?")) {
            setContent(defaultData);
            saveToFirestore(defaultData);
        }
    };

    return (
        <SiteContext.Provider value={{
            content,
            loading,
            getIcon,
            updateProfile,
            updateBio,
            addService,
            updateService,
            deleteService,
            updateSocial,
            updateAllSocials,
            resetToDefaults
        }}>
            {children}
        </SiteContext.Provider>
    );
};
