// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBu3kU2KFBQdLuff-BvIKX0KFwQ6hYPGq4",
  authDomain: "liste-courses-73c14.firebaseapp.com",
  projectId: "liste-courses-73c14",
  storageBucket: "liste-courses-73c14.firebasestorage.app",
  messagingSenderId: "15434063766",
  appId: "1:15434063766:web:1eae676d1ba58ffe1487b7",
  measurementId: "G-YMDTGLC1ZX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
