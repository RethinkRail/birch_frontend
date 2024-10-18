/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 10/17/2024, Thursday
 * Description:
 **/

import axios from 'axios';
const TOKEN = "S.19__dc7945ec5a5a253bcdc62b8b469fa1d18f010ec6";
const URL = "https://rest.tsheets.com/api/v1/timesheets";

// Extraction Function
async function extractData(startDate, endDate) {

    let page = 1;
    let mergedData = {};
    const URL = "https://rest.tsheets.com/api/v1/timesheets";
    const TOKEN = "S.19__dc7945ec5a5a253bcdc62b8b469fa1d18f010ec6";
    let willFetchAgain = true
    try {
        // while (willFetchAgain) {
        //     console.log(`Connecting to QuickBooks API for page ${page}...`);
        //     let config = {
        //         method: 'get',
        //         maxBodyLength: Infinity,
        //         url: 'https://rest.tsheets.com/api/v1/timesheets?start_date='+startDate+'&end_date='+endDate+'&on_the_clock=both&page='+page,
        //         headers: {
        //             'Authorization': 'Bearer '+TOKEN,
        //         }
        //     };
        //     console.log(config)
        //     axios.request(config)
        //         .then((response) => {
        //             if(response.status==200){
        //                 const data =  response.data;
        //                 console.log(data)
        //                 if (!Object.keys(data.results.timesheets).length) {
        //                     console.log(`No more timesheets found on page ${page}.`);
        //                     willFetchAgain= false
        //                 }
        //                 mergedData = mergeObjects(mergedData, data);
        //                 page++;
        //             }
        //         })
        //         .catch((error) => {
        //             console.log(error);
        //         });
        // }

        //const axios = require('axios');

        const myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer S.19__dc7945ec5a5a253bcdc62b8b469fa1d18f010ec6");
        //myHeaders.append("Cookie", "ivid=5cb679a4-7345-42d0-b061-d241e76e182a");

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
        };

        fetch("https://rest.tsheets.com/api/v1/timesheets?on_the_clock=both&page=1&start_date=2024-10-15&end_date=2024-10-15", requestOptions)
            .then((response) => response.text())
            .then((result) => console.log(result))
            .catch((error) => console.error(error));


    } catch (error) {
        console.error("Failed to extract data:", error);
    }

    return mergedData;
}

function mergeObjects(obj1, obj2) {
    if (typeof obj1 === 'object' && typeof obj2 === 'object') {
        const merged = { ...obj1 };
        for (const key in obj2) {
            if (key in obj1) {
                merged[key] = mergeObjects(obj1[key], obj2[key]);
            } else {
                merged[key] = obj2[key];
            }
        }
        return merged;
    }
    return Array.isArray(obj1) && Array.isArray(obj2) ? [...obj1, ...obj2] : obj1;
}

// Transform the extracted data
function transformData(jsonData) {
    try {
        const users = jsonData.supplemental_data.users;

        Object.values(users).forEach(user => {
            user.crew_name = `${user.first_name} ${user.last_name}`;
        });

        const timesheets = Object.values(jsonData.results.timesheets);
        const transformed = timesheets.map(sheet => {
            const user = users[sheet.user_id] || {};
            const serviceItem = Object.values(sheet.customfields || {}).filter(Boolean).join('|');
            const startTimeChicago = convertToChicagoTime(sheet.start.slice(0, 10)); // Apply Chicago conversion

            return {
                employee_number: user.employee_number || '',
                employee_name: user.crew_name || '',
                time_in_qb: parseInt(sheet.duration, 10) || 0,
                start_hour: startTimeChicago.slice(11, 16), // Extract the hour from Chicago time
                service_item: serviceItem
            };
        });

        return mergeEmployeeRecords(transformed);
    } catch (error) {
        console.error("Transformation error:", error);
        return [];
    }
}

// Merge employee records by summing their durations
function mergeEmployeeRecords(records) {
    const merged = {};

    records.forEach(record => {
        const key = `${record.employee_number}-${record.employee_name}`;
        merged[key] = merged[key] || { ...record, time_in_qb: 0 };
        merged[key].time_in_qb += record.time_in_qb;
    });

    return Object.values(merged);
}

// Convert UTC date to Chicago timezone manually
function convertToChicagoTime(dateString) {
    const utcDate = new Date(`${dateString}T00:00:00Z`); // Parse as UTC
    const offset = -5; // Chicago is UTC-5 (CST)
    const chicagoTime = new Date(utcDate.getTime() + offset * 60 * 60 * 1000);
    return chicagoTime.toISOString().replace('T', ' ').slice(0, 19);
}

// Main function to extract and transform data
export async function fetchAndTransformTimesheets(startDate, endDate) {
    const rawData = await extractData(startDate, endDate);
    console.log(rawData)
    const transformedData = transformData(rawData);
    return transformedData;
}

// // Example usage
// (async () => {
//     const result = await fetchAndTransformTimesheets('2024-10-01', '2024-10-10');
//     console.log(JSON.stringify(result, null, 2));
// })();
