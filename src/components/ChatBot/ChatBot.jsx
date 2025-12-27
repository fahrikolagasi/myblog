import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaTimes, FaRobot, FaMinus } from 'react-icons/fa';
import { useSiteContent } from '../../context/SiteContext';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getChatResponse } from '../../services/aiService';
import { getWeather } from '../../services/weatherService';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: 'Ben Fahrielsara sizlere nasıl yardımcı olabilirim? 🤖' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const messagesEndRef = useRef(null);

    // Get site context data for AI context
    const { content } = useSiteContent();

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Create session on first open
    useEffect(() => {
        if (isOpen && !sessionId) {
            const createSession = async () => {
                try {
                    const docRef = await addDoc(collection(db, "chat_sessions"), {
                        startedAt: serverTimestamp(),
                        lastMessageAt: serverTimestamp(),
                        platform: navigator.platform,
                        messages: messages
                    });
                    setSessionId(docRef.id);
                } catch (e) {
                    console.error("Session creation failed", e);
                }
            };
            createSession();
        }
    }, [isOpen]);

    // Update session in Firestore
    const updateSession = async (newMessages) => {
        if (!sessionId) return;
        try {
            const sessionRef = doc(db, "chat_sessions", sessionId);
            await updateDoc(sessionRef, {
                messages: newMessages,
                lastMessageAt: serverTimestamp()
            });
        } catch (e) {
            console.error("Save failed", e);
        }
    };

    const generateAIResponse = async (query) => {
        const q = query.toLowerCase();

        // 1. Weather Check (Simple Intent Detection)
        if ((q.includes('hava') || q.includes('sıcaklık') || q.includes('derece')) && (q.includes('kaç') || q.includes('nasıl') || q.includes('nedir'))) {
            const cityMatch = q.match(/([a-zA-ZçğıöşüÇĞİÖŞÜ]+)'(da|de|ta|te)/);
            let city = cityMatch ? cityMatch[1] : null;

            if (!city) {
                const commonCities = ["istanbul", "ankara", "izmir", "bursa", "antalya", "adana", "konya", "gaziantep", "çorum", "corum", "samsun", "trabzon"];
                city = commonCities.find(c => q.includes(c));
            }

            if (city) {
                try {
                    const weatherData = await getWeather(city);
                    if (weatherData) {
                        const contextMsg = `(Sistem Bilgisi: Kullanıcı ${city} için hava durumu sordu. Şu anki veriler: ${weatherData.temp}°C, ${weatherData.description}, Nem: %${weatherData.humidity}. Bu bilgiyi kullanarak kullanıcıya nazikçe cevap ver.)`;
                        return await getChatResponse([], contextMsg + " " + query);
                    }
                } catch (e) {
                    console.error("Weather error:", e);
                }
            }
        }

        // 2. Standard AI Chat
        // 2. Standard AI Chat
        let history = messages.slice(-10).map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
        }));

        // Remove leading model messages to comply with Gemini API (Must start with 'user')
        while (history.length > 0 && history[0].role === 'model') {
            history.shift();
        }

        // Helper to format lists safely
        const formatList = (list, formatter) => {
            if (!list || !Array.isArray(list) || list.length === 0) return "Bu konuda henüz bilgi girişi yapılmamış.";
            return list.map(formatter).join('\n');
        };

        const servicesString = formatList(content.services, s => `- ${s.title || 'Hizmet'}: ${s.short || ''} (${s.desc || ''})`);
        const educationString = formatList(content.bio.education, e => `- ${e.school || 'Okul'}: ${e.degree || 'Bölüm'} (${e.year || 'Yıl'})`);
        const socialString = formatList(content.socials?.filter(s => s.show), s => `- ${s.platform}: ${s.url}`);

        const systemPrompt = `Sen **Fahrielsara AI**'sın. Bu web sitesinin ("${content.profile.name || 'Site Sahibi'}") resmi asistanısın.

        � **MUHATABIN KİM? (ÖNEMLİ):** 
        Şu an seninle konuşan kişi bir **ZİYARETÇİ**. 
        **ASLA** karşındaki kişiye site sahibiymiş gibi hitap etme. 
        **Site Sahibi (Fahri Bey)** hakkında üçüncü şahıs olarak bahset ("Fahri Bey şöyle yaptı...", "Kendisi bu konuda uzmandır..." gibi).

        � **GÖREVİN:** 
        Ziyaretçiye site sahibi hakkında bilgi ver, sorularını yanıtla ve onlara yardımcı ol.
        
        **SİTE SAHİBİ HAKKINDA BİLDİKLERİN (Kutsal Veri Kaynağı):**
        - **İsim:** ${content.profile.name || 'Belirtilmemiş'}
        - **Ünvan:** ${content.profile.title || 'Belirtilmemiş'}
        - **Konum:** ${content.profile.location || 'Belirtilmemiş'}
        - **Biyografi:** ${content.bio.about || 'Biyografi henüz eklenmemiş.'}
        - **Misyon:** ${content.bio.mission || 'Misyon henüz eklenmemiş.'}
        
        🎓 **EĞİTİM GEÇMİŞİ (Kullanıcı sorarsa detaylı anlat):**
        ${educationString}
        
        🛠️ **HİZMETLER (Neler yapıyoruz?):**
        ${servicesString}
        
        🌐 **SOSYAL MEDYA:**
        ${socialString}

        💡 **DAVRANIŞ KURALLARI:**
        1. **Analiz Et:** Ziyaretçi site sahibi hakkında bir şey sorarsa, elindeki verileri kullanarak zekice yorumlar yap.
        2. **Her Şeye Cevap Ver:** Geyik muhabbeti, felsefe veya kodlama sorulursa arkadaşça cevapla.
        3. **Üslup:** Samimi, emoji kullanan (🚀, 🧠, ✨), "siz" veya "sen" diyebilen ama her zaman saygılı bir asistan ol.

        Unutma: Sen Fahrielsara'sın. Ziyaretçileri en iyi şekilde ağırlamak senin işin.`;

        try {
            return await getChatResponse(history, query, systemPrompt);
        } catch (error) {
            console.error("AI Generation Error:", error);
            return "Şu an beyin kıvrımlarımda aşırı yüklenme var sanırım! 🤯 Ama toparlıyorum, lütfen sorunu tekrar sor, bu sefer halledeceğim!";
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userText = input; // Capture input immediately
        const userMsg = { id: Date.now(), sender: 'user', text: userText };
        const updatedMessages = [...messages, userMsg];

        setMessages(updatedMessages);
        setInput('');
        setIsTyping(true);

        // Save user message (optimistic)
        // We don't await this to keep UI snappy, but it's fine
        updateSession(updatedMessages).catch(err => console.error("Session update error:", err));

        try {
            // Run API call and Minimum Delay in parallel
            // This prevents the "wait 1.5s THEN start request" slowness
            // But keeps the nice UI feeling of "thinking"
            const [responseText] = await Promise.all([
                generateAIResponse(userText),
                new Promise(resolve => setTimeout(resolve, 1000)) // Reduced to 1s min wait
            ]);

            // Default safe response if something returns empty
            const finalResponse = responseText || "Üzgünüm, bir şeyler ters gitti ve cevabı alamadım. Tekrar dener misin?";

            const botMsg = { id: Date.now() + 1, sender: 'bot', text: finalResponse };
            const finalMessages = [...updatedMessages, botMsg];

            setMessages(finalMessages);
            updateSession(finalMessages);
        } catch (error) {
            console.error("Chat Error:", error);
            // Fallback error message in UI
            const botMsg = { id: Date.now() + 1, sender: 'bot', text: "Bağlantıda bir sorun oluştu. Lütfen sayfayı yenileyip tekrar deneyin." };
            setMessages(prev => [...prev, botMsg]);
        } finally {
            setIsTyping(false); // ALWAYS ensure typing stops
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-80 md:w-96 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col h-[500px]"
                    >
                        {/* Header */}
                        <div className="bg-zinc-100 dark:bg-[#252525] p-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">🤖</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Fahrielsara AI</h3>
                                    <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        <span className="text-[10px] text-zinc-500">Çevrimiçi</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-zinc-500 transition-colors">
                                    <FaMinus size={12} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-[#121212]">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'user'
                                            ? 'bg-green-600 text-white rounded-tr-sm'
                                            : 'bg-white dark:bg-[#252525] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-tl-sm'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-[#252525] rounded-2xl rounded-tl-sm px-4 py-3 border border-zinc-200 dark:border-zinc-700 flex gap-1">
                                        <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-100"></span>
                                        <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-200"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 bg-white dark:bg-[#1a1a1a] border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Bir şeyler yazın..."
                                className="flex-1 bg-zinc-100 dark:bg-[#252525] text-zinc-900 dark:text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="w-10 h-10 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors"
                            >
                                <FaPaperPlane size={14} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Trigger Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-white dark:bg-[#252525] rounded-full shadow-2xl border-2 border-green-500 flex items-center justify-center relative group"
                >
                    <span className="text-3xl">🤖</span>
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-[#252525]"></span>

                    {/* Tooltip */}
                    {/* Tooltip (Speech Bubble) */}
                    <span className="absolute -top-12 right-0 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 opacity-100 transition-opacity whitespace-nowrap z-50">
                        Fahrielsara AI'a merhaba de!
                        {/* Triangle Arrow */}
                        <span className="absolute -bottom-1 right-6 w-2 h-2 bg-white dark:bg-zinc-800 border-b border-r border-zinc-200 dark:border-zinc-700 rotate-45"></span>
                    </span>
                </motion.button>
            )}
        </div>
    );
};

export default ChatBot;
