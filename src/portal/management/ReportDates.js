import React, { useState, useEffect } from 'react';
import { format, subWeeks, subDays,parseISO, differenceInSeconds,addDays } from 'date-fns';
import axios from 'axios';

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


            // Find the next Sunday after the current date
            let startDate = currentDate;
            if (startDate.getDay() !== 0) { // If it's not already a Sunday
                startDate = addDays(startDate, 7 - startDate.getDay()); // Move to the next Sunday
            }

            if (reportType === "week") {
                for (let i = 0; i < 50; i++) {
                    startDate = subWeeks(today, i);
                    startDate.setDate(startDate.getDate() - startDate.getDay());
                    let end = subDays(startDate, -6);
                    ranges.push({ label: `${format(startDate, "M/d/yyyy")} - ${format(end, "M/d/yyyy")}`, startDate, end });
                }
            } else if (reportType === "payPeriod") {
                for (let i = 0; i < 50; i++) {
                    // Start date is 14 days after the previous start date
                    let start = subDays(startDate, i * 14);

                    // End date is 13 days after the start date (total of 14 days)
                    let end = subDays(start, -13);

                    // Push the range to the ranges array
                    ranges.push({
                        label: `${format(start, "MM/dd")} - ${format(end, "MM/dd")}, ${format(end, "yyyy")}`,
                        value: `${format(start, "yyyy-MM-dd")}:${format(end, "yyyy-MM-dd")}`,
                        start,
                        end
                    });
                }

            }
            setDateRanges(ranges);
            setSelectedRangeLabel("");
            setSelectedDates({ start: "", end: "" });
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

    const processLogs = (logs) => {
        const grouped = {};
        logs.forEach(log => {
            const { team_member, start_time, end_time, railcar_id,department_name,logged_time_in_seconds } = log;
            const start = parseISO(start_time);
            const end = parseISO(end_time);
            const duration = logged_time_in_seconds/ 3600;
            if (!grouped[team_member+":"+department_name]) {
                grouped[team_member+":"+department_name] = { totalHours: 0, breakHours: 0, weeks: {} };
            }
            if (railcar_id === "BREAK") {
                grouped[team_member+":"+department_name].breakHours += duration;
            } else {
                grouped[team_member+":"+department_name].totalHours += duration;
            }
            const weekStart = start.setDate(start.getDate() - start.getDay());
            const weekKey = format(weekStart, "yyyy-MM-dd");
            if (!grouped[team_member+":"+department_name].weeks[weekKey]) {
                grouped[team_member+":"+department_name].weeks[weekKey] = { logs: [], totalWeekHours: 0 };
            }
            grouped[team_member+":"+department_name].weeks[weekKey].logs.push({ ...log, duration });
            grouped[team_member+":"+department_name].weeks[weekKey].totalWeekHours += duration;
        });

        Object.values(grouped).forEach(team => {
            Object.values(team.weeks).forEach(week => {
                week.standardHours = Math.min(40, week.totalWeekHours);
                week.overtimeHours = Math.max(0, week.totalWeekHours - 40);
            });
        });

        return grouped;
    };


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
            {Object.entries(filteredData).map(([name, data]) => (
                <div key={name} className="collapse border collapse-plus mb-2 bg-white">
                    <input type="checkbox" className="peer" />
                    <div className="collapse-title  flex justify-between">
                        <span>{name}</span>
                        <div className="p-2 rounded-lg text-gray-700 flex gap-2">
                            <div className="tooltip tooltip-right" data-tip="Total Hours"><span>{data.totalHours.toFixed(2)}h</span></div> |
                            <div className="tooltip tooltip-right" data-tip="Standard Hours"><span>{Object.values(data.weeks).reduce((sum, w) => sum + w.standardHours, 0).toFixed(2)}h</span></div> |
                            <div className="tooltip tooltip-right" data-tip="Overtime Hours"><span>{Object.values(data.weeks).reduce((sum, w) => sum + w.overtimeHours, 0).toFixed(2)}h</span></div> |
                            <div className="tooltip tooltip-right" data-tip="Break Hours"><span>{data.breakHours.toFixed(2)}h</span></div>
                        </div>
                    </div>
                    <div className="collapse-content ">
                        {Object.entries(data.weeks).map(([week, { logs }]) => (
                            <div key={week}>
                                <h3 className="font-bold">Week of {week}</h3>
                                <table className="table-auto w-full border border-gray-300 shadow-md rounded-lg overflow-hidden">
                                    <thead className="bg-gray-100 text-gray-700">
                                    <tr>
                                        <th className="p-2 border">Date</th>
                                        <th className="p-2 border">Day</th>
                                        <th className="p-2 border">In</th>
                                        <th className="p-2 border">Out</th>
                                        <th className="p-2 border">Hours</th>
                                        <th className="p-2 border">Customer</th>
                                        <th className="p-2 border">Job</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {logs.map((log, index) => (
                                        <tr key={index} className="border">
                                            <td className="p-2 border">{format(parseISO(log.start_time), "yyyy-MM-dd")}</td>
                                            <td className="p-2 border">{format(parseISO(log.start_time), "EEEE")}</td>
                                            <td className="p-2 border">{format(parseISO(log.start_time), "hh:mm a")}</td>
                                            <td className="p-2 border">{log.end_time?format(parseISO(log.end_time), "hh:mm a"):""}</td>
                                            <td className="p-2 border">{log.duration.toFixed(2)}</td>
                                            <td className="p-2 border">{log.railcar_id}</td>
                                            <td className="p-2 border">{log.job_description}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                </div>
            ))}



        </div>
    );
};

export default ReportDates;
