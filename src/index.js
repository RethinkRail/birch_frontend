import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import ProtectedRoute from "./utils/ProtectedRoute";
import Auth from "./auth/Auth";
import Login from "./auth/login/Login";
import AllOrders from "./portal/Home/AllOrders";
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
import RailcarTable from "./portal/report/RailcarTable";
import RevenueByCustomer from "./portal/report/RevenueByCustomer";
import RevenueChart from "./components/RevenueChart";
import QbParts from "./portal/report/QbParts";
import RevenueByDepartments from "./portal/report/RevenueByDepartment";
import StockStatusReport from "./components/StockStatusReport";
import IndirectHour from "./portal/report/IndirectHour";
import UtilizationReport from "./portal/report/UtilizationReport";
import BillingEfficiency from "./portal/report/BillingEfficiency";
import RevenueRecognition from "./portal/report/RevenueRecognition";
import RevenueRecognitionByDepartment from "./portal/report/RevenueRecognitionByDepartment";
import RevenueRecognitionInventroy from "./portal/report/RevenueRecognitionInventroy";
import Attendance from "./portal/management/Attendance";
import ReportDates from "./portal/management/ReportDates";
import BilledCars from "./portal/report/BilledCars";
import DISReport from "./portal/report/DISReport";
import DepartmentChecklistReport from "./components/DepartmentChecklistReport";
import ActiveOrders from "./portal/Home/ActiveOrders";
import MaintenanceOrders from "./portal/Home/MaintenanceOrders";
import TemplateOrders from "./portal/Home/TemplateOrders";
import EnRouteDispoOrders from "./portal/Home/EnRouteDispoOrders";

//Original
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
            console.error('Service Worker registration failed:', error);
        });
}

if (process.env.NODE_ENV === "production") {
    console.log = () => {};
    console.warn = () => {};
    console.info = () => {};
}


// This is the fix for IOS
// if ('serviceWorker' in navigator) {
//     const isChromeOniPad = /CriOS/i.test(navigator.userAgent) && /iPad/i.test(navigator.userAgent);
//
//     if (!isChromeOniPad) {
//         console.log(" working service worker")
//         navigator.serviceWorker.register('/firebase-messaging-sw.js')
//             .then((registration) => {
//                 console.log('Service Worker registered with scope:', registration.scope);
//             })
//             .catch((error) => {
//                 console.error('Service Worker registration failed:', error);
//             });
//     }else {
//         console.log("not working service worker")
//     }
// }


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter basename={'/'}>
        <Routes>
            <Route path='/auth' element={<Auth/>}>
                <Route path='login' element={<Login/>}/>
            </Route>

            <Route path="/" element={<App/>}>
                <Route path="/all_orders" element={
                    <ProtectedRoute>
                        <AllOrders/>
                    </ProtectedRoute>
                }>
                </Route>

                <Route path="" element={
                    <ProtectedRoute>
                        <ActiveOrders/>
                    </ProtectedRoute>
                }>
                </Route>
                <Route path="/maintenance" element={
                    <ProtectedRoute>
                        <MaintenanceOrders/>
                    </ProtectedRoute>
                }>
                </Route>

                <Route path="/template" element={
                    <ProtectedRoute>
                        <TemplateOrders/>
                    </ProtectedRoute>
                }>
                </Route>
                <Route path="/enoute_dispo" element={
                    <ProtectedRoute>
                        <EnRouteDispoOrders/>
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

                <Route path="/rev_by_customer" element={
                    <ProtectedRoute>
                        <RevenueByCustomer/>
                    </ProtectedRoute>
                }>
                </Route>

                <Route path="/rev_by_department" element={
                    <ProtectedRoute>
                        <RevenueByDepartments/>
                    </ProtectedRoute>
                }>
                </Route>


                <Route path="/qb_parts" element={
                    <ProtectedRoute>
                        <QbParts/>
                    </ProtectedRoute>
                }>
                </Route>

                <Route path="/stock_status_report" element={
                    <ProtectedRoute>
                        <StockStatusReport/>
                    </ProtectedRoute>
                }>
                </Route>

                <Route path="/indirect_hour_report" element={
                    <ProtectedRoute>
                        <IndirectHour/>
                    </ProtectedRoute>
                }>
                </Route>


                <Route path="/utilization_report" element={
                    <ProtectedRoute>
                        <UtilizationReport/>
                    </ProtectedRoute>
                }>
                </Route>

                <Route path="/billing_efficiency" element={
                    <ProtectedRoute>
                        <BillingEfficiency/>
                    </ProtectedRoute>
                }>
                </Route>
                <Route path="/revenue_recognition" element={
                    <ProtectedRoute>
                        <RevenueRecognition/>
                    </ProtectedRoute>
                }>
                </Route>

                <Route path="/revenue_recognition_by_department" element={
                    <ProtectedRoute>
                        <RevenueRecognitionByDepartment/>
                    </ProtectedRoute>
                }>
                </Route>
                <Route path="/revenue_recognition_by_inventory" element={
                    <ProtectedRoute>
                        <RevenueRecognitionInventroy/>
                    </ProtectedRoute>
                }>
                </Route>

                <Route path="/billed_cars" element={
                    <ProtectedRoute>
                        <BilledCars/>
                    </ProtectedRoute>
                }>
                </Route>

                <Route path="/attendance" element={
                    <ProtectedRoute>
                        <Attendance/>
                    </ProtectedRoute>
                }>
                </Route>

                <Route path="/payroll" element={
                    <ProtectedRoute>
                        <ReportDates/>
                    </ProtectedRoute>
                }>
                </Route>

                <Route path="/dis_report" element={
                    <ProtectedRoute>
                        <DISReport/>
                    </ProtectedRoute>
                }>
                </Route>
                <Route path="/department_checklist_report" element={
                    <ProtectedRoute>
                        <DepartmentChecklistReport/>
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
