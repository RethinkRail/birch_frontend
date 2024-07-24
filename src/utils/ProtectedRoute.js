import {useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {auth} from "../firebase";
import qs from "qs";
import axios from "axios";

const ProtectedRoute = (props) => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const handleGetUser = async () => {
        auth.onAuthStateChanged(async (user) => {

            if(user == null){
                setIsLoggedIn(false)
                return navigate('/auth/login');
            }else {
                let data = qs.stringify({
                    'name': user.displayName,
                    'email': user.email,
                    'access_token':user.accessToken
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
                            if(response.data.is_active ==1){
                                setIsLoggedIn(true)
                            }else {

                                setIsLoggedIn(false)
                                return navigate('/auth/login');
                            }
                        } else {

                            setIsLoggedIn(false)
                            return navigate('/auth/login');
                        }

                    })
                    .catch((error) => {
                        setIsLoggedIn(false)
                        return navigate('/auth/login');
                        console.log(error);
                    });
            }


        }, (error) => {
            console.error(error);
            return navigate('/auth/login');
            setIsLoggedIn(false)
        })
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