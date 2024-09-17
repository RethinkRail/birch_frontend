import {initializeApp} from 'firebase/app';

import {getAuth, GoogleAuthProvider} from "firebase/auth";
import {getToken,getMessaging} from "firebase/messaging";
import qs from "qs";
import axios from "axios";



const config = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SEND_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MESSUREMENT_ID,
};

export const app = initializeApp(config);
export const auth = getAuth(app);
export const messaging = getMessaging(app);





export const provider = new GoogleAuthProvider();
provider.addScope("email")
provider.addScope("profile")
provider.setCustomParameters({
    hd: "ihrail.com"
});