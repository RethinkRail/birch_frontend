import {useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {auth, messaging} from "../firebase";
import qs from "qs";
import axios from "axios";
import {getToken} from "firebase/messaging";

const ProtectedRoute = (props) => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    let token
    console.log("In protected screen")
    const handleGetUser = async () => {

        auth.onAuthStateChanged(async (user) => {

            if (user == null) {
                setIsLoggedIn(false)
                return navigate('/auth/login');
            } else {
                setIsLoggedIn(true)
                // token    = await requestPermissionAndGetToken();
                // if(token){
                //     await axios.post(`${process.env.REACT_APP_BIRCH_API_URL}subscribe_all`, {token});
                //     let data = qs.stringify({
                //         'name': user.displayName,
                //         'email': user.email,
                //         'access_token': user.accessToken,
                //         'cloud_message_token': token
                //     });
                //
                //     let config = {
                //         method: 'post',
                //         url: process.env.REACT_APP_BIRCH_API_URL + 'google_login',
                //         headers: {
                //             'Content-Type': 'application/x-www-form-urlencoded',
                //             'Accept': 'application/json'
                //         },
                //         data: data
                //     };
                //
                //     axios.request(config)
                //         .then((response) => {
                //             if (response.status === 200) {
                //                 if (response.data.is_active == 1) {
                //                     setIsLoggedIn(true)
                //                     localStorage.setItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE, JSON.stringify(response.data))
                //                 } else {
                //
                //                     setIsLoggedIn(false)
                //                     return navigate('/auth/login');
                //                 }
                //             } else {
                //
                //                 setIsLoggedIn(false)
                //                 return navigate('/auth/login');
                //             }
                //
                //         })
                //         .catch((error) => {
                //             setIsLoggedIn(false)
                //             return navigate('/auth/login');
                //             console.log(error);
                //         });
                // }else {
                //     let data = qs.stringify({
                //         'name': user.displayName,
                //         'email': user.email,
                //         'access_token': user.accessToken,
                //         'cloud_message_token': ""
                //     });
                //
                //     let config = {
                //         method: 'post',
                //         url: process.env.REACT_APP_BIRCH_API_URL + 'google_login',
                //         headers: {
                //             'Content-Type': 'application/x-www-form-urlencoded',
                //             'Accept': 'application/json'
                //         },
                //         data: data
                //     };
                //
                //     axios.request(config)
                //         .then((response) => {
                //             if (response.status === 200) {
                //                 if (response.data.is_active == 1) {
                //                     setIsLoggedIn(true)
                //                     localStorage.setItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE, JSON.stringify(response.data))
                //                 } else {
                //
                //                     setIsLoggedIn(false)
                //                     return navigate('/auth/login');
                //                 }
                //             } else {
                //
                //                 setIsLoggedIn(false)
                //                 return navigate('/auth/login');
                //             }
                //
                //         })
                //         .catch((error) => {
                //             setIsLoggedIn(false)
                //             return navigate('/auth/login');
                //             console.log(error);
                //         });
                // }

            }


        }, (error) => {
            console.error(error);
            return navigate('/auth/login');
            setIsLoggedIn(false)
        })
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


    useEffect(() => {
        handleGetUser();
    }, [isLoggedIn]);
    return (
        <React.Fragment>
            {
                isLoggedIn ? props.children : null
            }
        </React.Fragment>
    );
}
export default ProtectedRoute;