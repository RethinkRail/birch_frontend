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
import DepartmentReport from "./portal/report/DepartmentReport";
import TableComponent from "./components/TableComponent";
import RoutingMatrixEditor from "./portal/management/RoutingMatrixEditor";
import DataTableComponent from "./components/DataTableComponent";

import SummaryReportMaterial from "./portal/report/SummaryReportMaterial";
import PartReport from "./portal/report/PartReport";
import EmissionReport from "./portal/report/EmissionReport";
import TimeCompare from "./portal/report/TimeCompare";
import TimeLogByDepartment from "./portal/report/TimeLogByDepartment";
import CrewManagement from "./portal/management/CrewManagement";
import UserManagement from "./portal/management/UserManagement";
import StorageReport from "./portal/report/StorageReport";
import WorkStationManager from "./portal/time/WorkStationManager";
import TimeApproval from "./portal/time/TimeApproval";

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
            console.error('Service Worker registration failed:', error);
        });
}


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
                <Route path="/department_report" element={
                    <ProtectedRoute>
                        <DepartmentReport/>
                    </ProtectedRoute>
                }>
                </Route>

                <Route path="/emission_report" element={
                    <ProtectedRoute>
                        <EmissionReport/>
                    </ProtectedRoute>
                }>
                </Route>

                <Route path="/summary_report" element={
                    <ProtectedRoute>
                        <SummaryReportMaterial/>
                    </ProtectedRoute>
                }>
                </Route>
                <Route path="/part_report" element={
                    <ProtectedRoute>
                        <PartReport/>
                    </ProtectedRoute>
                }>
                </Route>

                <Route path="/qb_time_compare" element={
                    <ProtectedRoute>
                        <TimeCompare/>
                    </ProtectedRoute>
                }>
                </Route>

                <Route path="/storage_report" element={
                    <ProtectedRoute>
                        <StorageReport/>
                    </ProtectedRoute>
                }>
                </Route>
                <Route path="/routing_matrix" element={
                    <ProtectedRoute>
                        <RoutingMatrixEditor/>
                    </ProtectedRoute>
                }>
                </Route>

                <Route path="/team_member_management" element={
                    <ProtectedRoute>
                        <CrewManagement/>
                    </ProtectedRoute>
                }>
                </Route>

                <Route path="/user_management" element={
                    <ProtectedRoute>
                        <UserManagement/>
                    </ProtectedRoute>
                }>
                </Route>

                <Route path="/work_station" element={
                    <ProtectedRoute>
                        <WorkStationManager/>
                    </ProtectedRoute>
                }>
                </Route>

                <Route path="/time_approval" element={
                    <ProtectedRoute>
                        <TimeApproval/>
                    </ProtectedRoute>
                }>
                </Route>

                <Route path="/department_time_report" element={
                    <ProtectedRoute>
                        <TimeLogByDepartment/>
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
