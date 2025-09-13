// src/services/firebase.ts
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, signInAnonymously, Auth } from 'firebase/auth';
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: "AIzaSyB4x-VMjUzrKkvrvpo6Fhc4ngukq1Hk_KM",
  authDomain: "hackmit-3752f.firebaseapp.com",
  databaseURL: "https://hackmit-3752f-default-rtdb.firebaseio.com/",
  projectId: "hackmit-3752f",
  storageBucket: "hackmit-3752f.firebasestorage.app",
  messagingSenderId: "283952690804",
  appId: "1:283952690804:web:bbae57ded4f60fe5a0c321",
};

let app: FirebaseApp;
let db: Database;
let auth: Auth;

// Initialize Firebase lazily to prevent blocking app startup
try {
  console.log('🔥 Initializing Firebase...');
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  auth = getAuth(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  // Create mock objects to prevent crashes
  app = null as any;
  db = null as any;
  auth = null as any;
}

export { db, auth };

export async function ensureAnonAuth(): Promise<string> {
  if (auth.currentUser?.uid) return auth.currentUser.uid;
  const { user } = await signInAnonymously(auth);
  return user.uid;
}
