// Import Firebase scripts using importScripts() in service workers
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Initialize Firebase
firebase.initializeApp({
    apiKey: "AIzaSyDEf2G3xjr9KV-As6pEi1kbZpGa9IiT-20",
    authDomain: "ihrailsoftware.firebaseapp.com",
    projectId: "ihrailsoftware",
    storageBucket: "ihrailsoftware.appspot.com",
    messagingSenderId: 679341209032,
    appId: "1:679341209032:web:703f322df8b554912a7cfd",
    measurementId: "G-CZXHT72HW",
});


// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/firebase-logo.png',
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
