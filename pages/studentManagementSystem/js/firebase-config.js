import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { state } from "./state.js";
import { showToast } from "./ui.js";

const firebaseConfig = {
    apiKey: "AIzaSyCvvZQjQTbvM-l1CrfeAmXO-vykBnJOexk",
    authDomain: "registration-93e51.firebaseapp.com",
    projectId: "registration-93e51",
    storageBucket: "registration-93e51.firebasestorage.app",
    messagingSenderId: "509440941274",
    appId: "1:509440941274:web:ae0ebbd4ceadca0a4dd9e3"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';

export const getColRef = (colName) => collection(db, 'artifacts', appId, 'public', 'data', colName);

export { firebaseConfig };
