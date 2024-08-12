/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 8/12/2024, Monday
 * Description:
 **/

import React from 'react';
import DataTable from 'react-data-table-component';
import {round2Dec} from "../utils/NumberHelper";
import {FaArrowDown} from "react-icons/fa";

// Utility function to get unique parts with aggregated details
const getUniqueParts = (jobs) => {
    const partsMap = new Map();

    jobs.forEach(job => {
        job.jobparts.forEach(part => {
            const { code, title, price,part_condition } = part.parts;
            const { quantity, purchase_cost, availability } = part;

            if (partsMap.has(code)) {
                const existingPart = partsMap.get(code);
                existingPart.quantity += quantity;

            } else {
                partsMap.set(code, {
                    code,
                    title,
                    purchase_cost,
                    price,
                    quantity,
                    part_condition,
                    availability
                });
            }
        });
    });

    return Array.from(partsMap.values());
};

// React component to display parts in a table using react-data-table-component
const PartsTable = ({ jobs }) => {
    const uniqueParts = getUniqueParts(jobs);
    const columns = [
        {
            name: 'CODE',
            selector: row => row.code,
            sortable: true,
            width: '10%',
            sortFunction: (a, b) => a.code.localeCompare(b.code) // Sorting by code
        },
        {
            name: 'TITLE',
            selector: row => row.title,
            sortable: true,
            width: '33%',
        },
        {
            name: 'COST',
            selector: row => round2Dec(row.purchase_cost),
            sortable: true,
            width: '8%',
            cell: (row) => {
                const purchaseCost = row.purchase_cost;
                const price = row.price;
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
            name: 'PRICE IN THE INVENTORY',
            selector: row => row.price,
            sortable: true,
            cell: (row) => (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                    {round2Dec(row.price)}
                </span>
            ),
            width: '18%',
        },
        {
            name: 'QUANTITY',
            selector: row => round2Dec(row.quantity),
            sortable: true,
            width: '10%',
        },
        {
            name: 'CONDITION',
            selector: row => row.part_condition,
            sortable: true,
            width: '10%',
        },
        {
            name: 'AVAILABILITY',
            selector: row => row.availability,
            sortable: true,
            width: '10%',
        },
    ];

    return (

        <div>
            <div className="flex justify-between mb-5 items-center">
                <h6 className='font-semibold'>Parts List</h6>
            </div>
            <DataTable
                columns={columns}
                data={uniqueParts}
                pagination
                highlightOnHover
                striped
                responsive
                pagination={false}
                defaultSortField="code" // Default sort by code column
                defaultSortAsc={true}   // Default ascending order
            />
        </div>
    );
};

export default PartsTable;
