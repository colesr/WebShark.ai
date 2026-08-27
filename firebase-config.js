// Firebase configuration and initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyAm9bgQyrZYNzOv8NU7Cu_5WkHbW-ZiCn4",
  authDomain: "webshark-ai-sharkboard.firebaseapp.com",
  projectId: "webshark-ai-sharkboard",
  storageBucket: "webshark-ai-sharkboard.firebasestorage.app",
  messagingSenderId: "192919464707",
  appId: "1:192919464707:web:76ee171da8a633a2389736"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export for use in script.js
window.firebaseApp = app;
window.firebaseDb = db;