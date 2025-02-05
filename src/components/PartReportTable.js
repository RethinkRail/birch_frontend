/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 12/18/2024, Wednesday
 * Description:
 **/


import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import {round3Dec} from "../utils/NumberHelper";
import {FaArrowDown} from "react-icons/fa";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";

const PartReportTable = ({ initialData }) => {
    const [open, setOpen] = useState(false);
    const [popupData, setPopupData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchStockStatusReport = async (code) => {
        setLoading(true);
        setError("");
        try {
            const response = await axios.post(process.env.REACT_APP_BIRCH_API_URL+"get_stock_status_report_by_part_code/", { part_code: code });
            console.log(response.data)
            setPopupData(response.data);
            setOpen(true); // Open the modal after data is fetched
        } catch (err) {
            setError(err.response?.data || "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setPopupData([]);
    };

    const columns = [
        {
            name: "Code",
            selector: (row) => row.code,
            sortable: true,
            width: "9%",
        },
        {
            name: "Line",
            selector: (row) => row.line_number,
            sortable: true,
            width: "7%",
        },
        {
            name: "Title",
            selector: (row) => row.title,
            sortable: true,
            width: "20%",
        },
        {
            name: "Cost",
            selector: (row) => row.purchase_cost,
            width: "8%",
            cell: (row) => {
                const purchaseCost = row.purchase_cost;
                const price = row.price_in_inventory;
                const is_price_higher = parseFloat(purchaseCost) < parseFloat(price);
                return (
                    <span style={{ display: "flex", alignItems: "center" }}>
            {purchaseCost.toFixed(3)}
                        {is_price_higher &&  <FaArrowDown style={{ color: 'red', marginLeft: '5px' }} />}
          </span>
                );
            },
        },
        {
            name: "Inventory Price",
            selector: (row) => row.price_in_inventory,
            sortable: true,
            cell: (row) => <span>{row.price_in_inventory.toFixed(3)}</span>,
            width: "14%",
        },
        {
            name: "Quantity",
            selector: (row) => row.quantity,
            sortable: true,
            width: "10%",
        },
        {
            name: "Quantity Available",
            selector: (row) => row.quantity_available,
            sortable: true,
            cell: (row) => (
                <span
                    style={{ cursor: "pointer", color: "blue" }}
                    onClick={() => fetchStockStatusReport(row.code)}
                >
          {row.quantity_available > 0 ? row.quantity_available.toFixed(3) : 0}
        </span>
            ),
            width: "14%",
        },
        {
            name: "Condition",
            selector: (row) => row.condition,
            sortable: true,
            width: "10%",
        },
        {
            name: "Availability",
            selector: (row) => row.availability,
            sortable: true,
            width: "10%",
        },
    ];

    return (
        <div>
            <div className="flex justify-between mb-5 items-center">
                <h6 className="font-semibold">Parts List</h6>
            </div>
            <DataTable columns={columns} data={initialData} highlightOnHover responsive />

            {open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-2/3 max-h-[80vh] overflow-y-auto">
                        <h2 className="text-lg font-semibold mb-4">Stock status report for {popupData[0].part_code}</h2>

                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                <tr>
                                    <th className="border p-2">Part Code</th>
                                    <th className="border p-2">Title</th>
                                    <th className="border p-2">Price</th>
                                    <th className="border p-2">Qty On Hand</th>
                                    <th className="border p-2">Qty Applied</th>
                                    <th className="border p-2">Qty Estimated</th>
                                    <th className="border p-2">Qty On PO</th>
                                    <th className="border p-2">Qty Available</th>
                                    <th className="border p-2">Inventory Value</th>
                                </tr>
                                </thead>
                                <tbody>
                                {popupData.map(item => (
                                    <tr>
                                        <td className="border p-2">{item.part_code}</td>
                                        <td className="border p-2">{item.title}</td>
                                        <td className="border p-2">{item.price}</td>
                                        <td className="border p-2">{item.qty_on_hand}</td>
                                        <td className="border p-2">{item.qty_applied}</td>
                                        <td className="border p-2">{item.qty_estimated}</td>
                                        <td className="border p-2">{item.qty_on_po}</td>
                                        <td className="border p-2">{item.qty_available}</td>
                                        <td className="border p-2">{item.inventory_value}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}

                        <div className="flex justify-end mt-4">
                            <button
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                                onClick={handleClose}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}



            {/* Simple Modal for displaying stock status report */}
            {/*{open && (*/}
            {/*    <div >*/}
            {/*        <div >*/}
            {/*            <h3>Stock Status Report</h3>*/}
            {/*            {loading ? (*/}
            {/*                <p>Loading...</p>*/}
            {/*            ) : error ? (*/}
            {/*                <p style={{ color: "red" }}>{error}</p>*/}
            {/*            ) : (*/}
            {/*                <table style={{ width: "100%", borderCollapse: "collapse" }}>*/}
            {/*                    <thead>*/}
            {/*                    <tr>*/}
            {/*                        <th>Part Code</th>*/}
            {/*                        <th>Title</th>*/}
            {/*                        <th>Price</th>*/}
            {/*                        <th>Qty On Hand</th>*/}
            {/*                        <th>Qty Applied</th>*/}
            {/*                        <th>Qty Estimated</th>*/}
            {/*                        <th>Qty On PO</th>*/}
            {/*                        <th>Qty Available</th>*/}
            {/*                        <th>Inventory Value</th>*/}
            {/*                    </tr>*/}
            {/*                    </thead>*/}
            {/*                    <tbody>*/}
            {/*                    {popupData.map((item, index) => (*/}
            {/*                        <tr key={index}>*/}
            {/*                            <td>{item.part_code}</td>*/}
            {/*                            <td>{item.title}</td>*/}
            {/*                            <td>{item.price}</td>*/}
            {/*                            <td>{item.qty_on_hand}</td>*/}
            {/*                            <td>{item.qty_applied}</td>*/}
            {/*                            <td>{item.qty_estimated}</td>*/}
            {/*                            <td>{item.qty_on_po}</td>*/}
            {/*                            <td>{item.qty_available}</td>*/}
            {/*                            <td>{item.inventory_value}</td>*/}
            {/*                        </tr>*/}
            {/*                    ))}*/}
            {/*                    </tbody>*/}
            {/*                </table>*/}
            {/*            )}*/}
            {/*            <button onClick={handleClose} >Close</button>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*)}*/}
        </div>
    );
};

export default PartReportTable;
