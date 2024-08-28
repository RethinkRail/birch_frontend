import React, { useEffect, useState, useMemo } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import { round2Dec } from "../utils/NumberHelper";
import EditJobModal from './EditJobModal';
import axios, {all} from "axios";

const JoblistTable = ({ jobs, workOrder, handlePaste, commonData, isBilledToLessee,createAjob,updateAJob,deleteJob,updateBillToLesseForAJob }) => {

    useEffect(() => {
        jobs.sort((a, b) => a.line_number - b.line_number)
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
            labor_time: round2Dec(job.labor_time),
            labor: round2Dec(job.labor_time * job.labor_rate),
            material: job.material_cost,
            net: round2Dec(job.labor_cost + job.material_cost),
            rev: job.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name,
            secondary_bill_to_id: job.secondary_bill_to_id
        }));

        console.log("Updated jobListData from the joblist table:", jobListData);
        setTableData(jobListData);
    }, [workOrder, jobs]);

    // Modal related stuffs can be found below
    const [modalShowing, setModalShowing] = useState(false)
    const [editData, setEditData] = useState()

    const [tableData, setTableData] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({
        is_billed_to_lessee: false,
        id:false
    });
    useEffect(() => {
        setColumnVisibility({ id:false,secondary_bill_to_id: isBilledToLessee }); //programmatically show firstName column
    }, [isBilledToLessee]);

    useEffect(() => {
        const jobListData = jobs.map((job) => ({
            id: job.id,
            action: job,
            ln: job.line_number,
            loc: job.locationcode.code,
            qty: job.quantity,
            cc: job.conditioncode.code,
            jobcode: job.jobcode_joblist_job_code_appliedTojobcode.code,
            aq: job.qualifiercode_joblist_qualifier_applied_idToqualifiercode==null?'':job.qualifiercode_joblist_qualifier_applied_idToqualifiercode.code,
            description: job.job_description,
            wmc: job.whymadecode.code,
            labor_time: round2Dec(job.labor_time),
            labor: round2Dec(job.labor_time * job.labor_rate),
            material: round2Dec(job.material_cost),
            net: round2Dec(job.labor_cost + job.material_cost),
            rev: job.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name,
            secondary_bill_to_id: job.secondary_bill_to_id
        }));
        console.log("SSS")
        console.log(isBilledToLessee)

        setTableData(jobListData);
    }, [jobs]);

    const handleCopyJob = (jobToCopyId) => {
        localStorage.setItem("jobsToBePasted", null)
        setCopiedJob(jobs.find(job => job.id === jobToCopyId) || null)
        console.log(copiedJob)
        let jobToBePasted = []
        const copiedJobFormatted = {
            work_id: workOrder.id,
            work_order: workOrder.work_order,
            line_number: Number(jobs.line_number),
            location_code: copiedJob.locationcode.code,
            quantity: copiedJob.quantity,
            condition_code: copiedJob.conditioncode.code,
            job_code_applied: copiedJob.jobcode_joblist_job_code_appliedTojobcode.code,
            qualifier_applied_id: copiedJob.qualifiercode_joblist_qualifier_applied_idToqualifiercode==null?null: copiedJob.qualifiercode_joblist_qualifier_applied_idToqualifiercode.id,
            job_description: copiedJob.job_description,
            why_made_code: copiedJob.whymadecode.code,
            job_code_removed: copiedJob.jobcode_joblist_job_code_removedTojobcode.code,
            qualifier_removed_id: copiedJob.qualifiercode_joblist_qualifier_removed_idToqualifiercode==null?null: copiedJob.qualifiercode_joblist_qualifier_removed_idToqualifiercode.id,
            responsibility_code: copiedJob.responsibilitycode?.id,
            labor_cost: copiedJob.labor_cost,
            labor_time: copiedJob.labor_time,
            labor_rate: copiedJob.labor_rate,
            material_cost: Number(round2Dec(copiedJob.material_cost)),
            jobPartsData: copiedJob.jobparts.map(({ id, parts, ...rest }) => rest),
            user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["id"]
        }

        jobToBePasted.push(copiedJobFormatted)

        localStorage.setItem("jobsToBePasted", JSON.stringify(jobToBePasted))
    }

    const handleCopyAllJobs = () => {
        localStorage.setItem("jobsToBePasted", null)
        let jobToBePasted = []
        let i= 0
        jobs.map((job)=>{
            i++
            console.log(job)
            const copiedJobFormatted = {
                work_id: workOrder.id,
                work_order: workOrder.work_order,
                line_number: Number(jobs.line_number),
                location_code: job.locationcode.code,
                quantity: job.quantity,
                condition_code: job.conditioncode.code,
                job_code_applied: job.jobcode_joblist_job_code_appliedTojobcode.code,
                qualifier_applied_id: job.qualifiercode_joblist_qualifier_applied_idToqualifiercode==null?null: job.qualifiercode_joblist_qualifier_applied_idToqualifiercode.id,
                job_description: job.job_description,
                why_made_code: job.whymadecode.code,
                job_code_removed: job.jobcode_joblist_job_code_removedTojobcode.code,
                qualifier_removed_id: job.qualifiercode_joblist_qualifier_removed_idToqualifiercode==null?null: job.qualifiercode_joblist_qualifier_removed_idToqualifiercode.id,
                responsibility_code: job.responsibilitycode.id,
                labor_cost: job.labor_cost,
                labor_time: job.labor_time,
                labor_rate: job.labor_rate,
                material_cost: Number(round2Dec(job.material_cost)),
                jobPartsData: job.jobparts.map(({ id, parts, ...rest }) => rest),
                user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["id"]
            }
            jobToBePasted.push(copiedJobFormatted)
        })

        console.log(jobToBePasted)

        localStorage.setItem("jobsToBePasted", JSON.stringify(jobToBePasted))
    }

    const handlePasteJob = async () => {
        const copiedJobs=  JSON.parse(localStorage.getItem("jobsToBePasted"))
        const modifiledJobs = updateArray(copiedJobs,workOrder.id,workOrder.work_order,jobs.length)
        console.log(modifiledJobs)
        const response = await  handlePaste(modifiledJobs)
        if(response.status==200){
            localStorage.setItem("jobsToBePasted", null)
        }
    }

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
        const response =    await updateBillToLesseForAJob(is_checked?workOrder.railcar.owner_railcar_lessee_idToowner.id:null,job_id,workOrder.id)
        console.log(response)
    }

    const [copiedJob, setCopiedJob] = useState(null)


    const columns = useMemo(
        () => [
            { accessorKey: 'id', header: 'id', size: 2 },
            {
                accessorKey: 'action',
                header: 'Action',
                size: 5,

                Cell: ({ row }) => {
                    return (
                        <div class="flex justify-between items-center cursor-pointer">

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
            { accessorKey: 'loc', header: 'Loc', size: 2 },
            { accessorKey: 'qty', header: 'Qty', size: 3 },
            { accessorKey: 'cc', header: 'CC', size: 3 },
            { accessorKey: 'jobcode', header: 'JC', size: 3 },
            { accessorKey: 'aq', header: 'AQ', size: 3 },
            { accessorKey: 'description', header: 'Description of Repair', size: 15 },
            { accessorKey: 'wmc', header: 'WMC', size: 5 },
            { accessorKey: 'labor_time', header: 'Labor Hrs', size: 2 },
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
                    console.log(isBilled)
                    return (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                checked={isBilled  != null}

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
                    const requestData = {
                        line_one: draggingRow.original.ln,
                        line_two: hoveredRow.original.ln,
                        work_order: workOrder.work_order,
                        user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["id"]
                    };
                    axios.post(process.env.REACT_APP_BIRCH_API_URL+'swap_line_number/', requestData)
                        .then(response => {
                            console.log('Success:', response.data);
                            if(response.status==200){

                            }
                        })
                        .catch(error => {
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
                padding:'5px'
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


                    {JSON.parse(localStorage.getItem("jobsToBePasted")) != null && (
                        <button className='btn btn-secondary btn-sm normal-case' onClick={handlePasteJob}>Paste Job</button>
                    )}

                    <button className='btn btn-secondary btn-sm normal-case' onClick={() => {
                        setEditData(null)
                        setModalShowing(true)
                        console.log("Modal is now showing")
                    }}>Add Job</button>
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