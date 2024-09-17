import { useEffect, useState } from "react";
import { messaging } from "../firebase";
import { getToken, onMessage } from "firebase/messaging";

import axios from "axios";

import Toast from "./Toast";
import {ToastContainer} from "react-toastify";

const { REACT_APP_VAPID_KEY } = process.env;


const NotificationHandler = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(()=>{
        handleGetNotificationPermission();
    }, [])

    useEffect(() => {
        const stopMessaging = onMessage(messaging, (payload) => {
            console.log(payload)
            const { notification: data } = payload;
            setNotifications(["jij"])
        })
        return stopMessaging;
    }, [notifications]);

    const handleGetNotificationPermission = async () => {
        //requesting permission using Notification API
        if (!("Notification" in window)) {
            // Check if the browser supports notifications
            alert("This browser does not support desktop notification");
        } else if (Notification.permission === "granted") {
            getUserToken()
        } else {
            // We need to ask the user for permission
            Notification.requestPermission().then(async (permission) => {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    getUserToken();
                    return;
                }
                alert("Notification Permission Denied!");
            });
        }
    }

    const getUserToken = async () => {
        try {
            const token = await getToken(messaging, {
                vapidKey: REACT_APP_VAPID_KEY,
            });
            await axios.post(`${process.env.REACT_APP_BIRCH_API_URL}subscribe_all`, {token});
            console.log("here")
        } catch(err){
            console.error(err);
        }
        // console.log(token);
    }

    const onClose = (index) => {
        const n = notifications.filter((e, i) => i != index);
        setNotifications(n);
    }

    return (
        <ToastContainer position="bottom-end" className="m-2">
            {notifications.map((el, index) => <Toast data={el} onClose={() => onClose(index)} />)}
        </ToastContainer>
    )
}

export default NotificationHandler;