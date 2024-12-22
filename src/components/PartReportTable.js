/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 12/18/2024, Wednesday
 * Description:
 **/


import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import {round2Dec} from "../utils/NumberHelper";
import {FaArrowDown} from "react-icons/fa";

const PartReportTable = ({ data }) => {
    // const [data, setData] = useState([]);
    // const [loading, setLoading] = useState(false);
    // const [error, setError] = useState("");

    // useEffect(() => {
    //     console.log("use effect in part order table")
    //     if (workOrder) {
    //         fetchData(workOrder);
    //     }
    // }, [workOrder]);
    //
    // const fetchData = async (workOrder) => {
    //     setLoading(true);
    //     setError("");
    //     try {
    //         const response = await axios.get(
    //             process.env.REACT_APP_BIRCH_API_URL+`get_part_report_for_work_order/?work_order=${workOrder}`
    //         );
    //         console.log(response.data)
    //         setData(response.data);
    //     } catch (err) {
    //         console.error("Error fetching part report:", err);
    //         setError("Failed to fetch data. Please try again later.");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const columns = [
        {
            name: "Code",
            selector: (row) => row.code,
            sortable: true,
            width: '9%',
        },
        {
            name: "Line",
            selector: (row) => row.line_number,
            sortable: true,
            width: '7%',
        },
        {
            name: "Title",
            selector: (row) => row.title,
            sortable: true,
            width: '20%',
        },
        {
            name: " Cost",
            selector: (row) => row.purchase_cost,
            width: '8%',
            cell: (row) => {
                const purchaseCost = row.purchase_cost;
                const price = row.price_in_inventory;
                const is_price_higher = parseFloat(purchaseCost)<parseFloat(price)
                return (
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                    {round2Dec(purchaseCost)}
                        {is_price_higher && (
                            <FaArrowDown style={{ color: 'red', marginLeft: '5px' }} />
                        )}
                </span>
                );
            },
        },
        {
            name: "Inventory price",
            selector: (row) => row.price_in_inventory,
            sortable: true,
            cell: (row) => (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                    {round2Dec(row.price_in_inventory)}
                </span>
            ),
            width: '14%',
        },
        {
            name: "Quantity",
            selector: (row) => row.quantity,
            sortable: true,
            width: '10%',
        },
        {
            name: "Quantity Available",
            selector: (row) => row.quantity_available,
            sortable: true,

            cell: (row) => (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                    {row.quantity_available>0?round2Dec(row.quantity_available):0}
                </span>
            ),
            width: '14%',
        },
        {
            name: "Condition",
            selector: (row) => row.condition,
            sortable: true,
            width: '10%',
        },
        {
            name: "Availability",
            selector: (row) => row.availability,
            sortable: true,
            width: '10%',
        }

    ];

    return (
        <div>
            <div className="flex justify-between mb-5 items-center ">
                <h6 className='font-semibold'>Parts List</h6>
            </div>
            <DataTable
                columns={columns}
                data={data}
                highlightOnHover
                responsive
            />
        </div>


    );
};

export default PartReportTable;
