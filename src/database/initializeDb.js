// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFwhQc1p-VofCeZws-F7rTv2I_by60SbU",
  authDomain: "storage-179a9.firebaseapp.com",
  projectId: "storage-179a9",
  storageBucket: "storage-179a9.appspot.com",
  messagingSenderId: "902648877149",
  appId: "1:902648877149:web:c942262f908e876bc1fdb4",
};

// Initialize Firebase
export default function initDb() {
  const app = initializeApp(firebaseConfig);
}
