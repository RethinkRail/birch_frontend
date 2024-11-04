import React, {useRef} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {toast, ToastContainer} from "react-toastify";
import {GoogleAuthProvider, signInWithPopup} from 'firebase/auth';
import {auth, messaging} from "../../firebase";
import {getToken} from "firebase/messaging";


const qs = require('qs');

const Login = () => {
    const provider = new GoogleAuthProvider();
    provider.addScope("email")
    provider.addScope("profile")
    provider.setCustomParameters({
        hd: "ihrail.com"
    });
    const navigate = useNavigate()
    const toastId = useRef(null)
    let token
    const submitLoginForm = (event) => {
        event.preventDefault();
        toastId.current = toast.loading("Loading...")
        signInWithPopup(auth, provider).then(async (user) => {

            const domain = (user.user.email || "").split("@").pop();
            const isValid = domain === process.env.REACT_APP_WORKSPACE_DOMAIN;
            if (!isValid) {
                auth.signOut();
                toast.update(toastId.current, {
                    render: `Only ${process.env.REACT_APP_WORKSPACE_DOMAIN} workspace is allowed!`,
                    autoClose: 3000,
                    type: "error",
                    hideProgressBar: true,
                    isLoading: false
                });
                return
            }

            token    = await requestPermissionAndGetToken();
            if(token){
                await axios.post(`${process.env.REACT_APP_BIRCH_API_URL}subscribe_all`, {token});
                let data = qs.stringify({
                    'name': user.user.displayName,
                    'email': user.user.email,
                    'access_token': user.user.accessToken,
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
                    .then(async (response) => {
                        if (response.status === 200) {


                            if (response.data.is_active == 0) {

                                toast.update(toastId.current, {
                                    render: "Your account is waiting for activation contact HR",
                                    autoClose: 5000,
                                    type: "info",
                                    hideProgressBar: true,
                                    isLoading: false,
                                });
                            } else if (response.data.is_active == 1) {
                                toast.update(toastId.current, {
                                    render: "Login successful",
                                    autoClose: 1000,
                                    type: "success",
                                    hideProgressBar: true,
                                    isLoading: false,
                                });
                                localStorage.setItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE, JSON.stringify(response.data))
                                navigate("/")
                            } else {
                                toast.update(toastId.current, {
                                    render: "Your account is deactivated",
                                    autoClose: 5000,
                                    type: "error",
                                    hideProgressBar: true,
                                    isLoading: false,
                                });
                            }
                        } else {
                            toast.update(toastId.current, {
                                render: "Something went wrong",
                                autoClose: 3000,
                                type: "error",
                                hideProgressBar: true,
                                isLoading: false
                            });
                        }

                    })
                    .catch((error) => {
                        console.log(error);
                        toast.update(toastId.current, {
                            render: "Something went wrong",
                            autoClose: 3000,
                            type: "error",
                            hideProgressBar: true,
                            isLoading: false
                        });
                    });
            }else {
                let data = qs.stringify({
                    'name': user.user.displayName,
                    'email': user.user.email,
                    'access_token': user.user.accessToken,
                    'cloud_message_token': ""
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
                    .then(async (response) => {
                        if (response.status === 200) {


                            if (response.data.is_active == 0) {

                                toast.update(toastId.current, {
                                    render: "Your account is waiting for activation contact HR",
                                    autoClose: 5000,
                                    type: "info",
                                    hideProgressBar: true,
                                    isLoading: false,
                                });
                            } else if (response.data.is_active == 1) {
                                toast.update(toastId.current, {
                                    render: "Login successful",
                                    autoClose: 1000,
                                    type: "success",
                                    hideProgressBar: true,
                                    isLoading: false,
                                });
                                localStorage.setItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE, JSON.stringify(response.data))
                                navigate("/")
                            } else {
                                toast.update(toastId.current, {
                                    render: "Your account is deactivated",
                                    autoClose: 5000,
                                    type: "error",
                                    hideProgressBar: true,
                                    isLoading: false,
                                });
                            }
                        } else {
                            toast.update(toastId.current, {
                                render: "Something went wrong",
                                autoClose: 3000,
                                type: "error",
                                hideProgressBar: true,
                                isLoading: false
                            });
                        }

                    })
                    .catch((error) => {
                        console.log(error);
                        toast.update(toastId.current, {
                            render: "Something went wrong",
                            autoClose: 3000,
                            type: "error",
                            hideProgressBar: true,
                            isLoading: false
                        });
                    });
            }


        }).catch((error) => {
            console.log(error)
            toast.update(toastId.current, {
                render: "Something went wrong",
                autoClose: 3000,
                type: "error",
                hideProgressBar: true,
                isLoading: false
            });
        });
    }

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
            <section className="bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                    <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                        <img className="w-full h-10 mr-0" src={process.env.PUBLIC_URL + '/logo.png'} alt="logo"/>
                    </a>
                    <div className="px-6 sm:px-0 max-w-sm">
                        <button type="button" onClick={submitLoginForm}
                                className="text-white w-full  bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-between mr-2 mb-2">
                            <svg className="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab"
                                 data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor"
                                      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                            Sign in with Google
                            <div></div>
                        </button>
                    </div>
                </div>
            </section>
        </React.Fragment>
    )
}

export default Login