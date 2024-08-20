import React, {useEffect, useState} from 'react';
import {Outlet} from "react-router-dom";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {auth} from "./firebase";
import axios from "axios";
import qs from "qs";
import Navbar from "./portal/navbar/Navbar";


function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // const menuItems = {
    //     "Work Order": "/",
    //     "Database": "/database",
    //     "Report": {
    //         "Summary Report": "/summary_report",
    //         "Emission Report": "/emission_report",
    //         "Time Compare": "/time_compare",
    //         "Scheduler": "/scheduler",
    //         "Department Report": "/department_report"
    //     },
    //     "Management": {
    //         "Birch User Management": "/user_management",
    //         "Team Member Management": "/team_member_management",
    //         "Routing Matrix": "/routing_matrix"
    //     },
    //     "Time Operation": "/time_operation"
    // }


    // const menuItems = {
    //     "Work Order": "/",
    //     "Database": "/database",
    //     "Report": [
    //         {
    //             "Common": [
    //                 {"Summary Report": "/summary_report"},
    //                 {"Emission Report": "/emission_report"},
    //                 {"Time Compare": "/time_compare"},
    //                 {"Scheduler": "/scheduler"},
    //                 {"Department Report": "/department_report"}
    //             ]
    //         },
    //         {"Management Reports": [
    //                 {"Revenue by Customer": "/revenue_by_customer"},
    //                 {"Revenue by Department": "/revenue_by_department"},
    //                 {"Revenue Recognition": "/revenue_recognition"},
    //                 {"Billed Cars": "/billed_cars"}
    //             ]
    //         },
    //         {"Operations Reports": [
    //                 {"Shop Summary Report": "/shop_summary_report"},
    //                 {"Manhours": "/manhours"},
    //                 {"Billing Efficiency": "/billing_efficiency"},
    //                 {"Utilization": "/utilization"},
    //                 {"POD Accuracy": "/pod_accuracy"},
    //                 {"Days in Status": "/days_in_status"}
    //             ]
    //         },
    //         {"Purchasing": [
    //                 {"Revenue Recognition - Inventory": "/revenue_recognition_inventory"},
    //                 {"Allocated Inventory": "/allocated_inventory"}
    //             ]
    //         },
    //         {"Misc. Reports": [
    //                 {"User Activity": "/user_activity"},
    //                 {"Emissions": "/emissions"},
    //                 {"QB Time Compare": "/qb_time_compare"}
    //             ]
    //         }
    //     ],
    //     "Management": [
    //         {"Birch User Management": "/user_management"},
    //         {"Team Member Management": "/team_member_management"},
    //         {"Routing Matrix": "/routing_matrix"}
    //     ],
    //     "Time Operation": "/time_operation"
    // }
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
            {isLoggedIn && <Navbar />}
            <Outlet/>
        </React.Fragment>
    );
}

export default App;
