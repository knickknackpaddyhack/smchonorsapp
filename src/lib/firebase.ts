import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function initializeFirebase() {
    if (!firebaseConfig.projectId) {
        console.warn("Firebase config not found, features requiring Firebase will be disabled or use mock data.");
        return null;
    }
    
    try {
        return !getApps().length ? initializeApp(firebaseConfig) : getApp();
    } catch (e) {
        console.error("Failed to initialize Firebase", e);
        return null;
    }
}

const app = initializeFirebase();
const db = app ? getFirestore(app) : null;

export { app, db };
