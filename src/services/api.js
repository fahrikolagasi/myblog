import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Service to interact with Firebase Firestore.
 */

// Collection specific references
const PROJECTS_COLLECTION = "projects";
const SKILLS_COLLECTION = "skills";
const MESSAGES_COLLECTION = "messages";

/**
 * Fetches all projects from the 'projects' collection.
 * @returns {Promise<Array>} List of project objects.
 */
export const fetchProjects = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, PROJECTS_COLLECTION));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching projects:", error);
        throw new Error("Failed to fetch projects. Please try again later.");
    }
};

/**
 * Fetches all skills from the 'skills' collection.
 * @returns {Promise<Array>} List of skill objects.
 */
export const fetchSkills = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, SKILLS_COLLECTION));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching skills:", error);
        throw new Error("Failed to fetch skills. Please try again later.");
    }
};

/**
 * Sends a message/contact form submission to the 'messages' collection.
 * @param {Object} data - The form data (name, email, message, etc.).
 * @returns {Promise<string>} The ID of the new document.
 */
export const sendMessage = async (data) => {
    try {
        if (!data || Object.keys(data).length === 0) {
            throw new Error("No data provided for the message.");
        }
        const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), {
            ...data,
            createdAt: new Date()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error sending message:", error);
        throw new Error("Failed to send message. Please try again later.");
    }
};
