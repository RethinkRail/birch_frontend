// Import Firebase scripts using importScripts() in service workers
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Initialize Firebase
firebase.initializeApp({
    apiKey: "%REACT_APP_FIREBASE_API_KEY%",
    authDomain: "%REACT_APP_FIREBASE_AUTH_DOMAIN%",
    projectId: "%REACT_APP_FIREBASE_PROJECT_ID%",
    storageBucket: "%REACT_APP_FIREBASE_STORAGE_BUCKET%",
    messagingSenderId: "%REACT_APP_FIREBASE_MESSAGING_SEND_ID%",
    appId: "%REACT_APP_FIREBASE_APP_ID%",
    measurementId: "%REACT_APP_FIREBASE_MESSUREMENT_ID%",
});


// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    if (!payload.notification) return;

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/firebase-logo.png',
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});