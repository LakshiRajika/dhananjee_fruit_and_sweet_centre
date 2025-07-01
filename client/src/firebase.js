// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAjZh2-IlTL-9qCVOY1l0MoyywNu_GhQTU",
  authDomain: "dhananjalee-fruitnsweets.firebaseapp.com",
  projectId: "dhananjalee-fruitnsweets",
  storageBucket: "dhananjalee-fruitnsweets.firebasestorage.app",
  messagingSenderId: "868674317319",
  appId: "1:868674317319:web:979501fea91f0b7a868ea2",
  measurementId: "G-670YLQJJ63"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Set persistence to LOCAL to keep the user signed in
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Firebase persistence set to LOCAL');
  })
  .catch((error) => {
    console.error('Error setting persistence:', error);
  });

export default app;
