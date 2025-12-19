import React, { createContext, useContext, useState, useEffect } from 'react';
import { FaCode, FaPaintBrush, FaMobileAlt, FaSearch, FaInstagram, FaWhatsapp, FaLinkedinIn, FaGithub, FaEnvelope } from 'react-icons/fa';

// Default Data (Fallback if localStorage is empty)
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
    // Initialize state from localStorage or default
    const [content, setContent] = useState(() => {
        const saved = localStorage.getItem('siteContent');
        return saved ? JSON.parse(saved) : defaultData;
    });

    // Save to localStorage whenever content changes
    useEffect(() => {
        localStorage.setItem('siteContent', JSON.stringify(content));
    }, [content]);

    // Data Migration: Remove WhatsApp (optional)
    useEffect(() => {
        const hasWhatsApp = content.socials.some(s => s.platform === 'WhatsApp');
        if (hasWhatsApp) {
            setContent(prev => ({
                ...prev,
                socials: prev.socials.filter(s => s.platform !== 'WhatsApp')
            }));
        }
    }, [content.socials]);

    // Icon Helper
    const getIcon = (iconName) => {
        const icons = { FaCode, FaPaintBrush, FaMobileAlt, FaSearch, FaInstagram, FaWhatsapp, FaLinkedinIn, FaGithub, FaEnvelope };
        const IconComponent = icons[iconName];
        return IconComponent ? <IconComponent /> : <FaCode />;
    };

    // --- Actions (No Translation) ---

    const updateProfile = (newProfile) => {
        setContent(prev => ({ ...prev, profile: { ...prev.profile, ...newProfile } }));
    };

    const updateBio = (newBio) => {
        setContent(prev => ({ ...prev, bio: { ...prev.bio, ...newBio } }));
    };

    const addService = (service) => {
        setContent(prev => ({ ...prev, services: [...prev.services, { ...service, id: Date.now() }] }));
    };

    const updateService = (id, updatedService) => {
        setContent(prev => ({
            ...prev,
            services: prev.services.map(s => s.id === id ? { ...s, ...updatedService } : s)
        }));
    };

    const deleteService = (id) => {
        setContent(prev => ({
            ...prev,
            services: prev.services.filter(s => s.id !== id)
        }));
    };

    const updateSocial = (id, updates) => {
        setContent(prev => ({
            ...prev,
            socials: prev.socials.map(s => s.id === id ? { ...s, ...updates } : s)
        }));
    };

    const resetToDefaults = () => {
        if (window.confirm("Tüm değişiklikler silinecek ve varsayılanlara dönülecek. Emin misiniz?")) {
            setContent(defaultData);
        }
    };

    return (
        <SiteContext.Provider value={{
            content,
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
