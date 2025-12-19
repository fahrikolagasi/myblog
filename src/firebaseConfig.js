import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDnpLPXNNjdHUCf40GmU1TYPusE7ZP1rVo",
    authDomain: "blog-b7b70.firebaseapp.com",
    projectId: "blog-b7b70",
    storageBucket: "blog-b7b70.firebasestorage.app",
    messagingSenderId: "792088818368",
    appId: "1:792088818368:web:5fdccc24ec288f0f67f325",
    measurementId: "G-G8DW37R4BC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { db, storage };
