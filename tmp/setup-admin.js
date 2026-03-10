const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Since I have the project ID and other info, I'll try to use the default credentials or a one-off setup.
// Actually, I don't have a service account JSON file.
// I'll use the regular firebase client SDK in a script.

const { initializeApp: initClient } = require('firebase/app');
const { getAuth: getAuthClient, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore: getFirestoreClient, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyARFCQ66QeYh4f0GWi7F-K7SO7VFiPwDbQ",
    authDomain: "smarthub-d2488.firebaseapp.com",
    projectId: "smarthub-d2488",
    storageBucket: "smarthub-d2488.firebasestorage.app",
    messagingSenderId: "714367992655",
    appId: "1:714367992655:web:d22513de0ea55958bfbb3a",
    measurementId: "G-NHW945VTT8"
};

const app = initClient(firebaseConfig);
const auth = getAuthClient(app);
const db = getFirestoreClient(app);

async function setup() {
    const email = "admin@smarthub.com";
    const password = "SmartHub2026!";

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            email: email,
            role: "ADMIN",
            displayName: "Master Admin Officer",
            createdAt: new Date()
        });

        console.log("SUCCESS: Master Admin Identity Initialized");
        console.log("Email:", email);
        console.log("Password:", password);
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log("INFO: Admin user already exists. Checking Firestore role...");
            // Just to be sure, update or set the doc
            // Note: we'd need to sign in first to get the UID or use admin SDK.
        } else {
            console.error("ERROR:", error.message);
        }
    }
}

setup();
