import React, {useEffect, useState} from 'react';
import {Outlet} from "react-router-dom";
import Navbar from "./portal/navbar/Navbar";

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
            {isLoggedIn && <Navbar/>}
            <Outlet/>
        </React.Fragment>
    );
}

export default App;
