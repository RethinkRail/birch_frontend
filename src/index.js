import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import ProtectedRoute from "./utils/ProtectedRoute";
import Auth from "./auth/Auth";
import Login from "./auth/login/Login";
import Home from "./portal/Home";
import Database from "./portal/database/Database";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter basename={'/'}>
        <Routes>
            <Route path='/auth' element={<Auth/>}>
                <Route path='login' element={<Login/>}/>
            </Route>

            <Route path="/" element={<App/>}>
                <Route path="" element={
                    <ProtectedRoute>
                        <Home/>
                    </ProtectedRoute>
                }>
                </Route>

                <Route path="/database" element={
                    <ProtectedRoute>
                        <Database/>
                    </ProtectedRoute>
                }>
                </Route>

            </Route>

        </Routes>
    </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
