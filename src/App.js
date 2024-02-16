import React, {useEffect, useState} from 'react';
import {Outlet} from "react-router-dom";
import Navbar from "./portal/navbar/Navbar";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const checkUserToken = () => {
        const userToken = localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE);
        if (!userToken || userToken === 'undefined') {
            setIsLoggedIn(false);
        }
        setIsLoggedIn(true);
    }
    useEffect(() => {
        checkUserToken();
    }, [isLoggedIn]);
    return (
        <React.Fragment>
            <ToastContainer />
            {isLoggedIn && <Navbar/>}
            <Outlet/>
        </React.Fragment>
    );
}

export default App;
