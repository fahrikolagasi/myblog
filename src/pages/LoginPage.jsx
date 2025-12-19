import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Demo Credentials
        if (email === 'admin@demo.com' && password === 'demo123') {
            localStorage.setItem('isAuthenticated', 'true');
            navigate('/admin');
        } else {
            setError('Geçersiz e-posta veya şifre (admin@demo.com / demo123)');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-black p-4 text-zinc-800 dark:text-zinc-200">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white mb-4">
                        <FaLock />
                    </div>
                    <h1 className="text-2xl font-bold">Yönetici Girişi</h1>
                    <p className="text-zinc-500 text-sm mt-1">Lütfen devam etmek için oturum açın</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">E-posta</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="admin@demo.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Şifre</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="demo123"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Giriş Yap
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-zinc-500">
                    <p>Demo Giriş: admin@demo.com / demo123</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
