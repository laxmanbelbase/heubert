// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgrQRf1egIVPOruz-ihxP1OgHOPaXn9Is",
  authDomain: "heubertsoft.firebaseapp.com",
  projectId: "heubertsoft",
  storageBucket: "heubertsoft.firebasestorage.app",
  messagingSenderId: "767063751471",
  appId: "1:767063751471:web:f4a28958da295434127fda"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { 
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot
};
export default app;
