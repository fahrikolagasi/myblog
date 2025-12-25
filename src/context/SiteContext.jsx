import React, { createContext, useContext, useState, useEffect } from 'react';
import { FaCode, FaPaintBrush, FaMobileAlt, FaSearch, FaInstagram, FaWhatsapp, FaLinkedinIn, FaGithub, FaEnvelope } from 'react-icons/fa';
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Default Data (Fallback / Initial Setup)
const defaultData = {
    profile: {
        name: "[Ad Soyad]",
        title: "Creative Developer",
        location: "İstanbul, Turkey",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000&auto=format&fit=crop",
        quote: "Tasarım sadece nasıl göründüğü değil, nasıl çalıştığıdır.",
        quoteAuthor: "Steve Jobs"
    },
    bio: {
        text1: "Merhaba, ben [Adınız]. Teknoloji ve tasarımın kesişim noktasında, kullanıcı deneyimini merkeze alan dijital ürünler geliştiriyorum.",
        text2: "Yazılım dünyasına olan merakım çocukluk yıllarıma dayanıyor. Bugün, modern web teknolojileri ile çözümler üretiyor ve hikayesi olan tasarımlar yapıyorum.",
    },
    services: [
        {
            id: 1,
            iconName: "FaCode",
            title: "Web Geliştirme",
            short: "Modern ve hızlı web siteleri.",
            desc: "React, Next.js ve modern frontend teknolojileri kullanarak, SEO uyumlu, hızlı açılan ve güvenli web siteleri geliştiriyorum.",
        },
        {
            id: 2,
            iconName: "FaPaintBrush",
            title: "UI/UX Tasarım",
            short: "Kullanıcı dostu arayüzler.",
            desc: "Kullanıcı deneyimini merkeze alan, estetik ve fonksiyonel arayüz tasarımları. Figma kullanarak prototipleme.",
        },
        {
            id: 3,
            iconName: "FaMobileAlt",
            title: "Mobil Uygulama",
            short: "iOS ve Android uyumlu çözümler.",
            desc: "React Native teknolojisi ile tek kod tabanından hem iOS hem Android için native performansında çalışan mobil uygulamalar.",
        },
        {
            id: 4,
            iconName: "FaSearch",
            title: "SEO Optimizasyon",
            short: "Arama motorlarında üst sıralar.",
            desc: "Sitenizin Google ve diğer arama motorlarında üst sıralarda yer alması için teknik SEO, içerik optimizasyonu ve performans iyileştirmeleri.",
        }
    ],
    socials: [
        { id: 1, platform: "Instagram", url: "https://instagram.com", iconName: "FaInstagram", color: "#E1306C", show: true, image: "" },
        { id: 3, platform: "LinkedIn", url: "https://linkedin.com", iconName: "FaLinkedinIn", color: "#0077B5", show: true, image: "" },
        { id: 4, platform: "GitHub", url: "https://github.com", iconName: "FaGithub", color: "#333", show: true, image: "" },
        { id: 5, platform: "Email", url: "mailto:hello@example.com", iconName: "FaEnvelope", color: "#EA4335", show: true, image: "" }
    ]
};

const SiteContext = createContext();

export const useSiteContent = () => useContext(SiteContext);

export const SiteProvider = ({ children }) => {
    // Start with defaultData to prevent UI flicker, then update from DB
    const [content, setContent] = useState(defaultData);
    const [loading, setLoading] = useState(true);

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
            resetToDefaults
        }}>
            {children}
        </SiteContext.Provider>
    );
};
