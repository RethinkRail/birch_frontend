/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 8/16/2024, Friday
 * Description:
 **/
import React from "react";

const navbarItems = [
    { link: "/", label: "Work Order" },
    { link: "/database", label: "Database" },
    {
        link: "/management",
        label: "Management",
        subItems: [
            { link: "/user_management", label: "Birch User Management" },
            { link: "/team_member_management", label: "Team Member Management" },
            { link: "/routing_matrix", label: "Routing Matrix" }
        ]
    },
    { link: "/time-operation", label: "Time Operation" },
    {
        link: "/report",
        label: "Report",
        subItems: [
            { link: "/summary_report", label: "Summary Report" },
            { link: "/emission_report", label: "Emission Report" },
            { link: "/time_compare", label: "Time Compare" },
            { link: "/scheduler", label: "Scheduler" },
            { link: "/department_report", label: "Department Report" },
            {
                link: "/management_reports",
                label: "Management Reports",
                subItems: [
                    { link: "/revenue_by_customer", label: "Revenue by Customer" },
                    { link: "/revenue_by_department", label: "Revenue by Department" },
                    { link: "/revenue_recognition", label: "Revenue Recognition" },
                    { link: "/billed_cars", label: "Billed Cars" }
                ]
            },
            {
                link: "/operations_reports",
                label: "Operations Reports",
                subItems: [
                    { link: "/shop_summary_report", label: "Shop Summary Report" },
                    { link: "/manhours", label: "Manhours" },
                    { link: "/billing_efficiency", label: "Billing Efficiency" },
                    { link: "/utilization", label: "Utilization" },
                    { link: "/pod_accuracy", label: "POD Accuracy" },
                    { link: "/days_in_status", label: "Days in Status" }
                ]
            },
            {
                link: "/purchasing",
                label: "Purchasing",
                subItems: [
                    { link: "/revenue_recognition_inventory", label: "Revenue Recognition - Inventory" },
                    { link: "/allocated_inventory", label: "Allocated Inventory" }
                ]
            },
            {
                link: "/misc_reports",
                label: "Misc. Reports",
                subItems: [
                    { link: "/user_activity", label: "User Activity" },
                    { link: "/emissions", label: "Emissions" },
                    { link: "/qb_time_compare", label: "QB Time Compare" }
                ]
            }
        ]
    }
];


const navItems = [
    { title: 'Work Order', path: '/' },
    { title: 'Database', path: '/database' },
    {
        title: 'Management',
        children: [
            { title: 'Birch User Management', path: '/user_management' },
            { title: 'Team Member Management', path: '/team_member_management' },
            { title: 'Routing Matrix', path: '/routing_matrix' }
        ]
    },
    { title: 'Time Operation', path: '/time-operation' },
    {
        title: 'Report',
        children: [
            { title: 'Summary Report', path: '/summary_report' },
            { title: 'Emission Report', path: '/emission_report' },
            { title: 'Time Compare', path: '/time_compare' },
            { title: 'Scheduler', path: '/scheduler' },
            { title: 'Department Report', path: '/department_report' },
            {
                title: 'Management Reports',
                children: [
                    { title: 'Revenue by Customer', path: '/revenue_by_customer' },
                    { title: 'Revenue by Department', path: '/revenue_by_department' },
                    { title: 'Revenue Recognition', path: '/revenue_recognition' },
                    { title: 'Billed Cars', path: '/billed_cars' }
                ]
            },
            {
                title: 'Operations Reports',
                children: [
                    { title: 'Shop Summary Report', path: '/shop_summary_report' },
                    { title: 'Manhours', path: '/manhours' },
                    { title: 'Billing Efficiency', path: '/billing_efficiency' },
                    { title: 'Utilization', path: '/utilization' },
                    { title: 'POD Accuracy', path: '/pod_accuracy' },
                    { title: 'Days in Status', path: '/days_in_status' }
                ]
            },
            {
                title: 'Purchasing',
                children: [
                    { title: 'Revenue Recognition - Inventory', path: '/revenue_recognition_inventory' },
                    { title: 'Allocated Inventory', path: '/allocated_inventory' }
                ]
            },
            {
                title: 'Misc. Reports',
                children: [
                    { title: 'User Activity', path: '/user_activity' },
                    { title: 'Emissions', path: '/emissions' },
                    { title: 'QB Time Compare', path: '/qb_time_compare' }
                ]
            }
        ]
    }
];



