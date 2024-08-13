import {initializeApp} from 'firebase/app';
import {getMessaging, getToken,onMessage } from 'firebase/messaging';
import {getAuth, GoogleAuthProvider} from "firebase/auth";
import axios from "axios";
import qs from "qs";


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
// export const messaging = getMessaging(app);


// export const requestForToken = () => {
//     return getToken(messaging, { vapidKey: process.env.REACT_APP_FIREBASE_VAP_ID_KEY})
//         .then((currentToken) => {
//             if (currentToken) {
//                 console.log('current token for client: ', currentToken);
//                 if(JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["id"]){
//                     return
//                 }
//
//                 let data = qs.stringify({
//                     'user_id': JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["id"],
//                     'token': currentToken
//                 });
//                 let config = {
//                     method: 'post',
//                     url: process.env.REACT_APP_BIRCH_API_URL + 'update_token',
//                     headers: {
//                         'Content-Type': 'application/x-www-form-urlencoded',
//                         'Accept': 'application/json'
//                     },
//                     data: data
//                 };
//
//                 axios.request(config)
//                     .then((response) => {
//                         console.log(response.status)
//                         if (response.status === 200) {
//                         } else {
//                             console.log("something wrong")
//                         }
//
//                     })
//                     .catch((error) => {
//                         console.log(error);
//                     });
//                 // ...
//             } else {
//                 console.log('No registration token available. Request permission to generate one.');
//                 // Show permission UI.
//             }
//         })
//         .catch((err) => {
//             console.log('An error occurred while retrieving token. ', err);
//             // ...
//         });
// };
//
// export const onMessageListener = () =>
//     new Promise((resolve) => {
//         onMessage(messaging, (payload) => {
//             resolve(payload);
//         });
//     });

// const setupNotifications = async () => {
//     try {
//         // Request permission for notifications
//         const permission = await Notification.requestPermission();
//
//         if (permission === 'granted') {
//             console.log('Notification permission granted.');
//             // Get the FCM token
//             const token = await getToken(messaging);
//             console.log('FCM Token:', token);
//         } else {
//             console.log('Notification permission denied.');
//         }
//         // Handle foreground notifications
//         onMessage(messaging, (payload) => {
//             console.log('Foreground Message:', payload);
//             // Handle the notification or update your UI
//         });
//     } catch (error) {
//         console.error('Error setting up notifications:', error);
//     }
// };

export const provider = new GoogleAuthProvider();
provider.addScope("email")
provider.addScope("profile")
provider.setCustomParameters({
    hd: "example.com"
});