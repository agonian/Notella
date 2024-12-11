// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);


export const db = getFirestore(app);