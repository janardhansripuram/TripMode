import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || "YOUR_FIREBASE_API_KEY",
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: Constants.expoConfig?.extra?.firebaseAppId || "YOUR_FIREBASE_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;