import React, { useEffect, useState, useMemo } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import { round2Dec } from "../utils/NumberHelper";
import EditJobModal from './EditJobModal';
import axios, {all} from "axios";

const JoblistTable = ({ jobs, workOrder, handlePaste, commonData, isBilledToLessee,createAjob,updateAJob,deleteJob,updateBillToLesseForAJob }) => {
    console.log(jobs)



    // ParentModal related stuffs can be found below
    const [modalShowing, setModalShowing] = useState(false)
    const [editData, setEditData] = useState()
    const [isWebServiceCalling,setIsWebserviceCalling]= useState(false)
    const [tableData, setTableData] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({
        is_billed_to_lessee: false,
        id:false
    });
    useEffect(() => {
        setColumnVisibility({ id:false,secondary_bill_to_id: isBilledToLessee }); //programmatically show firstName column
    }, [isBilledToLessee]);

    useEffect(() => {
        console.log(jobs);
        jobs.sort((a, b) => a.line_number - b.line_number)
        const today = new Date();
        const cutoffDate = new Date("2025-11-01");

        const jobListData = jobs.map((job) => {

            const laborTimeAar = parseFloat(job.labor_time_aar);
            const laborRate = parseFloat(job.labor_rate);
            const varLaborTime = parseFloat(job.variable_labor_time);
            const varLaborRate = parseFloat(job.variable_labor_rate);
            const qty = parseFloat(job.quantity);
            const perItemFixed = round2Dec(laborTimeAar*round2Dec(laborRate));
            const perItemVariable = round2Dec(varLaborRate*varLaborTime);
            let laborCost = calculateLaborCost(job);

            // New rule: responsibility code = 3 AND today > 2025-11-01
            // if (parseInt(job.responsibilitycode.code) === 3 && today > cutoffDate) {
            //     laborCost =
            //         1 * perItemFixed +
            //         Math.max(qty, 0) * perItemVariable;
            // } else {
            //     // Old rule
            //     laborCost = perItemVariable * qty;
            // }

            laborCost = round2Dec(laborCost);
            const net = parseFloat(job.material_cost)+parseFloat(laborCost);
            return {
                id: job.id,
                action: job,
                ln: job.line_number,
                loc: job.locationcode.code,
                qty: job.quantity,
                cc: job.conditioncode.code,
                jobcode: job.jobcode_joblist_job_code_appliedTojobcode.code,
                aq:
                    job.qualifiercode_joblist_qualifier_applied_idToqualifiercode == null
                        ? ""
                        : job.qualifiercode_joblist_qualifier_applied_idToqualifiercode.code,
                description: job.job_description,
                wmc: job.whymadecode.code,
                labor_time: round2Dec(job.labor_time),
                labor_time_aar: job.labor_time_aar,
                variable_labor_time: round2Dec(job.variable_labor_time),
                variable_labor_rate: round2Dec(job.variable_labor_rate),
                labor: laborCost,
                material: round2Dec(job.material_cost),
                net: round2Dec(net),
                rev: job.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name,
                secondary_bill_to_id: job.secondary_bill_to_id
            };
        });
        console.log(jobListData);
        setTableData(jobListData);
    }, [jobs]);


    const [jobsToBePasted, setJobsToBePasted] = useState(() => {
        // Initialize state from localStorage
        return JSON.parse(localStorage.getItem("jobsToBePasted"));
    });


    useEffect(() => {
        // Update state if the value in localStorage changes
        const handleStorageChange = () => {
            setJobsToBePasted(JSON.parse(localStorage.getItem("jobsToBePasted")));
        };

        // Listen to storage events (this only works across different tabs)
        window.addEventListener("storage", handleStorageChange);

        // Cleanup listener on component unmount
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    // Optional: Watch for changes to jobsToBePasted and sync with localStorage if needed
    useEffect(() => {
        if (jobsToBePasted !== null) {
            localStorage.setItem("jobsToBePasted", JSON.stringify(jobsToBePasted));
        }
    }, [jobsToBePasted]);


    const calculateLaborCost = (job) => {
        const today = new Date();
        const cutoffDate = new Date("2025-11-01");

        const laborTimeAar = parseFloat(job.labor_time_aar);
        const laborRate = parseFloat(job.labor_rate);
        const varLaborTime = parseFloat(job.variable_labor_time);
        const varLaborRate = parseFloat(job.variable_labor_rate);
        const qty = parseFloat(job.quantity);

        let laborCost = 0;
        console.log(job.quantity);
        if (parseInt(job.responsibilitycode.code) === 3 && today > cutoffDate) {

            if (qty > 1) {
                // Case: responsibility_code = 3 AND quantity = 1
                laborCost =
                    1 * laborTimeAar * laborRate +
                    qty * varLaborTime * varLaborRate;

            } else  {

                laborCost =
                    qty * laborTimeAar * laborRate +
                    qty * varLaborTime * varLaborRate;

            }

            console.log(laborCost)
        } else {
            // old rule
            laborCost = varLaborTime * varLaborRate * qty;
        }

        return round2Dec(laborCost);
    };


    const handleCopyJob = (jobToCopyId) => {
        localStorage.setItem("jobsToBePasted", null);

        const jobToCopy = jobs.find(job => job.id == jobToCopyId) || null;
        setCopiedJob(jobToCopy);

        const labor_cost = calculateLaborCost(jobToCopy);

        const copiedJobFormatted = {
            work_id: workOrder.id,
            work_order: workOrder.work_order,
            line_number: Number(jobs.line_number),
            location_code: jobToCopy.locationcode.code,
            quantity: jobToCopy.quantity,
            condition_code: jobToCopy.conditioncode.code,
            job_code_applied: jobToCopy.jobcode_joblist_job_code_appliedTojobcode.code,
            qualifier_applied_id:
                jobToCopy.qualifiercode_joblist_qualifier_applied_idToqualifiercode == null
                    ? null
                    : jobToCopy.qualifiercode_joblist_qualifier_applied_idToqualifiercode.id,
            job_description: jobToCopy.job_description,
            why_made_code: jobToCopy.whymadecode.code,
            job_code_removed: jobToCopy.jobcode_joblist_job_code_removedTojobcode.code,
            qualifier_removed_id:
                jobToCopy.qualifiercode_joblist_qualifier_removed_idToqualifiercode == null
                    ? null
                    : jobToCopy.qualifiercode_joblist_qualifier_removed_idToqualifiercode.id,
            responsibility_code: jobToCopy.responsibilitycode?.code,
            labor_cost:Number(labor_cost),
            labor_time: jobToCopy.labor_time,
            labor_time_aar: jobToCopy.labor_time_aar,
            labor_rate: jobToCopy.labor_rate,
            variable_labor_time: jobToCopy.variable_labor_time,
            variable_labor_rate: jobToCopy.variable_labor_rate,
            material_cost: Number(round2Dec(jobToCopy.material_cost)),
            jobPartsData: jobToCopy.jobparts.map(({ id, parts, ...rest }) => rest),
            user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["id"]
        };

        setCopiedJob(copiedJobFormatted);
        setJobsToBePasted([copiedJobFormatted]);
        localStorage.setItem("jobsToBePasted", JSON.stringify([copiedJobFormatted]));
    };



    const handleCopyAllJobs = () => {
        localStorage.setItem("jobsToBePasted", null);

        const jobToBePasted = jobs.map(job => {
            const labor_cost = calculateLaborCost(job);

            return {
                work_id: workOrder.id,
                work_order: workOrder.work_order,
                line_number: Number(jobs.line_number),
                location_code: job.locationcode.code,
                quantity: job.quantity,
                condition_code: job.conditioncode.code,
                job_code_applied: job.jobcode_joblist_job_code_appliedTojobcode.code,
                qualifier_applied_id:
                    job.qualifiercode_joblist_qualifier_applied_idToqualifiercode == null
                        ? null
                        : job.qualifiercode_joblist_qualifier_applied_idToqualifiercode.id,
                job_description: job.job_description,
                why_made_code: job.whymadecode.code,
                job_code_removed: job.jobcode_joblist_job_code_removedTojobcode.code,
                qualifier_removed_id:
                    job.qualifiercode_joblist_qualifier_removed_idToqualifiercode == null
                        ? null
                        : job.qualifiercode_joblist_qualifier_removed_idToqualifiercode.id,
                responsibility_code: job.responsibilitycode?.code,
                labor_cost,
                labor_time: job.labor_time,
                labor_time_aar: job.labor_time_aar,
                labor_rate: job.labor_rate,
                variable_labor_time: job.variable_labor_time,
                variable_labor_rate: job.variable_labor_rate,
                material_cost: Number(round2Dec(job.material_cost)),
                jobPartsData: job.jobparts.map(({ id, parts, ...rest }) => rest),
                user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["id"]
            };
        });

        setCopiedJob(jobToBePasted);
        setJobsToBePasted(jobToBePasted);
        localStorage.setItem("jobsToBePasted", JSON.stringify(jobToBePasted));
    };


    const handlePasteJob = async () => {
        const copiedJobs = JSON.parse(localStorage.getItem("jobsToBePasted"));
        const modifiledJobs = updateArray(
            copiedJobs,
            workOrder.id,
            workOrder.work_order,
            jobs.length
        );

        const response = await handlePaste(modifiledJobs);

        if (response.status !== 200) {
            alert("Job pasting was not successful");
        }
    };


    const updateArray = (data, newWorkId, newWorkOrder, startingLineNumber) => {
        return data.map((item, index) => ({
            ...item,
            work_id: newWorkId,
            work_order: newWorkOrder,
            line_number: startingLineNumber + index + 1
        }));
    };

    const handleJobBillToLessee = async (job_id,is_checked) =>{
        //onChange={(e) => updateLockForTimeClocking(e.target.checked)}
       //secondary_bill_to_id,job_id,workId
        await updateBillToLesseForAJob(is_checked?workOrder.railcar.owner_railcar_lessee_idToowner.id:null,job_id,workOrder.id)
    }

    const [copiedJob, setCopiedJob] = useState([])


    const columns = useMemo(
        () => [
            { accessorKey: 'id', header: 'id', size: 2 },
            { accessorKey: 'ln', header: 'Line', size: 2 ,
                Cell: ({ row }) => {
                    return (
                        <div onClick={() => {
                            setEditData(null)
                            setEditData(jobs.find(job => job.id === row.getValue("id")) || null)
                            setModalShowing(true)
                        }} class="flex justify-between items-center cursor-pointer">
                            { row.getValue('ln')}
                        </div>

                    );
                },},
            {
                accessorKey: 'action',
                header: 'Copy',
                size: 5,

                Cell: ({ row }) => {
                    return (
                        <div class="flex justify-between items-center cursor-pointer ">

                            <span onClick={() => {
                                handleCopyJob(row.getValue("id"))
                                console.log(row.getValue("id"), "This is the row to copy id")
                            }} className='cursor-pointer'>
                                    <svg fill="#000000" width="22" height="30" viewBox="0 0 22 16" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M8,7 L8,8 L6.5,8 C5.67157288,8 5,8.67157288 5,9.5 L5,18.5 C5,19.3284271 5.67157288,20 6.5,20 L13.5,20 C14.3284271,20 15,19.3284271 15,18.5 L15,17 L16,17 L16,18.5 C16,19.8807119 14.8807119,21 13.5,21 L6.5,21 C5.11928813,21 4,19.8807119 4,18.5 L4,9.5 C4,8.11928813 5.11928813,7 6.5,7 L8,7 Z M16,4 L10.5,4 C9.67157288,4 9,4.67157288 9,5.5 L9,14.5 C9,15.3284271 9.67157288,16 10.5,16 L17.5,16 C18.3284271,16 19,15.3284271 19,14.5 L19,7 L16.5,7 C16.2238576,7 16,6.77614237 16,6.5 L16,4 Z M20,6.52797748 L20,14.5 C20,15.8807119 18.8807119,17 17.5,17 L10.5,17 C9.11928813,17 8,15.8807119 8,14.5 L8,5.5 C8,4.11928813 9.11928813,3 10.5,3 L16.4720225,3 C16.6047688,2.99158053 16.7429463,3.03583949 16.8535534,3.14644661 L19.8535534,6.14644661 C19.9641605,6.25705373 20.0084195,6.39523125 20,6.52797748 Z M17,6 L18.2928932,6 L17,4.70710678 L17,6 Z M11.5,13 C11.2238576,13 11,12.7761424 11,12.5 C11,12.2238576 11.2238576,12 11.5,12 L13.5,12 C13.7761424,12 14,12.2238576 14,12.5 C14,12.7761424 13.7761424,13 13.5,13 L11.5,13 Z M11.5,11 C11.2238576,11 11,10.7761424 11,10.5 C11,10.2238576 11.2238576,10 11.5,10 L16.5,10 C16.7761424,10 17,10.2238576 17,10.5 C17,10.7761424 16.7761424,11 16.5,11 L11.5,11 Z M11.5,9 C11.2238576,9 11,8.77614237 11,8.5 C11,8.22385763 11.2238576,8 11.5,8 L16.5,8 C16.7761424,8 17,8.22385763 17,8.5 C17,8.77614237 16.7761424,9 16.5,9 L11.5,9 Z"/>
                                        </svg>
                            </span>

                        </div>

                    );
                },
            },
            { accessorKey: 'loc', header: 'Loc', size: 2 },
            { accessorKey: 'qty', header: 'Qty', size: 3 },
            { accessorKey: 'cc', header: 'CC', size: 3 },
            { accessorKey: 'jobcode', header: 'JC', size: 3 },
            { accessorKey: 'aq', header: 'AQ', size: 3 },
            { accessorKey: 'description', header: 'Description of Repair', size: 15 },
            { accessorKey: 'wmc', header: 'WMC', size: 5 },
            {
                accessorKey: 'labor_time',
                header: 'Labor Hrs',
                size: 2,
                Cell: ({ row  }) => {
                    const v = row.original.variable_labor_time;       // (V)
                    const f = row.original.labor_time_aar;   // (F)

                    // Assuming your data has labor_time like:
                    // { v: 1.00, f: 2.00 }
                    // Or adjust accordingly
                    return (
                        <div className="leading-tight">
                            <div>(V) {round2Dec(v)}</div>
                            <div>(F) {round2Dec(f)}</div>
                        </div>
                    );
                },
            },

            { accessorKey: 'labor', header: 'Labor cost$', size: 2 },
            { accessorKey: 'material', header: 'Material', size: 2 },
            { accessorKey: 'net', header: 'Net Cost', size: 2 },
            { accessorKey: 'rev', header: 'Revenue', size: 2  },
            {
                accessorKey: 'secondary_bill_to_id',
                header: 'Bill to Lessee',
                size: 2,
                Cell: ({ row }) => {
                    const isBilled = row.getValue('secondary_bill_to_id');

                    return (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                checked={isBilled  != null}
                                disabled={workOrder.locked_by != null}
                                onChange={(e) => handleJobBillToLessee(row.getValue('id'),e.target.checked)}
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

        const original_job1 = jobs.find(item => item.line_number === lineNumber1);
        const original_job2 = jobs.find(item => item.line_number === lineNumber2);

        // Swap their line numbers
        if (original_job1 && original_job2) {
            [original_job1.line_number, original_job2.line_number] = [original_job2.line_number, original_job1.line_number];
        }
        jobs.sort((a, b) => a.line_number - b.line_number)

        return data;
    }

    function reorderLines(data, toLine, fromLine) {
        if (fromLine === toLine) return data; // No changes needed if the positions are the same

        // Sort data by line numbers
        data.sort((a, b) => a.ln - b.ln);

        // Find the item to move
        const itemToMove = data.find(item => item.ln === fromLine);

        if (!itemToMove) {
            console.error("Invalid `fromLine` number provided.");
            return data;
        }

        // Remove the item from its current position
        const remainingItems = data.filter(item => item.ln !== fromLine);

        // Determine the new index for the item
        const toIndex = remainingItems.findIndex(item => item.ln === toLine);

        if (toIndex === -1) {
            console.error("Invalid `toLine` number provided.");
            return data;
        }

        // Insert the item at the new position
        remainingItems.splice(toIndex, 0, itemToMove);

        // Reassign line numbers to maintain sequential order
        remainingItems.forEach((item, index) => {
            item.ln = index + 1;
        });

        return remainingItems;
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
        enableRowOrdering:workOrder.locked_by==null,
        enableTopToolbar:false,
        initialState: { columnVisibility: { id: false } },
        state: { columnVisibility },
        onColumnVisibilityChange: setColumnVisibility,
        muiRowDragHandleProps: ({ table }) => ({
            onDragEnd: () => {
                const { draggingRow, hoveredRow } = table.getState();
                if (hoveredRow && draggingRow) {
                    if(hoveredRow.original.ln ==draggingRow.original.ln){
                        return
                    }
                    console.log(hoveredRow.original.ln)
                    console.log(draggingRow.original.ln)

                    const line_from=draggingRow.original.ln
                    const line_to=hoveredRow.original.ln
                    setIsWebserviceCalling(true)
                    const updatedTable = reorderLines(tableData,hoveredRow.original.ln,draggingRow.original.ln)
                    //console.log(updatedTable)
                    setTableData([...updatedTable]);
                    // console.log(tableData)
                    // console.log(jobs)
                    const requestData = {
                        line_one: line_from,
                        line_two: line_to,
                        work_order: workOrder.work_order,
                        user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["id"],
                        work_id:workOrder.id
                    };

                    console.log(requestData)
                    axios.post(process.env.REACT_APP_BIRCH_API_URL+'swap_line_number/', requestData)
                        .then(response => {
                            console.log('Success:', response.data);
                            setIsWebserviceCalling(false)
                            if(response.status==200){

                            }
                        })
                        .catch(error => {
                            setIsWebserviceCalling(false)
                            console.error('Error:', error.response ? error.response.data : error.message);
                            setTableData(tableData);
                        });

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
                paddingY:'20px',
                paddingX:'5px'
            }),
        },

    });

    return (
        <div>
            <div className="flex justify-between mb-5 items-center">
                <h6 className='font-semibold'>Job List</h6>
                <div className="flex space-x-2">
                    {tableData.length>0 &&(
                        <button className='btn btn-secondary btn-sm normal-case' onClick={handleCopyAllJobs}>Copy all the jobs</button>
                    )}


                    {/*{JSON.parse(localStorage.getItem("jobsToBePasted")) != null && (*/}
                    {/*    <button className='btn btn-secondary btn-sm normal-case' onClick={handlePasteJob}>Paste Job</button>*/}
                    {/*)}*/}

                    {(workOrder.locked_by == null && jobsToBePasted != null) && (
                        <button className="btn btn-secondary btn-sm normal-case" onClick={handlePasteJob}>
                            Paste Job
                        </button>
                    )}
                    {workOrder.locked_by ==null && (
                        <button
                            className='btn btn-secondary btn-sm normal-case'
                            onClick={() => {
                                setEditData(null);
                                setModalShowing(true);
                                console.log("ParentModal is now showing");
                            }}
                        >
                            Add Job
                        </button>
                    )}
                </div>


                <div className="absolute top-2/3 right-4 hidden lg:block">
                    <ul tabIndex={0} className="dropdown-content z-[1] menu  shadow bg-white p-0">

                        {tableData.length>0 &&(

                            <li className='flex h-fit text-[10px] p-0'onClick={handleCopyAllJobs} >
                                <span className="p-1">

                                    Copy all the jobs
                                </span>
                            </li>
                        )}


                        {(workOrder.locked_by == null && jobsToBePasted != null) && (

                            <li className='flex h-fit text-[10px] p-0'  onClick={handlePasteJob} >
                                <span className="p-1">

                                     Paste Job
                                </span>
                            </li>
                        )}


                        {workOrder.locked_by ==null && (



                            <li className='flex h-fit text-[10px] p-0' onClick={() => {
                                    setEditData(null);
                                    setModalShowing(true);

                            }}>
                            <span className="p-1">

                                Add Job
                            </span>
                            </li>
                        )}

                    </ul>
                </div>


            </div>



            <MaterialReactTable
                table={table}
                className="custom-table"
            />

            {modalShowing && <EditJobModal lineNumber={jobs?.length + 1 || 1} workOrder={workOrder} commonData={commonData} setModalShowing={setModalShowing} editData={editData} setEditData={setEditData} createAjob={createAjob} updateAJob={updateAJob} deleteJob={deleteJob} />}
        </div>
    );
};

export default JoblistTable;