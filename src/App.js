import React, {useEffect, useState} from 'react';
import {Outlet} from "react-router-dom";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {auth, messaging} from "./firebase";
import axios from "axios";
import qs from "qs";
import Navbar from "./portal/navbar/Navbar";
import {getToken} from "firebase/messaging";


function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    console.log("In App screen")
    useEffect(() => {
        handleGetUser();
    }, [isLoggedIn]);

    useEffect(() => {
       //requestForToken();
    }, []);

    // onMessageListener()
    //     .then((payload) => {
    //         console.log('Message received. ', payload);
    //
    //     })
    //     .catch((err) => console.log('Failed to receive message: ', err));

    const handleGetUser = async () => {
        // Disable the following line when google is back again
        setIsLoggedIn(true)
        return

        auth.onAuthStateChanged(async (user) => {
            if (user == null) {
                setIsLoggedIn(false)
            } else {
                const token = await requestPermissionAndGetToken();
                if(token){
                    await axios.post(`${process.env.REACT_APP_BIRCH_API_URL}subscribe_all`, {token});
                    let data = qs.stringify({
                        'name': user.displayName,
                        'email': user.email,
                        'access_token': user.accessToken,
                        'cloud_message_token': token
                    });

                    let config = {
                        method: 'post',
                        url: process.env.REACT_APP_BIRCH_API_URL + 'google_login',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/json'
                        },
                        data: data
                    };

                    axios.request(config)
                        .then((response) => {
                            if (response.status === 200) {
                                if (response.data.is_active == 1) {
                                    setIsLoggedIn(true)
                                } else {
                                    setIsLoggedIn(false)
                                }
                            } else {
                                setIsLoggedIn(false)
                            }

                        })
                        .catch((error) => {
                            setIsLoggedIn(false)
                            console.log(error);
                        });
                }else {
                    setIsLoggedIn(true)
                }
            }

        }, (error) => {
            console.error(error);
            setIsLoggedIn(false)
        })
    };

    const resizeObserverErr = (e) => {
        console.log("error in app")
        console.log(e.message.toLowerCase())
        if (e.message.toLowerCase().includes("resizeobserver")) {
            e.stopImmediatePropagation();
            console.log("Matches")
        }
    };
    window.addEventListener("error", resizeObserverErr);

    const originalConsoleError = console.error;

    console.error = function(message, ...args) {
        if (typeof message === 'string' && message.includes('ResizeObserver.')) {
            // Suppress this specific error message
            return;
        }
        // Call the original console.error for other errors
        originalConsoleError.apply(console, [message, ...args]);
    };
    const requestPermissionAndGetToken = async () => {
        try {
            // Request notification permission from the user
            return await getToken(messaging, { vapidKey: process.env.REACT_APP_FIREBASE_VAP_ID_KEY })
                .then((currentToken) => {
                    if (currentToken) {
                        console.log('FCM Token:', currentToken);
                        return currentToken;
                    } else {
                        console.log('No registration token available. Request permission to generate one.');
                        return null;
                    }
                })
                .catch((err) => {
                    console.error('An error occurred while retrieving token. ', err);
                    return null;
                });
        } catch (error) {
            console.error("Error getting FCM token:", error.message);
            return null;
        }
    };

    return (
        <React.Fragment>
            <ToastContainer/>
            {isLoggedIn && <Navbar />}
            <Outlet/>
        </React.Fragment>
    );
}

export default App;
