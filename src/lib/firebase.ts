import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA3yDWzfwoNwlOnZmcBlkn7lyFJtGCjWrg",
  authDomain: "battlearena-aa8c0.firebaseapp.com",
  projectId: "battlearena-aa8c0",
  storageBucket: "battlearena-aa8c0.firebasestorage.app",
  messagingSenderId: "20643606204",
  appId: "1:20643606204:web:8b643eb6bfbd20a3b7aab9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
