import React, { useEffect, useState, useMemo } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import { round2Dec } from "../utils/NumberHelper";
import EditJobModal from "./EditJobModal";

const JoblistTable = ({ jobs, workOrder, handlePaste, commonData, is_billed_to_lessee  }) => {
    console.log(jobs)
    const [tableData, setTableData] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({
        is_billed_to_lessee: false,
        id:false
    });
    console.log(commonData)
    useEffect(() => {
        setColumnVisibility({ id:false,is_billed_to_lessee: is_billed_to_lessee }); //programmatically show firstName column
    }, [is_billed_to_lessee]);

    useEffect(() => {
        const jobListData = jobs.map((job) => ({
            id: job.id,
            action: job,
            ln: job.line_number,
            loc: job.locationcode.code,
            qty: job.quantity,
            cc: job.conditioncode.code,
            jobcode: job.jobcode_joblist_job_code_appliedTojobcode.code,
            aq: job.qualifiercode_joblist_qualifier_applied_idToqualifiercode == null ? '' : job.qualifiercode_joblist_qualifier_applied_idToqualifiercode.code,
            description: job.job_description,
            wmc: job.whymadecode.code,
            labor: round2Dec(job.labor_time * job.labor_rate),
            material: job.material_cost,
            net: round2Dec(job.labor_cost + job.material_cost),
            rev: job.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name,
            is_billed_to_lessee: job.secondary_bill_to_id == null ? false : true
        }));

        console.log("Updated jobListData from the joblist table:", jobListData);
        setTableData(jobListData);
    }, [workOrder, jobs]);

    const [modalShowing, setModalShowing] = useState(false)
    const [editData, setEditData] = useState()

    const handleCopyJob = (jobToCopyId) => {
        setCopiedJob(jobs.find(job => job.id === jobToCopyId) || null)
    }

    const handlePasteJob = () => {
        if(copiedJob === null) {
            return
        }
        console.log("The paste job function clicked", copiedJob)
        const jobWithRandomId = { ...copiedJob, id: Math.floor(Math.random() * 100000), line_number: jobs.length + 1 }
        handlePaste(workOrder.id, jobWithRandomId)
    }

    const [copiedJob, setCopiedJob] = useState(null)

    const columns = useMemo(
        () => [
            { accessorKey: 'id', header: 'id', size: 5 },
            {
                accessorKey: 'action',
                header: 'Action',
                size: 10,

                Cell: ({ row }) => {
                    return (
                        <div class="flex justify-between items-center cursor-pointer">

                            <span className='cursor-pointer' onClick={()=> handleCopyJob(row.getValue("id"))}>
                                    <svg fill="#000000" width="22" height="30" viewBox="0 0 22 16" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M8,7 L8,8 L6.5,8 C5.67157288,8 5,8.67157288 5,9.5 L5,18.5 C5,19.3284271 5.67157288,20 6.5,20 L13.5,20 C14.3284271,20 15,19.3284271 15,18.5 L15,17 L16,17 L16,18.5 C16,19.8807119 14.8807119,21 13.5,21 L6.5,21 C5.11928813,21 4,19.8807119 4,18.5 L4,9.5 C4,8.11928813 5.11928813,7 6.5,7 L8,7 Z M16,4 L10.5,4 C9.67157288,4 9,4.67157288 9,5.5 L9,14.5 C9,15.3284271 9.67157288,16 10.5,16 L17.5,16 C18.3284271,16 19,15.3284271 19,14.5 L19,7 L16.5,7 C16.2238576,7 16,6.77614237 16,6.5 L16,4 Z M20,6.52797748 L20,14.5 C20,15.8807119 18.8807119,17 17.5,17 L10.5,17 C9.11928813,17 8,15.8807119 8,14.5 L8,5.5 C8,4.11928813 9.11928813,3 10.5,3 L16.4720225,3 C16.6047688,2.99158053 16.7429463,3.03583949 16.8535534,3.14644661 L19.8535534,6.14644661 C19.9641605,6.25705373 20.0084195,6.39523125 20,6.52797748 Z M17,6 L18.2928932,6 L17,4.70710678 L17,6 Z M11.5,13 C11.2238576,13 11,12.7761424 11,12.5 C11,12.2238576 11.2238576,12 11.5,12 L13.5,12 C13.7761424,12 14,12.2238576 14,12.5 C14,12.7761424 13.7761424,13 13.5,13 L11.5,13 Z M11.5,11 C11.2238576,11 11,10.7761424 11,10.5 C11,10.2238576 11.2238576,10 11.5,10 L16.5,10 C16.7761424,10 17,10.2238576 17,10.5 C17,10.7761424 16.7761424,11 16.5,11 L11.5,11 Z M11.5,9 C11.2238576,9 11,8.77614237 11,8.5 C11,8.22385763 11.2238576,8 11.5,8 L16.5,8 C16.7761424,8 17,8.22385763 17,8.5 C17,8.77614237 16.7761424,9 16.5,9 L11.5,9 Z"/>
                                        </svg>
                            </span>

                        </div>

                    );
                },
            },
            { accessorKey: 'ln', header: 'Line', size: 5 ,
                Cell: ({ row }) => {
                    return (
                        <div class="flex justify-between items-center cursor-pointer">
                            { row.getValue('ln')}
                        </div>

                    );
                },},
            { accessorKey: 'loc', header: 'Loc', size: 5 },
            { accessorKey: 'qty', header: 'Qty', size: 5 },
            { accessorKey: 'cc', header: 'CC', size: 5 },
            { accessorKey: 'jobcode', header: 'JC', size: 5 },
            { accessorKey: 'aq', header: 'AQ', size: 5 },
            { accessorKey: 'description', header: 'Description of Repair', size: 20 },
            { accessorKey: 'wmc', header: 'WMC', size: 5 },
            { accessorKey: 'labor', header: 'Labor Hrs', size: 5 },
            { accessorKey: 'material', header: 'Material', size: 5 },
            { accessorKey: 'net', header: 'Net Cost', size: 5 },
            { accessorKey: 'rev', header: 'Revenue', size: 5 ,grow: false, },
            {
                accessorKey: 'is_billed_to_lessee',
                header: 'Bill to Lessee',
                size: 5,
                Cell: ({ row }) => {
                    const isBilledToLessee = row.getValue('is_billed_to_lessee');
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
        [jobs],
    );

    function swapLineNumbers(data, lineNumber1, lineNumber2) {
        // Find the objects with the given line numbers
        const obj1 = data.find(item => item.ln === lineNumber1);
        const obj2 = data.find(item => item.ln === lineNumber2);

        // Swap their line numbers
        if (obj1 && obj2) {
            [obj1.ln, obj2.ln] = [obj2.ln, obj1.ln];
        }
        data.sort((a, b) => a.ln - b.ln)
        return data;
    }

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
        enableRowOrdering:true,
        enableTopToolbar:false,
        initialState: { columnVisibility: { id: false } },
        state: { columnVisibility },
        onColumnVisibilityChange: setColumnVisibility,
        muiRowDragHandleProps: ({ table }) => ({
            onDragEnd: () => {
                const { draggingRow, hoveredRow } = table.getState();
                if (hoveredRow && draggingRow) {
                    const updatedTable = swapLineNumbers(tableData,hoveredRow.original.ln,draggingRow.original.ln)
                    setTableData([...updatedTable]);
                }
            },
        }),
        muiTableHeadCellProps: {
            //simple styling with the `sx` prop, works just like a style prop in this example

            sx: (theme) => ({
                color: theme.palette.text.disabled,

                fontWeight: 'bold',
                fontSize: '10px',
                padding:'5px'
            }),
        },
        muiTableBodyCellProps:{

            sx: (theme) => ({
                color: theme.palette.text.secondary,
                fontWeight: 'normal',
                fontSize: '12px',
                padding:'5px'
            }),
        },

    });

    return (
        <div>
            <div className="flex justify-between mb-5 items-center">
                <h6 className='font-semibold'>Job List</h6>
                <div className="flex space-x-2">
                    {/*<button className='btn btn-secondary btn-sm normal-case'>Copy all the jobs</button>*/}
                    <button className='btn btn-secondary btn-sm normal-case' onClick={handlePasteJob}>Paste Job</button>
                    <button className='btn btn-secondary btn-sm normal-case' onClick={() => {
                        setModalShowing(true)
                        console.log("Modal is now showing")
                    }}>Add Job</button>
                </div>

            </div>

            {modalShowing && <EditJobModal commonData={commonData} lineNumber={jobs?.length + 1 || 1} workOrder={workOrder} setModalShowing={setModalShowing} setEditData={setEditData} />}
            <MaterialReactTable
                table={table}
                className="custom-table"
            />
        </div>
    );
};

export default JoblistTable;
