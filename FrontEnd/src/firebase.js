// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage"; // Add this import

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "testfirebaseupl-5d728.firebaseapp.com",
    projectId: "testfirebaseupl-5d728",
    storageBucket: "testfirebaseupl-5d728.appspot.com",
    messagingSenderId: "176575748850",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app); // Initialize storage

export { app, storage }; // Export storage along with app
