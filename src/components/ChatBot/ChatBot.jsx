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
            // Extract city attempt (very basic)
            // Ideally we'd ask the AI to extract entities, but for speed/simplicity in this hybrid approach:
            // We'll ask Gemini to just extract the city name in a separate quick call, 
            // OR we just send the whole thing to Gemini with a function tool definition.
            // Let's stick to the prompt engineering approach for simplicity as per plan.

            // Actually, let's try a regex for common Turkish cities or just pass context to AI.
            // BETTER APPROACH:
            // Call Gemini with the user query.
            // If the user is asking about weather, we will append weather data if we can find a city.
            // But to find the city, let's just make a best guess or let Gemini handle "I don't know the city" if we don't provide it.

            // Let's loop through common cities or look for capitalized words?
            // "Çorum'da hava..." -> match Çorum

            const cityMatch = q.match(/([a-zA-ZçğıöşüÇĞİÖŞÜ]+)'(da|de|ta|te)/);
            let city = cityMatch ? cityMatch[1] : null;

            if (!city) {
                // Try to find a city in the string directly if user typed "istanbul hava"
                const commonCities = ["istanbul", "ankara", "izmir", "bursa", "antalya", "adana", "konya", "gaziantep", "çorum", "corum", "samsun", "trabzon"];
                city = commonCities.find(c => q.includes(c));
            }

            if (city) {
                const weatherData = await getWeather(city);
                if (weatherData) {
                    // Send to AI with context
                    const contextMsg = `(Sistem Bilgisi: Kullanıcı ${city} için hava durumu sordu. Şu anki veriler: ${weatherData.temp}°C, ${weatherData.description}, Nem: %${weatherData.humidity}. Bu bilgiyi kullanarak kullanıcıya nazikçe cevap ver.)`;
                    return await getChatResponse([], contextMsg + " " + query);
                }
            }
        }

        // 2. Standard AI Chat
        // Prepare history for Gemini (checking last few messages for context)
        // Gemini expects { role: 'user' | 'model', parts: [{ text: '...' }] }
        const history = messages.slice(-10).map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
        }));

        // System Context (Persona)
        const systemPrompt = `Sen Fahrielsara adında, hem bu web sitesinin asistanı hem de geniş bilgiye sahip yardımsever bir yapay zeka asistanısın.
        
        Web sitesi sahibi hakkında bilgiler:
        İsim: ${content.profile.name}
        Ünvan: ${content.profile.title}
        Biyografi: ${content.bio.text1}
        
        Görevlerin:
        1. Site sahibi hakkında sorulan sorulara yukarıdaki bilgilere dayanarak cevap ver.
        2. KULLANICININ SORDUĞU DİĞER TÜM KONULARDA (Genel kültür, bilim, tarih, kodlama, günlük sohbet vb.) onlara yardımcı ol ve sorularını cevapla. Sadece site ile sınırlı kalma.
        
        Tarzın: Her zaman nazik, profesyonel, zeki ve yardımsever ol. Türkçe konuş.
        Eğer hava durumu sorulursa ve elinde veri yoksa, "Hangi şehir için öğrenmek istersin?" diye sor.`;

        // We pretend the system prompt is a previous turn or just part of the prompt
        // For 'google/generative-ai', we can pass systemInstruction at model init or just prepend here.
        // We'll prepend it to the history as a 'user' instruction for now or rely on the function wrapper doing it.
        // My aiService wrapper takes (history, message). I'll pass the prompt inside the wrapper or here.
        // Let's pass it as a special first message in history.

        const aiHistory = [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: "Anlaşıldı, Fahrielsara olarak yardımcı olmaya hazırım." }] },
            ...history
        ];

        return await getChatResponse(aiHistory, query);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: input };
        const updatedMessages = [...messages, userMsg];

        setMessages(updatedMessages);
        setInput('');
        setIsTyping(true);
        updateSession(updatedMessages); // Save user message

        // Simulate AI delay
        setTimeout(async () => {
            const responseText = await generateAIResponse(userMsg.text);
            const botMsg = { id: Date.now() + 1, sender: 'bot', text: responseText };

            const finalMessages = [...updatedMessages, botMsg];
            setMessages(finalMessages);
            setIsTyping(false);
            updateSession(finalMessages); // Save bot message
        }, 1500);
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
