import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';


// Your web app's Firebase configuration
const firebaseConfig = {
  // apiKey: Constants.expoConfig?.extra?.firebaseApiKey || "YOUR_FIREBASE_API_KEY",
  // authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || "YOUR_FIREBASE_AUTH_DOMAIN",
  // projectId: Constants.expoConfig?.extra?.firebaseProjectId || "YOUR_FIREBASE_PROJECT_ID",
  // storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || "YOUR_FIREBASE_STORAGE_BUCKET",
  // messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  // appId: Constants.expoConfig?.extra?.firebaseAppId || "YOUR_FIREBASE_APP_ID",
    apiKey: 'AIzaSyC-y4YY70SOfqFu5fdEn6KQP1iil1Ggutg',
    appId: '1:736723332834:android:4d7b077515d8d99544f8bb',
    messagingSenderId: '736723332834',
    projectId: 'oweme-469e0',
    storageBucket: 'oweme-469e0.firebasestorage.app',
    iosBundleId: 'YOUR_IOS_BUNDLE_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'AIzaSyC-y4YY70SOfqFu5fdEn6KQP1iil1Ggutg',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;