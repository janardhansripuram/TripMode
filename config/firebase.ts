import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
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