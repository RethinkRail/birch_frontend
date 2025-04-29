import React, { useState, useEffect } from 'react';
import { format, subWeeks, subDays,parseISO, differenceInSeconds,addDays ,isBefore,startOfWeek} from 'date-fns';
import axios from 'axios';
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import * as XLSX from "xlsx";
import {round2Dec} from "../../utils/NumberHelper";
import {FaArrowDown, FaMoon} from "react-icons/fa";
const ReportDates = () => {
    const [reportType, setReportType] = useState("week");
    const [dateRanges, setDateRanges] = useState([]);
    const [customDates, setCustomDates] = useState({ start: "", end: "" });
    const [selectedDates, setSelectedDates] = useState({ start: "", end: "" });
    const [selectedRangeLabel, setSelectedRangeLabel] = useState("");

    // States for department and team member dropdowns
    const [departments, setDepartments] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [selectedTeamMember, setSelectedTeamMember] = useState("all");
    const [payrollData, setPayrollData] = useState([]);
    const [isWebServiceCalling, setIsWebServiceCalling] = useState(false);

    const [filteredData, setFilteredData] = useState([]);
    const [dataForReport, setDataForReport] = useState([]);
    // Fetch payroll report
    const fetchPayrollReport = async (start, end) => {
        setSelectedDepartment("all")
        setSelectedTeamMember("all")
        try {
            setPayrollData([])
            setIsWebServiceCalling(true)
            const response = await axios.post(process.env.REACT_APP_BIRCH_API_URL + 'get_payroll_report/', {
                startDate: start+ " 00:00:00",
                endDate: end+ " 00:00:00"
            });
            setIsWebServiceCalling(false)
            return response.data.data;
        } catch (error) {
            console.error('Error fetching payroll report:', error.response ? error.response.data : error.message);
            setIsWebServiceCalling(false)
            return [];
        }
    };

    // Effect to fetch payroll data based on selected dates
    useEffect(() => {
        const fetchData = async () => {
            if (selectedDates.start && selectedDates.end) {
                const result = await fetchPayrollReport(selectedDates.start, selectedDates.end);
                setPayrollData(result);

                // Get unique departments
                const uniqueDepartments = [...new Set(result.map(item => item.department_name))];
                setDepartments(uniqueDepartments);
            }
        };
        fetchData();
    }, [selectedDates]);

    // Effect to generate date ranges based on report type
    useEffect(() => {
        const generateDateRanges = () => {
            let ranges = [];
            let today = new Date();
            let currentDate = new Date(); // Dynamically use the current date

            const firstSunday = new Date(2025, 0, 12)
            // Find the next Sunday after the current date
            let startDate = currentDate;

// If the current date is before the first Sunday, set startDate to the first Sunday
            if (startDate < firstSunday) {
                startDate = firstSunday;
            } else {
                // Calculate the difference in milliseconds between the current date and the first Sunday
                const timeDifference = startDate - firstSunday;
                // Convert the difference to weeks
                const weeksDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 7));
                // Calculate the number of 2-week intervals passed
                const twoWeekIntervals = Math.floor(weeksDifference / 2);
                // Move to the next Sunday after the last 2-week interval
                startDate = addDays(firstSunday, (twoWeekIntervals + 1) * 14);
            }

            if (reportType === "week") {
                for (let i = 0; i < 50; i++) {
                    // Start date is 14 days after the previous start date
                    let start = subDays(startDate, i * 7);

                    // End date is 13 days after the start date (total of 14 days)
                    let end = subDays(start, -6);

                    if(isBefore(start,new Date()) ){
                        // Push the range to the ranges array
                        ranges.push({
                            label: `${format(start, "MM/dd")} - ${format(end, "MM/dd")}, ${format(end, "yyyy")}`,
                            value: `${format(start, "yyyy-MM-dd")}:${format(end, "yyyy-MM-dd")}`,
                            start,
                            end
                        });
                    }


                }
            } else if (reportType === "payPeriod") {
                for (let i = 0; i < 50; i++) {
                    // Start date is 14 days after the previous start date
                    let start = subDays(startDate, i * 14);

                    // End date is 13 days after the start date (total of 14 days)
                    let end = subDays(start, -13);

                    if(isBefore(start,new Date()) ){
                        // Push the range to the ranges array
                        ranges.push({
                            label: `${format(start, "MM/dd")} - ${format(end, "MM/dd")}, ${format(end, "yyyy")}`,
                            value: `${format(start, "yyyy-MM-dd")}:${format(end, "yyyy-MM-dd")}`,
                            start,
                            end
                        });
                    }
                }

            }
            console.log(ranges)
            setDateRanges(ranges);
            setSelectedRangeLabel("");
            //setSelectedDates({ start: "", end: "" });
        };
        generateDateRanges();
    }, [reportType]);

    // Handle custom date range changes
    const handleCustomDateChange = (e) => {
        setFilteredData([])
        const { name, value } = e.target;
        setCustomDates((prev) => {
            let updated = { ...prev, [name]: value };
            if (name === "start" && new Date(updated.start) > new Date(updated.end)) {
                updated.end = updated.start;
            }
            setSelectedDates({ start: updated.start, end: updated.end });
            return updated;
        });
    };

    // Handle selecting a date range
    const handleDateSelection = (e) => {
        const selectedRange = dateRanges.find(range => range.label === e.target.value);
        setFilteredData([])
        if (selectedRange) {
            setSelectedRangeLabel(selectedRange.label);
            setSelectedDates({ start: format(selectedRange.start, "yyyy-MM-dd"), end: format(selectedRange.end, "yyyy-MM-dd") });
        }
    };

    const handleReportTypeChanged = (e)=>{
        setFilteredData([])
        setReportType(e.target.value)
    }

    // Handle submit button click to filter data
    const handleSubmit = () => {
        const filter = payrollData.filter(item => {
            const departmentMatch = selectedDepartment === "all" || item.department_name === selectedDepartment;
            const teamMemberMatch = selectedTeamMember === "all" || item.team_member === selectedTeamMember;

            // Only filter by team member if selectedTeamMember is not "all"
            if (selectedTeamMember === "all") {
                return departmentMatch; // Don't filter by team member if "all" is selected
            }
            return departmentMatch && teamMemberMatch;
        });
        console.log(filter)
        setDataForReport(filter)
        setFilteredData(processLogs(filter));
        console.log("Filtered Data:", filter);
    };

    // Get unique team members for the selected department
    const getTeamMembersForDepartment = () => {
        if (selectedDepartment === "all") {
            return [...new Set(payrollData.map(item => item.team_member))]; // Return all unique team members
        }

        // Filter by department and get unique team members for that department
        const filteredData = payrollData.filter(item => item.department_name === selectedDepartment);
        return [...new Set(filteredData.map(item => item.team_member))]; // Ensure unique team members in the selected department
    };
    //using bedore
    // const processLogs = (logs) => {
    //     const grouped = {};
    //
    //     logs.forEach(log => {
    //         const {
    //             team_member,
    //             start_time,
    //             end_time,
    //             railcar_id,
    //             department_name,
    //             logged_time_in_seconds
    //         } = log;
    //         const start = parseISO(start_time);
    //         const duration = logged_time_in_seconds / 3600;
    //         const key = `${team_member}:${department_name}`;
    //
    //         // 1) Ensure the team/department aggregate exists
    //         if (!grouped[key]) {
    //             grouped[key] = { totalHours: 0, breakHours: 0, weeks: {} };
    //         }
    //
    //         // 2) Compute which week this log belongs to
    //         const weekStart = start.setDate(start.getDate() - start.getDay());
    //         const weekKey = format(weekStart, "yyyy-MM-dd");
    //
    //         // 3) Ensure the week bucket exists, initializing breakHours there too
    //         if (!grouped[key].weeks[weekKey]) {
    //             grouped[key].weeks[weekKey] = {
    //                 logs: [],
    //                 totalWeekHours: 0,
    //                 breakHours: 0    // ← initialize here
    //             };
    //         }
    //
    //         const weekBucket = grouped[key].weeks[weekKey];
    //
    //         // 4) Add to break or working totals, both at overall and per-week level
    //         if (railcar_id === "BREAK") {
    //             grouped[key].breakHours += duration;
    //             weekBucket.breakHours += duration;      // ← increment per-week
    //         } else {
    //             grouped[key].totalHours += duration;
    //         }
    //
    //         // 5) Record the log in that week
    //         weekBucket.logs.push({ ...log, duration });
    //         weekBucket.totalWeekHours += duration;
    //     });
    //
    //     // 6) Finalize each week’s labels and compute OT/standard
    //     Object.values(grouped).forEach(team => {
    //         const weekKeys = Object.keys(team.weeks).sort();
    //         weekKeys.forEach((weekKey, idx) => {
    //             const week = team.weeks[weekKey];
    //             week.weekLabel = `Week ${idx + 1}`;
    //             week.standardHours = Math.min(40, week.totalWeekHours);
    //             week.overtimeHours  = Math.max(0, (week.totalWeekHours - 40 -week.breakHours));
    //             // week.breakHours is already set above
    //         });
    //     });
    //
    //     return grouped;
    // };

    // this is working
    // const processLogs = (logs) => {
    //     const grouped = {};
    //
    //     logs.forEach(log => {
    //         const {
    //             team_member,
    //             start_time,
    //             end_time,
    //             railcar_id,
    //             department_name,
    //             logged_time_in_seconds
    //         } = log;
    //         const start = parseISO(start_time);
    //         const duration = logged_time_in_seconds / 3600;
    //         const key = `${team_member}:${department_name}`;
    //
    //         // 1) Ensure the team/department aggregate exists
    //         if (!grouped[key]) {
    //             grouped[key] = { totalHours: 0, breakHours: 0, weeks: {} };
    //         }
    //
    //         // 2) Compute which week this log belongs to
    //         const weekStart = start.setDate(start.getDate() - start.getDay());
    //         const weekKey = format(weekStart, "yyyy-MM-dd");
    //
    //         // 3) Ensure the week bucket exists, initializing breakHours there too
    //         if (!grouped[key].weeks[weekKey]) {
    //             grouped[key].weeks[weekKey] = {
    //                 logs: [],
    //                 totalWeekHours: 0,
    //                 breakHours: 0
    //             };
    //         }
    //
    //         const weekBucket = grouped[key].weeks[weekKey];
    //
    //         // 4) Add to break or working totals
    //         if (railcar_id === "BREAK") {
    //             grouped[key].breakHours += duration;
    //             weekBucket.breakHours += duration;
    //         } else {
    //             grouped[key].totalHours += duration;
    //         }
    //
    //         // 5) Record the log in that week
    //         weekBucket.logs.push({ ...log, duration });
    //         weekBucket.totalWeekHours += duration;
    //     });
    //
    //     // 6) Finalize each week’s labels and compute OT/standard
    //     Object.values(grouped).forEach(team => {
    //         const weekKeys = Object.keys(team.weeks).sort();
    //         weekKeys.forEach((weekKey, idx) => {
    //             const week = team.weeks[weekKey];
    //             week.weekLabel = `Week ${idx + 1}`;
    //             const workingHours = week.totalWeekHours - week.breakHours;
    //             week.standardHours = Math.min(40, workingHours);
    //             week.overtimeHours = Math.max(0, workingHours - 40);
    //         });
    //     });
    //
    //     return grouped;
    // };

    const processLogs = (logs) => {
        const grouped = {};
        const memberDailyMap = {}; // Track daily status per team_member across all departments

        logs.forEach(log => {
            const {
                team_member,
                start_time,
                end_time,
                railcar_id,
                department_name,
                logged_time_in_seconds
            } = log;
            const start = parseISO(start_time);
            const duration = logged_time_in_seconds / 3600;
            const key = `${team_member}:${department_name}`;

            // Track daily break/work info per team_member
            const dateKey = format(start, "yyyy-MM-dd");
            if (!memberDailyMap[team_member]) memberDailyMap[team_member] = {};
            if (!memberDailyMap[team_member][dateKey]) {
                memberDailyMap[team_member][dateKey] = { hasWorked: false, hasBreak: false };
            }
            if (railcar_id === "BREAK") {
                memberDailyMap[team_member][dateKey].hasBreak = true;
            } else {
                memberDailyMap[team_member][dateKey].hasWorked = true;
            }

            // Grouping by team + department
            if (!grouped[key]) {
                grouped[key] = { totalHours: 0, breakHours: 0, weeks: {} };
            }

            const weekStart = start.setDate(start.getDate() - start.getDay());
            const weekKey = format(weekStart, "yyyy-MM-dd");

            if (!grouped[key].weeks[weekKey]) {
                grouped[key].weeks[weekKey] = {
                    logs: [],
                    totalWeekHours: 0,
                    breakHours: 0,
                };
            }

            const weekBucket = grouped[key].weeks[weekKey];

            if (railcar_id === "BREAK") {
                grouped[key].breakHours += duration;
                weekBucket.breakHours += duration;
            } else {
                grouped[key].totalHours += duration;
            }

            weekBucket.logs.push({ ...log, duration });
            weekBucket.totalWeekHours += duration;
        });

        // Final processing
        Object.entries(grouped).forEach(([key, team]) => {
            const [team_member] = key.split(":");
            const weekKeys = Object.keys(team.weeks).sort();

            weekKeys.forEach((weekKey, idx) => {
                const week = team.weeks[weekKey];
                week.weekLabel = `Week ${idx + 1}`;

                const workingHours = week.totalWeekHours - week.breakHours;
                week.standardHours = Math.min(40, workingHours);
                week.overtimeHours = Math.max(0, workingHours - 40);

                // Compute daysWithoutBreak from memberDailyMap
                const daysWithoutBreak = Object.entries(memberDailyMap[team_member])
                    .filter(([date, status]) => {
                        const dateObj = parseISO(date);
                        const weekStartDate = parseISO(weekKey);
                        const sameWeek = dateObj >= weekStartDate && dateObj < addDays(weekStartDate, 7);
                        return sameWeek && status.hasWorked && !status.hasBreak;
                    }).length;

                week.daysWithoutBreak = daysWithoutBreak;
            });
        });

        return grouped;
    };



    const exportToExcel = (data, department) => {
        let allLogs = [];
        let teammemebr_name
        // Iterate over each week in the data
        for (const weekKey in data.weeks) {
            if (data.weeks.hasOwnProperty(weekKey)) {
                // Extract the logs array for the current week
                const logs = data.weeks[weekKey].logs;

                // Transform each log entry
                const transformedLogs = logs.map(log => {
                    // Convert start_time to local date and time
                    const startTime = new Date(log.start_time);
                    const localStartTime = startTime.toLocaleString();

                    // Get the day of the week (e.g., Monday)
                    const day = startTime.toLocaleDateString('en-US', { weekday: 'long' });

                    // Convert end_time to local date and time (if not null)
                    const endTime = log.end_time ? new Date(log.end_time).toLocaleString() : "";

                    // Handle null values for jobcode and logged_out_station_name
                    const jobcode = log.jobcode || "";
                    const loggedOutStationName = log.logged_out_station_name || "";

                    // Map is_approved to "Approved" or "Unapproved"
                    const approvalStatus = log.is_approved === 1 ? "Approved" : "Unapproved";
                    teammemebr_name = log.team_member
                    // Return the transformed log object
                    return {
                        team_member: log.team_member,
                        department: department.toUpperCase(),
                        railcar_id: log.railcar_id,
                        job_description: log.job_description,
                        start_time: localStartTime,
                        Day: day,
                        end_time: endTime,
                        hours:  Number(round2Dec(log.duration)),
                        jobcode: jobcode,
                        logged_in_station_name: log.logged_in_station_name,
                        logged_out_station_name: loggedOutStationName,
                        is_approved: approvalStatus
                    };
                });

                // Add the transformed logs to the combined array
                allLogs = allLogs.concat(transformedLogs);
            }
        }

        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Convert the transformed logs array to a worksheet
        const worksheet = XLSX.utils.json_to_sheet(allLogs);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transformed Logs");

        // Write the workbook to a file and trigger a download
        XLSX.writeFile(workbook, teammemebr_name+"_"+selectedDates.start+"_"+ selectedDates.end+".xlsx");
    };

    function generateWeeklyReport(logs) {
        const grouped = {};
        // Step 1: Group logs by team member and week start
        logs.forEach(log => {
            console.log(log)
            const teamMember = log.team_member;
            const date = format(parseISO(log.start_time), 'yyyy-MM-dd');
            const weekStart = format(startOfWeek(parseISO(log.start_time), { weekStartsOn: 1 }), 'yyyy-MM-dd');
            let hours =   log.railcar_id==="BREAK"?0.0: log.logged_time_in_seconds ;
            hours = hours/3600;

            if (!grouped[teamMember]) grouped[teamMember] = {};
            if (!grouped[teamMember][weekStart]) grouped[teamMember][weekStart] = { daily: {}, totalHours: 0 };

            if (!grouped[teamMember][weekStart].daily[date]) {
                grouped[teamMember][weekStart].daily[date] = { regular: 0, overtime: 0, total: 0 };
            }

            grouped[teamMember][weekStart].daily[date].total += hours;
            grouped[teamMember][weekStart].totalHours += hours;
        });

        console.log(grouped)
        const report = [];

        // Step 2: Process each team member
        Object.entries(grouped).forEach(([teamMember, weeks]) => {
            let employeeRegularTotal = 0;
            let employeeOvertimeTotal = 0;
            let employeeTotalHours = 0;

            Object.entries(weeks).forEach(([weekStart, data]) => {
                let weeklyRegularAccum = 0;

                const sortedDays = Object.entries(data.daily).sort(
                    ([dateA], [dateB]) => new Date(dateA) - new Date(dateB)
                );

                sortedDays.forEach(([date, hoursData]) => {
                    const { total } = hoursData;

                    let regular = 0;
                    let overtime = 0;

                    if (weeklyRegularAccum < 40) {
                        if (weeklyRegularAccum + total <= 40) {
                            regular = total;
                        } else {
                            regular = 40 - weeklyRegularAccum;
                            overtime = total - regular;
                        }
                    } else {
                        overtime = total;
                    }

                    weeklyRegularAccum += regular;

                    employeeRegularTotal += regular;
                    employeeOvertimeTotal += overtime;
                    employeeTotalHours += total;

                    report.push({
                        Name: teamMember,
                        WeekStart: weekStart,
                        Date: date,
                        RegularHours: Number(regular.toFixed(2)),
                        OvertimeHours: Number(overtime.toFixed(2)),
                        TotalHours: Number(total.toFixed(2)),
                    });
                });
            });

            // Step 3: Add totals for the employee
            report.push({
                Name: `${teamMember} - Totals`,
                WeekStart: '',
                Date: '',
                RegularHours: Number(employeeRegularTotal.toFixed(2)),
                OvertimeHours: Number(employeeOvertimeTotal.toFixed(2)),
                TotalHours: Number(employeeTotalHours.toFixed(2)),
            });

            // Step 4: Add an empty row for spacing
            report.push({
                Name: '',
                WeekStart: '',
                Date: '',
                RegularHours: '',
                OvertimeHours: '',
                TotalHours: '',
            });
        });

        exportToExcel2(report);
    }
    function generateTypeHoursReport(logs, startDate, endDate) {
        const grouped = {};

        // Step 1: Group logs by team member
        logs.forEach(log => {
            const teamMember = log.team_member;
            const department = log.department_name;
            const weekStart = format(startOfWeek(parseISO(log.start_time), { weekStartsOn: 1 }), 'yyyy-MM-dd');
            const hours = log.railcar_id==="BREAK"?0:log.logged_time_in_seconds / 3600;

            if (!grouped[teamMember]) {
                grouped[teamMember] = {
                    department: department,
                    weeks: {}
                };
            }

            if (!grouped[teamMember].weeks[weekStart]) {
                grouped[teamMember].weeks[weekStart] = {
                    regularHours: 0,
                    overtimeHours: 0,
                    totalHoursInWeek: 0
                };
            }

            grouped[teamMember].weeks[weekStart].totalHoursInWeek += hours;
        });

        const reportRows = [];

        // Step 2: Process each employee
        Object.entries(grouped).forEach(([teamMember, data]) => {
            let employeeRegularTotal = 0;
            let employeeOvertimeTotal = 0;

            Object.entries(data.weeks).forEach(([weekStart, weekData]) => {
                const { totalHoursInWeek } = weekData;

                let regular = Math.min(totalHoursInWeek, 40);
                let overtime = totalHoursInWeek > 40 ? totalHoursInWeek - 40 : 0;

                employeeRegularTotal += regular;
                employeeOvertimeTotal += overtime;
            });

            reportRows.push({
                Name: teamMember,
                "Standard Hours": Number(employeeRegularTotal.toFixed(2)),
                "Overtime Hours": Number(employeeOvertimeTotal.toFixed(2)),
                Department: data.department,
                "Start Date": startDate,
                "End Date": endDate
            });
        });

        exportToExcel3(reportRows, startDate, endDate);
    }

    //working for first day is afternoon
    // function isFirstLogAfterNoon(data) {
    //     const weeks = data.weeks || {};
    //
    //     return Object.values(weeks).some(week => {
    //         if (!Array.isArray(week.logs) || week.logs.length === 0) {
    //             return false;
    //         }
    //         const utcStart = new Date(week.logs[0].start_time);
    //         const localHour = utcStart.getHours(); // local timezone
    //         return localHour >= 12;
    //     });
    // }


    function isFirstLogAfterNoon(data) {
        const weeks = data.weeks || {};

        return Object.values(weeks).some(week => {
            if (!Array.isArray(week.logs) || week.logs.length === 0) {
                return false;
            }

            // Group logs by date
            const logsByDate = {};

            week.logs.forEach(log => {
                const logDate = new Date(log.start_time);
                const dateKey = logDate.toISOString().split('T')[0]; // YYYY-MM-DD

                if (!logsByDate[dateKey]) {
                    logsByDate[dateKey] = [];
                }

                logsByDate[dateKey].push(log);
            });

            // Check first log of each day
            return Object.values(logsByDate).some(logs => {
                const sortedLogs = logs.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
                const firstLogDate = new Date(sortedLogs[0].start_time);
                const localHour = firstLogDate.getHours(); // Local time
                return localHour >= 12;
            });
        });
    }


    function isAfterNoon(start_time){
        const utcStart = new Date(start_time);
        const localHour = utcStart.getHours(); // local timezone
        return localHour >= 12;
    }

    function exportToExcel3(reportRows, startDate, endDate) {
        const workbook = XLSX.utils.book_new();

        const worksheet = XLSX.utils.json_to_sheet([], { skipHeader: true });

        // 1. Add the summary line in cell A1
        XLSX.utils.sheet_add_aoa(
            worksheet,
            [[`Summary Report through ${startDate} and ${endDate}`]],
            { origin: 'A1' }
        );

        // Optional: leave row 2 blank
        // XLSX.utils.sheet_add_aoa(worksheet, [[]], { origin: 'A2' });

        // 2. Add the headers and data starting at row 3 (row index 2 in zero-based)
        XLSX.utils.sheet_add_json(
            worksheet,
            reportRows,
            { origin: 'A3', skipHeader: false }
        );

        // 3. Append the sheet and write the file
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll Report');
        XLSX.writeFile(workbook, 'Payroll Report from '+startDate+' to '+endDate+'.xlsx');
    }


    function exportToExcel2(data) {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, ws, 'Weekly Report');

        XLSX.writeFile(wb, 'weekly_report.xlsx');
    }


    return (
        <div>
            <div className="p-4 w-full max-w-xl flex flex-col gap-4">
                {/* Report Type and Date Range Section */}
                <div className="flex w-full justify-between gap-4">
                    <div className="flex flex-col w-1/2">
                        <label className="text-lg font-semibold mb-2">Report Types:</label>
                        <select
                            className="border rounded-md p-2"
                            value={reportType}
                            onChange={(e) => handleReportTypeChanged(e)}
                        >
                            <option value="week">By Week</option>
                            <option value="payPeriod">By Pay Period</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                    <div className="flex flex-col w-1/2">
                        {reportType !== "custom" && (
                            <>
                                <label className="text-lg font-semibold mb-2">Select Range:</label>
                                <select
                                    className="border rounded-md p-2"
                                    value={selectedRangeLabel}
                                    onChange={handleDateSelection}
                                >
                                    <option value="">Select a range</option>
                                    {dateRanges.map((range, index) => (
                                        <option key={index} value={range.label}>{range.label}</option>
                                    ))}
                                </select>
                            </>
                        )}
                    </div>
                </div>


                {reportType === "custom" && (
                    <div className="flex items-center gap-4">
                        <label>Start Date:</label>
                        <input
                            type="date"
                            name="start"
                            value={customDates.start}
                            max={new Date().toISOString().split("T")[0]}
                            onChange={handleCustomDateChange}
                            className="border rounded-md p-2"
                        />
                        <label>End Date:</label>
                        <input
                            type="date"
                            name="end"
                            value={customDates.end}
                            min={customDates.start}
                            max={new Date().toISOString().split("T")[0]}
                            onChange={handleCustomDateChange}
                            className="border rounded-md p-2"
                        />
                    </div>
                )}

                {/* Department Dropdown */}
                <div className="mt-4">
                    <label className="block text-lg">Select Department:</label>
                    <select
                        className="border rounded-md p-2 w-full"
                        value={selectedDepartment}
                        disabled={isWebServiceCalling}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                    >
                        <option value="all">All Departments</option>
                        {departments.map((department, index) => (
                            <option key={index} value={department}>{department}</option>
                        ))}
                    </select>
                </div>

                {/* Team Member Dropdown */}
                <div className="mt-4">
                    <label className="block text-lg">Select Team Member:</label>
                    <select
                        className="border rounded-md p-2 w-full"
                        value={selectedTeamMember}
                        disabled={isWebServiceCalling}
                        onChange={(e) => setSelectedTeamMember(e.target.value)}
                    >
                        <option value="all">All Team Members</option>
                        {getTeamMembersForDepartment().map((teamMember, index) => (
                            <option key={index} value={teamMember}>{teamMember}</option>
                        ))}
                    </select>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    className="bg-blue-500 text-white rounded-md p-2 mt-4"
                >
                    Submit
                </button>
            </div>
            {Object.entries(filteredData).length>0?(
                    <div>
                        <button className="bg-blue-500 text-white rounded-md p-2 mt-4 mb-4 mr-2" onClick={()=>generateWeeklyReport(dataForReport)}>Payroll By Day</button>
                        <button className="bg-blue-500 text-white rounded-md p-2 mt-4 mb-4" onClick={()=>generateTypeHoursReport(dataForReport,selectedDates.start,selectedDates.end)}>Payroll Totals</button>

                    </div>

            ):""}


            {Object.entries(filteredData).map(([name, data]) => {

                return (
                    <div key={name} className="collapse border collapse-plus mb-2 bg-white">
                        <input type="checkbox" className="peer" />
                        <div className="collapse-title flex justify-between">
                        <span className="pt-4">
                            <span className="font-semibold text-lg mr-2">{name.split(":")[0]}</span>
                            <span className="text-xs">{name.split(":")[1].toString().toLowerCase()}</span>


                        </span>
                            <div className="p-2 rounded-lg text-gray-700 flex gap-2 pt-4">

                                <div className="tooltip z-[100]" data-tip="Night shift">
                                      <span>
                                        {isFirstLogAfterNoon(data) && (
                                            <FaMoon style={{ color: 'black', marginRight: '20px' , marginTop:'8px'}}/>
                                        )}
                                      </span>
                                </div>

                                <div className="tooltip z-[100] border p-1 bg-green-500" data-tip="Regular Hours">
                                    <span>{Object.values(data.weeks).reduce((sum, w) => sum + w.standardHours, 0).toFixed(2)}h</span>
                                </div>
                                <div className="tooltip z-[100] border p-1 bg-red-300" data-tip="Overtime Hours">
                                      <span>
                                        {Math.max(
                                            0,
                                            Object.values(data.weeks).reduce((sum, w) => sum + (w.overtimeHours), 0)
                                        ).toFixed(2)}h
                                      </span>
                                </div>

                                <div className="tooltip z-[100] border p-1 bg-gray-200" data-tip="Total Payable Hours">
                                    <span>{Object.values(data.weeks).reduce((sum, w) => sum + (w.standardHours+w.overtimeHours), 0).toFixed(2)}h</span>
                                </div>
                                <div className="tooltip z-[100] border p-1 bg-white" data-tip="Break Hours">
                                    <span>{data.breakHours.toFixed(2)}h</span>
                                </div>

                                <div className="tooltip z-[200] border p-1 bg-yellow-50" data-tip="without break">
                                    <span>{Object.values(data.weeks).reduce((sum, w) => sum + w.daysWithoutBreak, 0)}D</span>
                                </div>
                            </div>

                        </div>
                        <div className="collapse-content">
                            <span className="float-right">
                                   <button
                                       onClick={() => exportToExcel(data, name.split(":")[1].toString().toLowerCase())}
                                       className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-2 py-2 rounded"
                                   >
                                    Download XLS
                                </button>
                            </span>

                            {Object.entries(data.weeks).map(([week, { logs, standardHours, overtimeHours, breakHours, weekLabel }]) => {
                                // 1) Build a map: dateStr → hasBreak?
                                const breakPresence = {};
                                let numberOfDays
                                logs.forEach(log => {
                                    const dateStr = format(parseISO(log.start_time), "yyyy-MM-dd");
                                    if (!breakPresence[dateStr]) {
                                        breakPresence[dateStr] = false;
                                    }
                                    if (log.railcar_id === "BREAK") breakPresence[dateStr] = true;
                                });

                                // 2) Now render
                                const dayTotalsMap = {};
                                return (
                                    <div key={week}>
                                        <h3 className="font-bold mb-5">{weekLabel} - Week of {week}</h3>
                                        <table className="table-auto w-full border border-gray-300 shadow-md rounded-lg overflow-hidden mb-5">
                                            <thead className="bg-gray-100 text-gray-700">
                                            <tr>
                                                <th className="p-2 border">Date</th>
                                                <th className="p-2 border">Day</th>
                                                <th className="p-2 border">In</th>
                                                <th className="p-2 border">Out</th>
                                                <th className="p-2 border">Hours</th>
                                                <th className="p-2 border">Day Total</th>
                                                <th className="p-2 border">Customer</th>
                                                <th className="p-2 border">Job</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {logs.map((log, i) => {
                                                const dateStr = format(parseISO(log.start_time), "yyyy-MM-dd");

                                                // Initialize daily tracking if not done
                                                if (!dayTotalsMap[dateStr]) dayTotalsMap[dateStr] = 0;
                                                if (log.railcar_id !== "BREAK") dayTotalsMap[dateStr] += log.duration;

                                                // Determine if this is the first log of the day
                                                const prevLog = logs[i - 1];
                                                const prevDateStr = prevLog
                                                    ? format(parseISO(prevLog.start_time), "yyyy-MM-dd")
                                                    : null;
                                                const isFirstLogOfDay = dateStr !== prevDateStr;

                                                // Determine if this is the last log of the day
                                                const nextLog = logs[i + 1];
                                                const nextDateStr = nextLog
                                                    ? format(parseISO(nextLog.start_time), "yyyy-MM-dd")
                                                    : null;
                                                const isEndOfDay = dateStr !== nextDateStr;

                                                const noBreaksToday = !breakPresence[dateStr];
                                                const rowBgClass = noBreaksToday ? "bg-yellow-50" : "";

                                                return (
                                                    <React.Fragment key={i}>
                                                        <tr className={`${rowBgClass} border`}>
                                                            <td className="p-2 flex items-center">
                                                                {dateStr}
                                                                {isFirstLogOfDay && isAfterNoon(log.start_time) && (
                                                                    <FaMoon style={{ color: 'black', marginLeft: '5px' }} />
                                                                )}
                                                            </td>
                                                            <td className="p-2">{format(parseISO(log.start_time), "EEEE")}</td>
                                                            <td className="p-2">{format(parseISO(log.start_time), "hh:mm a")}</td>
                                                            <td className="p-2">{log.end_time ? format(parseISO(log.end_time), "hh:mm a") : ""}</td>
                                                            <td className="p-2">{log.duration.toFixed(2)}</td>
                                                            <td className="p-2">{dayTotalsMap[dateStr].toFixed(2)}</td>
                                                            <td className="p-2">
                                                                <span className={`${log.railcar_id === "BREAK" ? "border border-yellow-500 p-1" : ""}`}>
                                                                    {log.railcar_id}
                                                                </span>
                                                            </td>
                                                            <td className="p-2">{log.job_description}</td>
                                                        </tr>

                                                        {isEndOfDay && (
                                                            <tr className="bg-gray-200">
                                                                <td colSpan="8" className="h-2 p-0"></td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}

                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-gray-50">
                                                    <td colSpan="4" className="p-2 border text-right font-semibold">Totals:</td>
                                                    <td className="p-2 border text-sm font-semibold">{(standardHours + (overtimeHours+breakHours)).toFixed(2)}h</td>
                                                    <td className="p-1 border text-sm font-semibold">Standard: {standardHours.toFixed(2)}h</td>
                                                    <td className="p-1 border text-sm font-semibold">Overtime: {overtimeHours.toFixed(2)}h</td>
                                                    <td className="p-2 border text-sm font-semibold">Break: {breakHours ? breakHours.toFixed(2) : "0.0"}h</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                );
                            })}


                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ReportDates;
