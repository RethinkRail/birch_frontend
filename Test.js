// /**
//  * @author : Mithun Sarker
//  * @mailto : mithun@ihrail.com
//  * @created : 7/19/2024, Friday
//  * Description:
//  **/
//
//
// // src/App.js
// import React, {useEffect} from 'react';
// import {auth, messaging} from './src/firebase';
// import {getToken} from 'firebase/messaging';
// import {onAuthStateChanged, signInWithEmailAndPassword} from 'firebase/auth';
//
// function App() {
//     useEffect(() => {
//         const unsubscribe = onAuthStateChanged(auth, async (user) => {
//             if (user) {
//                 console.log('User signed in:', user);
//                 try {
//                     const currentToken = await getToken(messaging, {vapidKey: 'YOUR_VAPID_KEY'});
//                     if (currentToken) {
//                         console.log('FCM Token:', currentToken);
//                         await saveTokenToServer(currentToken);
//                     } else {
//                         console.log('No registration token available.');
//                     }
//                 } catch (error) {
//                     console.error('An error occurred while retrieving token: ', error);
//                 }
//             }
//         });
//
//         return () => unsubscribe();
//     }, []);
//
//     const saveTokenToServer = async (token) => {
//         const response = await fetch('http://localhost:3000/api/save-token', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({token}),
//         });
//
//         if (response.ok) {
//             console.log('Token saved successfully');
//         } else {
//             console.error('Error saving token');
//         }
//     };
//
//     const handleLogin = () => {
//         signInWithEmailAndPassword(auth, 'user@example.com', 'password123')
//             .then((userCredential) => {
//                 console.log('Signed in:', userCredential.user);
//             })
//             .catch((error) => {
//                 console.error('Error signing in:', error);
//             });
//     };
//
//     return (
//         <div className="App">
//             <h1>Firebase Cloud Messaging</h1>
//             <button onClick={handleLogin}>Sign In</button>
//         </div>
//     );
// }
//
// export default App;
