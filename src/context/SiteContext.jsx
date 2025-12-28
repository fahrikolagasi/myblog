import React, { createContext, useContext, useState, useEffect } from 'react';
import { FaCode, FaPaintBrush, FaMobileAlt, FaSearch, FaInstagram, FaWhatsapp, FaLinkedinIn, FaGithub, FaEnvelope } from 'react-icons/fa';
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Default Data (Fallback / Initial Setup)
const defaultData = {
    profile: {
        name: "FAHRİ KOLAĞASI",
        title: "Software Developer",
        location: "Çorum/TÜRKİYE",
        image: "https://media.licdn.com/dms/image/v2/D4D03AQGydqV9i-vovw/profile-displayphoto-scale_200_200/B4DZtgyH_tKAAY-/0/1766855315159?e=1768435200&v=beta&t=g_4pa433MLSINubGE2srpV7TNsH039LyW0ehRqfhd_U",
        quote: "Şimdilik sadece sinek avlıyorum. Ama zamanla birgün bataklığı kurutacağım..",
        quoteAuthor: "Steve Jobs"
    },
    bio: {
        about: "Ben Fahri Kolağası, 22 yaşındayım. Çorum’da yaşayan ve dijital dünyayı şekillendirme hedefiyle yola çıkan bir web geliştiriciyim. Ondokuz Mayıs Üniversitesi Bilgisayar Programcılığı mezunu olarak, teorik bilgimi pratik projelerle yukarı taşımayı hedefliyorum.",
        mission: "Teknoloji ve tasarımı kusursuz bir dengede buluşturarak, kullanıcı deneyimini zirveye taşıyan dijital mimariler inşa ediyorum. Sadece kod yazmıyor; yüksek performanslı, sürdürülebilir ve yenilikçi sistemlerle dijital dünyada silinmez izler bırakıyorum. Karmaşayı işlevsel bir düzene, fikirleri ise yarının standartlarını belirleyen projelere dönüştürmek için buradayım.",
        education: [
            {
                id: 1766846850947,
                school: "ONDOKUZ MAYIS ÜNİVERSİTESİ",
                degree: "BİLGİSAYAR PROGRAMCILIĞI-3.02",
                year: "2023-2025"
            },
            {
                id: 1766846870723,
                school: "ÇORUM ANADOLU LİSESİ",
                degree: "",
                year: "2018-2022"
            }
        ]
    },
    services: [
        {
            id: 1,
            title: "Web Geliştirme",
            short: "Modern ve hızlı web siteleri.",
            desc: "React, Next.js ve modern frontend teknolojileri kullanarak, SEO uyumlu, hızlı açılan ve güvenli web siteleri geliştiriyorum.",
            iconName: "FaCode"
        },
        {
            id: 2,
            title: "UI/UX Tasarım",
            short: "Kullanıcı dostu arayüzler.",
            desc: "Kullanıcı deneyimini merkeze alan, estetik ve fonksiyonel arayüz tasarımları. Figma kullanarak prototipleme.",
            iconName: "FaPaintBrush"
        },
        {
            id: 3,
            title: "Mobil Uygulama",
            short: "iOS ve Android uyumlu çözümler.",
            desc: "React Native teknolojisi ile tek kod tabanından hem iOS hem Android için native performansında çalışan mobil uygulamalar.",
            iconName: "FaMobileAlt"
        },
        {
            id: 4,
            title: "SEO Optimizasyon",
            short: "Arama motorlarında üst sıralar.",
            desc: "Sitenizin Google ve diğer arama motorlarında üst sıralarda yer alması için teknik SEO, içerik optimizasyonu ve performans iyileştirmeleri.",
            iconName: "FaSearch"
        }
    ],
    socials: [
        {
            id: 1,
            platform: "Instagram",
            url: "https://www.instagram.com/fahrikolagasi/",
            color: "#E1306C",
            iconName: "FaInstagram",
            show: true
        },
        {
            id: 3,
            platform: "LinkedIn",
            url: "https://www.linkedin.com/in/fahri-kola%C4%9Fas%C4%B1?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BRs2%2FvsQQRa%2BJOTZgTIq0xg%3D%3D",
            color: "#0077B5",
            iconName: "FaLinkedinIn",
            show: true
        },
        {
            id: 4,
            platform: "GitHub",
            url: "https://github.com/fahrikolagasi",
            color: "#333",
            iconName: "FaGithub",
            show: true
        },
        {
            id: 5,
            platform: "Email",
            url: "mailto:fahrikolagasi1@gmail.com",
            color: "#EA4335",
            iconName: "FaEnvelope",
            show: true
        }
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
