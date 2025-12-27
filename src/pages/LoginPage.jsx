import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/admin');
        } catch (err) {
            console.error("Login Error:", err);
            setError('Giriş başarısız. E-posta veya şifre hatalı.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4 text-zinc-200 font-sans selection:bg-green-500/30">
            {/* Background Gradient */}
            <div className="fixed inset-0 bg-gradient-to-tr from-green-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>

            <div className="w-full max-w-sm bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-zinc-800 relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-green-500/30">
                        <FaLock size={20} />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Yönetici Girişi</h1>
                    <p className="text-zinc-500 text-sm mt-2 text-center">Güvenli Yönetim Paneli</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-xl text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">E-posta</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-black/50 border border-zinc-800 focus:border-green-500 focus:ring-1 focus:ring-green-500/50 outline-none transition-all text-sm text-white"
                            placeholder="admin@example.com"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Şifre</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-black/50 border border-zinc-800 focus:border-green-500 focus:ring-1 focus:ring-green-500/50 outline-none transition-all text-sm text-white"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-900/20 hover:shadow-green-900/40 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Giriş Yapılıyor...' : 'Panele Eriş →'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-zinc-600">
                        © 2025 Fahrielsara CMS. Tüm hakları saklıdır.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
