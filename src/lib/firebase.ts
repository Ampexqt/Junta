import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA6auzv_ofgyImpTNX5-78geIsvX0QtjFs",
  authDomain: "junta-a4eca.firebaseapp.com",
  projectId: "junta-a4eca",
  storageBucket: "junta-a4eca.firebasestorage.app",
  messagingSenderId: "58941461436",
  appId: "1:58941461436:web:fb816f43079c30bfd0d1b9",
  measurementId: "G-XWT7YKZD5L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;
