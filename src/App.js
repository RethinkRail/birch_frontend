import React, {useEffect, useState} from 'react';
import {Outlet} from "react-router-dom";
import Navbar from "./portal/navbar/Navbar";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {auth, onMessageListener, requestForToken} from "./firebase";
import axios from "axios";
import qs from "qs";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        handleGetUser();
    }, [isLoggedIn]);

    useEffect(() => {
       //requestForToken();
    }, []);

    onMessageListener()
        .then((payload) => {
            console.log('Message received. ', payload);

        })
        .catch((err) => console.log('Failed to receive message: ', err));

    const handleGetUser = async () => {
        auth.onAuthStateChanged(async (user) => {
            if (user == null) {
                setIsLoggedIn(false)
            } else {
                let data = qs.stringify({
                    'name': user.displayName,
                    'email': user.email,
                    'access_token': user.accessToken
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
            }

        }, (error) => {
            console.error(error);
            setIsLoggedIn(false)
        })
    };

    return (
        <React.Fragment>
            <ToastContainer/>
            {isLoggedIn && <Navbar/>}
            <Outlet/>
        </React.Fragment>
    );
}

export default App;
