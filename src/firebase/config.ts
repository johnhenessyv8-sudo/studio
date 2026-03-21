import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  "projectId": "studio-796625890-3df8a",
  "appId": "1:309324061903:web:675a09f9b2292f5a64ebba",
  "apiKey": "AIzaSyDs-fXovODZPocxOrihlf0k0WZj_0JMaIs",
  "authDomain": "studio-796625890-3df8a.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "309324061903"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth so other files can use it
export const auth = getAuth(app);