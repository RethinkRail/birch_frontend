import React, { useEffect, useState } from "react";
import { MaterialReactTable } from "material-react-table";

const DepartmentAccumulationReport = () => {
    const [data, setData] = useState([]);
    const [divider, setDivider] = useState(8); // input for estimated days

    const round2Dec = (num) => {
        if (num == null || isNaN(num)) return 0;
        return Math.round(Number(num) * 100) / 100;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(
                    process.env.REACT_APP_BIRCH_API_URL +
                    "get_department_accumalation_report"
                );
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error("Fetch failed", err);
            }
        };

        fetchData();
    }, []);

    const columns = [
        { accessorKey: "department_name", header: "Department" },
        { accessorKey: "crew_count", header: "Team Members" },
        {
            accessorKey: "total_estimated_hour",
            header: "Estimated (hr)",
            Cell: ({ row }) => round2Dec(row.original.total_estimated_hour),
        },
        {
            accessorKey: "total_logged_hour",
            header: "Logged (hr)",
            Cell: ({ row }) => round2Dec(row.original.total_logged_hour),
        },
        {
            header: "Time Remaining (hr)",
            Cell: ({ row }) =>
                round2Dec(
                    row.original.total_estimated_hour - row.original.total_logged_hour
                ),
        },
        {
            header: "Estimated Days",
            Cell: ({ row }) => {
                const remaining =
                    row.original.total_estimated_hour - row.original.total_logged_hour;
                const number_of_crews = row.original.crew_count;
                return divider > 0
                    ? round2Dec(remaining / (number_of_crews*divider))
                    : round2Dec(remaining);
            },
        },
    ];

    return (
        <div>
            <h1 className="font-bold mt-10 mb-10">
                Department Time Remaining Report
            </h1>
            <div className="flex items-center space-x-6 p-2 bg-white rounded-lg shadow-md ">
                <div className="p-4 w-[99%]">
                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-1">
                            Hours per Day
                        </label>
                        <input
                            type="number"
                            className="border p-2 rounded-md w-40"
                            value={divider}
                            min={1}
                            onChange={(e) => setDivider(Number(e.target.value))}
                        />
                    </div>

                    <MaterialReactTable columns={columns} data={data} />
                </div>
            </div>
        </div>
    );
};

export default DepartmentAccumulationReport;
