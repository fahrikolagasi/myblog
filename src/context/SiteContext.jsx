import React, { createContext, useContext, useState, useEffect } from 'react';
import { FaCode, FaPaintBrush, FaMobileAlt, FaSearch, FaInstagram, FaWhatsapp, FaLinkedinIn, FaGithub, FaEnvelope } from 'react-icons/fa';
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Default Data (Fallback / Initial Setup)
const defaultData = {
    profile: {
        name: "",
        title: "",
        location: "",
        image: "",
        quote: "",
        quoteAuthor: ""
    },
    bio: {
        about: "",
        mission: "",
        education: []
    },
    services: [],
    socials: []
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
