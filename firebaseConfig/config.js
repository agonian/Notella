// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAV95bLsUiNUY7py1MDzD4zrrhIlgB7kcQ",
  authDomain: "notella-v1.firebaseapp.com",
  projectId: "notella-v1",
  storageBucket: "notella-v1.firebasestorage.app",
  messagingSenderId: "888093051640",
  appId: "1:888093051640:web:218859b32f90f1c921c90d",
  measurementId: "G-1PCQHFNFYS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
