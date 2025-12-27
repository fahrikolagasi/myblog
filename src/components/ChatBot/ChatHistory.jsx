import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { FaTrash, FaUser, FaRobot, FaClock } from 'react-icons/fa';

const ChatHistory = () => {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "chat_sessions"), orderBy("lastMessageAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const sessionData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSessions(sessionData);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Bu sohbeti silmek istediğine emin misin?")) {
            await deleteDoc(doc(db, "chat_sessions", id));
            if (selectedSession?.id === id) setSelectedSession(null);
            setSelectedIds(prev => prev.filter(sessionId => sessionId !== id));
        }
    };

    const handleBatchDelete = async () => {
        if (!selectedIds.length) return;
        if (window.confirm(`Seçili ${selectedIds.length} sohbeti silmek istediğine emin misin?`)) {
            // Delete sequentially or parallel
            const promises = selectedIds.map(id => deleteDoc(doc(db, "chat_sessions", id)));
            await Promise.all(promises);

            // Cleanup state
            if (selectedIds.includes(selectedSession?.id)) setSelectedSession(null);
            setSelectedIds([]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === sessions.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(sessions.map(s => s.id));
        }
    };

    const toggleSelectOne = (e, id) => {
        e.stopPropagation();
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(sid => sid !== id));
        } else {
            setSelectedIds(prev => [...prev, id]);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "";
        return new Date(timestamp.seconds * 1000).toLocaleString('tr-TR');
    };

    return (
        <div className="flex h-[calc(100vh-200px)] gap-6">
            {/* Sidebar List */}
            <div className="w-1/3 bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={sessions.length > 0 && selectedIds.length === sessions.length}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-green-500 focus:ring-green-500/50"
                        />
                        <h3 className="text-white font-bold">Sohbetler ({sessions.length})</h3>
                    </div>
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBatchDelete}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs px-3 py-1 rounded-full border border-red-500/20 transition-colors flex items-center gap-1"
                        >
                            <FaTrash size={10} />
                            Seçilileri Sil ({selectedIds.length})
                        </button>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto">
                    {sessions.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500 text-sm">Hiç sohbet yok.</div>
                    ) : (
                        sessions.map(session => (
                            <div
                                key={session.id}
                                onClick={() => setSelectedSession(session)}
                                className={`p-4 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800 transition-colors ${selectedSession?.id === session.id ? 'bg-zinc-800 border-l-4 border-l-green-500' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(session.id)}
                                            onChange={(e) => toggleSelectOne(e, session.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-green-500 focus:ring-green-500/50"
                                        />
                                        <span className="text-zinc-300 font-medium text-sm truncate">
                                            {session.platform || "Bilinmeyen Cihaz"}
                                        </span>
                                    </div>
                                    <button onClick={(e) => handleDelete(e, session.id)} className="text-zinc-600 hover:text-red-500 p-1">
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                                <div className="pl-7">
                                    <div className="text-xs text-zinc-500 mb-2 flex items-center gap-1">
                                        <FaClock size={10} /> {formatDate(session.lastMessageAt)}
                                    </div>
                                    <div className="text-xs text-zinc-400 truncate">
                                        {session.messages[session.messages.length - 1]?.text || "Mesaj yok"}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Detail View */}
            <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                {selectedSession ? (
                    <>
                        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-white font-bold text-sm">Sohbet Detayı</h3>
                                <p className="text-xs text-zinc-500">ID: {selectedSession.id}</p>
                            </div>
                            <div className="text-xs text-zinc-500">
                                Başlangıç: {formatDate(selectedSession.startedAt)}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/20">
                            {selectedSession.messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex flex-col max-w-[70%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`flex items-center gap-2 mb-1 text-xs text-zinc-500`}>
                                            {msg.sender === 'user' ? 'Ziyaretçi' : 'Fahrielsara'}
                                            {msg.sender === 'user' ? <FaUser size={10} /> : <FaRobot size={10} />}
                                        </div>
                                        <div className={`px-4 py-3 rounded-2xl text-sm ${msg.sender === 'user'
                                            ? 'bg-green-600/20 text-green-100 border border-green-500/30 rounded-tr-sm'
                                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-tl-sm'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
                        <FaRobot size={48} className="mb-4 opacity-50" />
                        <p>Görüntülemek için bir sohbet seçin.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatHistory;
