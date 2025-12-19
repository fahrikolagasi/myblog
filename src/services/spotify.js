import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { songs } from '../data/songs';

// --- Local Fallback ---
const getLocalDailySong = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const songIndex = dayOfYear % songs.length;
    return { ...songs[songIndex], isLocal: true };
};

// --- Firestore Listener ---
// --- Firestore Listener ---
export const subscribeToSongOfTheDay = (callback) => {
    // Default to local song initially if you want instant render, 
    // OR null if you want to wait. Let's start with local but strict updates.
    // Actually, to prevent "changing", let's start with loading state or previous known state.
    // But since the component handles "null" by not rendering, maybe we pass null?
    // The current component renders nothing if !song.
    // Let's pass localData ONLY if doc doesn't exist or error.

    // However, for speed, showing a daily song is better than white space.
    // But the user complained about "changing".
    // So let's NOT show localData immediately if we expect a DB override.
    // Let's rely on onSnapshot. 

    const localFallback = { ...getLocalDailySong(), isPlaying: true };

    try {
        const docRef = doc(db, "metadata", "songOfTheDay");

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                callback({
                    title: data.title || "Unknown Title",
                    artist: data.artist || "Unknown Artist",
                    albumImageUrl: data.albumImageUrl || "",
                    songUrl: data.songUrl || "#",
                    previewUrl: data.previewUrl || null,
                    isPlaying: true
                });
            } else {
                console.log("No song in DB, using local fallback");
                callback(localFallback);
            }
        }, (error) => {
            console.error("Error fetching song:", error);
            // Only fallback on actual error (e.g. offline/permission)
            callback(localFallback);
        });

        return unsubscribe;
    } catch (error) {
        console.error("Firestore setup error:", error);
        callback(localFallback);
        return () => { };
    }
};

// --- Spotify Search API ---
let tempToken = null;
let tokenExpiration = 0;

export const getSpotifyToken = async (clientId, clientSecret) => {
    if (tempToken && Date.now() < tokenExpiration) return tempToken;

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials'
            })
        });

        const data = await response.json();
        if (data.access_token) {
            tempToken = data.access_token;
            tokenExpiration = Date.now() + (data.expires_in * 1000);
            return tempToken;
        } else {
            throw new Error(data.error_description || "Failed to get token");
        }
    } catch (error) {
        console.error("Spotify Auth Error:", error);
        return null;
    }
};

export const searchTracks = async (query, clientId, clientSecret) => {
    const token = await getSpotifyToken(clientId, clientSecret);
    if (!token) return [];

    try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        return data.tracks?.items || [];
    } catch (error) {
        console.error("Spotify Search Error:", error);
        return [];
    }
};
