import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyBETO78uB-25zgBYex7D3a2J5k0VJIWL_U",
  authDomain: "andy-chatapp.firebaseapp.com",
  projectId: "andy-chatapp",
  storageBucket: "andy-chatapp.firebasestorage.app",
  messagingSenderId: "435075713477",
  appId: "1:435075713477:web:c9f6abdba6d261eb3563ac",
   measurementId: "G-B8K22LP29C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
