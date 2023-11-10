import {useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";

const ProtectedRoute = (props) => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const checkUserToken = () => {
        const userToken = localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE);
        if (!userToken || userToken === 'undefined') {
            setIsLoggedIn(false);
            return navigate('/auth/login');
        }
        setIsLoggedIn(true);
    }
    useEffect(() => {
        checkUserToken();
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