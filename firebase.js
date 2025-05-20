// app/firebase.js
// This file initializes Firebase and exports Firestore `db`

// Only import these for React Native
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


// ✅ Your Firebase config (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyDNBdAAKAkAhSDD-5s1zCpQ8yct0z760qw",
  authDomain: "pastor-app-71d9a.firebaseapp.com",
  projectId: "pastor-app-71d9a",
  storageBucket: "pastor-app-71d9a.firebasestorage.app",
  messagingSenderId: "902171353514",
  appId: "1:902171353514:web:f51d665f3b95868c398bd3",
};

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
  

// ✅ Export Firestore DB
export const db = getFirestore(app);
