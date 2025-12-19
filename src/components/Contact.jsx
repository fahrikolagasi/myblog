import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaUser, FaEnvelope, FaCommentAlt } from 'react-icons/fa';
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [showToast, setShowToast] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await addDoc(collection(db, "messages"), {
                ...formData,
                createdAt: new Date(),
                read: false
            });

            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Mesaj gönderilirken bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="py-24 relative transition-colors duration-500">
            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto bg-[#1a1b26]/80 dark:bg-white/80 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-zinc-800 dark:border-zinc-200 shadow-sm">
                    <div className="text-center mb-10">
                        <h2 className="text-blue-600 dark:text-blue-400 font-mono text-sm tracking-widest uppercase mb-2">
                            İLETİŞİM
                        </h2>
                        <h2 className="text-4xl md:text-5xl font-black text-white dark:text-zinc-900 tracking-tight">
                            Bana Ulaşın
                        </h2>
                        <p className="mt-4 text-zinc-400 dark:text-zinc-600 max-w-lg mx-auto">
                            Görüş, öneri veya proje talepleriniz için aşağıdaki formu doldurabilirsiniz. En kısa sürede dönüş yapacağım.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative group">
                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Adınız Soyadınız"
                                    required
                                    value={formData.name}
                                    className="w-full bg-zinc-900 dark:bg-zinc-100 border border-zinc-700 dark:border-zinc-300 rounded-xl py-4 pl-12 pr-4 text-white dark:text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="relative group">
                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="E-posta Adresiniz"
                                    required
                                    value={formData.email}
                                    className="w-full bg-zinc-900 dark:bg-zinc-100 border border-zinc-700 dark:border-zinc-300 rounded-xl py-4 pl-12 pr-4 text-white dark:text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="relative group">
                            <FaCommentAlt className="absolute left-4 top-6 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                            <textarea
                                name="message"
                                rows="4"
                                placeholder="Mesajınız..."
                                required
                                value={formData.message}
                                className="w-full bg-zinc-900 dark:bg-zinc-100 border border-zinc-700 dark:border-zinc-300 rounded-xl py-4 pl-12 pr-4 text-white dark:text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                                onChange={handleChange}
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span>Gönderiliyor...</span>
                            ) : (
                                <>
                                    <FaPaperPlane /> Gönder
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>
            </div>

            {/* Success Toast */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 z-50 font-bold"
                    >
                        ✅ Mesajınız ve İletişim Bilgileriniz İletildi!
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Contact;
