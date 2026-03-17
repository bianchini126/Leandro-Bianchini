import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// As credenciais do projeto IronPulse
const firebaseConfig = {
  apiKey: "AIzaSyBWM93IZy5QELXxg_76MmIRTsP56WWd9yU",
  authDomain: "ironpulse-4b312.firebaseapp.com",
  projectId: "ironpulse-4b312",
  storageBucket: "ironpulse-4b312.firebasestorage.app",
  messagingSenderId: "543531817331",
  appId: "1:543531817331:web:64b5ce1a96f369d0e1cd06",
  measurementId: "G-F4S2SY0QVH"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa os serviços
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
