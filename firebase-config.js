const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { GoogleAuthProvider, getAuth } = require("firebase/auth");

require("dotenv").config(".env")

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get references to authentication and Firestore services
const auth = getAuth(app);
const database = getFirestore(app);
const provider = new GoogleAuthProvider();

module.exports = { database, auth, provider, firebaseConfig };
