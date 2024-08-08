import React, { useEffect, useState, useMemo } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import { round2Dec } from "../utils/NumberHelper";

const JoblistTable = ({ jobs, commonData, is_billed_to_lessee }) => {
    const [tableData, setTableData] = useState([]);
    const [isBilledtoLessee,setIsBilledToLessee]= useState(false)
    useEffect(() => {
        const jobListData = jobs.map((job) => ({
            id: job.id,
            ln: job.line_number,
            loc: job.locationcode.code,
            qty: job.quantity,
            cc: job.conditioncode.code,
            jobcode: job.jobcode_joblist_job_code_appliedTojobcode.code,
            aq: job.qualifiercode_joblist_qualifier_applied_idToqualifiercode==null?'':job.qualifiercode_joblist_qualifier_applied_idToqualifiercode.code,
            description: job.job_description,
            wmc: job.whymadecode.code,
            labor: round2Dec(job.labor_time * job.labor_rate),
            material: job.material_cost,
            net: round2Dec(job.labor_cost + job.material_cost),
            rev: job.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name,
            is_billed_to_lessee: job.secondary_bill_to_id==null?false:true
        }));

        setTableData(jobListData);
        setIsBilledToLessee(is_billed_to_lessee)
    }, [jobs,is_billed_to_lessee]);

    const columns = useMemo(
        () => [
            { accessorKey: 'id', header: 'id', size: 10 },
            { accessorKey: 'ln', header: 'Line', size: 20 },
            { accessorKey: 'loc', header: 'Loc', size: 20 },
            { accessorKey: 'qty', header: 'Qty', size: 20 },
            { accessorKey: 'cc', header: 'CC', size: 20 },
            { accessorKey: 'jobcode', header: 'JC', size: 20 },
            { accessorKey: 'aq', header: 'AQ', size: 20 },
            { accessorKey: 'description', header: 'Description of Repair', size: 250 },
            { accessorKey: 'wmc', header: 'WMC', size: 20 },
            { accessorKey: 'labor', header: 'Labor Hrs', size: 20 },
            { accessorKey: 'material', header: 'Material', size: 20 },
            { accessorKey: 'net', header: 'Net Cost', size: 20 },
            { accessorKey: 'rev', header: 'Revenue Category', size: 20 },
            {
                accessorKey: 'is_billed_to_lessee',
                header: 'Bill to Lessee',
                size: 20,
                Cell: ({ row }) => {
                    const isBilledToLessee = row.getValue('is_billed_to_lessee');
                    console.log('is_billed_to_lessee:', isBilledToLessee); // Debug log

                    return (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                checked={isBilledToLessee !== null}
                                disabled={isBilledToLessee === null}
                                className="checkbox checkbox-primary"
                            />
                        </div>
                    );
                },
            },
        ],
        [],
    );

    const table = useMaterialReactTable({
        columns,
        data: tableData,
        enablePagination: false,
        enableFilters: false,
        enableColumnFilters:false,
        enableSorting:false,
        enableExpandAll:false,
        enableColumnActions:false,
        enableDensityToggle:false,
        enableExpanding:false,
        enableFullScreenToggle:false,
        enableGrouping:false,
        enableRowDragging:true,
        enableTopToolbar:false,
        initialState: { columnVisibility: { id: false, is_billed_to_lessee: isBilledtoLessee } },
    });

    return (
        <div>
            <div className="flex justify-between">
                <h6 className='font-semibold'>Job List</h6>
                <button className='btn btn-secondary btn-sm normal-case'>Add Job</button>
            </div>

            <MaterialReactTable table={table} />
        </div>
    );
};

export default JoblistTable;
