import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCAo0gK-k2N3QybA7jeCgpK-Nr05nkD0y8",
  authDomain: "bottank-e0aae.firebaseapp.com",
  projectId: "bottank-e0aae",
  storageBucket: "bottank-e0aae.firebasestorage.app",
  messagingSenderId: "1089522069613",
  appId: "1:1089522069613:web:ca2125993c9a8ce8334f64"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
