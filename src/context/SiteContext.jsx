import React, { createContext, useContext, useState, useEffect } from 'react';
import { FaCode, FaPaintBrush, FaMobileAlt, FaSearch, FaInstagram, FaWhatsapp, FaLinkedinIn, FaGithub, FaEnvelope } from 'react-icons/fa';
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Default Data (Fallback / Initial Setup)
const defaultData = {
    profile: {
        name: "Fahri Kolagaşı",
        title: "Fütüristik Yazılım Geliştirici",
        location: "Türkiye",
        image: "https://media.licdn.com/dms/image/D4D03AQE1zM8o5-Q5QA/profile-displayphoto-shrink_800_800/0/1691234567890?e=1700000000&v=beta&t=placeholder", // Ideally this should be a local asset or stable URL
        quote: "Kod, geleceği inşa etmenin en zarif yoludur.",
        quoteAuthor: "FK"
    },
    bio: {
        about: "Merhaba, ben Fahri. Modern web teknolojileri, yapay zeka ve kullanıcı deneyimi üzerine odaklanan bir yazılım geliştiriciyim. Dijital dünyada iz bırakan projeler üretmeyi seviyorum.",
        mission: "Teknolojiyi sanatla birleştirerek, insanların hayatına dokunan ve onlara ilham veren dijital deneyimler tasarlamak.",
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
    // Start with defaultData to prevent UI flicker, then update from DB
    const [content, setContent] = useState(defaultData);
    const [loading, setLoading] = useState(false); // Default false for instant render using defaultData

    // Sync with Firestore Real-time
    useEffect(() => {
        const docRef = doc(db, "siteContent", "main");

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                // Merge data from DB
                setContent(docSnap.data());
            } else {
                // Initialize DB if empty
                setDoc(docRef, defaultData);
                setContent(defaultData);
            }
            setLoading(false);
        }, (error) => {
            console.error("Firestore sync error:", error);
            // Fallback to localStorage if DB fails? Or just keep defaultData.
            // keeping current content is improved resilience.
        });

        return () => unsubscribe();
    }, []);

    // Helper: Save whole object to Firestore
    const saveToFirestore = async (newContent) => {
        try {
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
