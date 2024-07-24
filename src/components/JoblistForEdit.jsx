// Table.js
import React, {useState} from 'react';
import Jobs from '../DataSets/get_jobs.json'
// This component represents a draggable table with the ability to rearrange rows.

const JoblistForEdit = () => {
    // State to manage the table Jobs, which will be rearranged.
    const [tableData, setTableData] = useState(Jobs);

    // Function to handle the drag start event for a row.
    const handleDragStart = (e, rowIndex) => {
        e.dataTransfer.setData('rowIndex', rowIndex);
    };

    // Function to handle the drop event when a row is moved.
    const handleDrop = (e, rowIndex) => {
        e.preventDefault();
        // Get the source index from the data transfer.
        const sourceIndex = e.dataTransfer.getData('rowIndex');
        // Create a copy of the table data.
        const updatedData = [...tableData];
        // Remove the dragged row from its original position.
        const [draggedRow] = updatedData.splice(sourceIndex, 1);
        // Insert the dragged row at the new position.
        updatedData.splice(rowIndex, 0, draggedRow);
        // Update the state with the rearranged data.
        setTableData(updatedData);
    };

    // Function to handle the drag over event and allow dropping.
    const handleAllowDrop = (e) => {
        e.preventDefault();
    };
    const placeholderText = (
        <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M17.7197 17.5085L14.797 14.5979M16.8699 9.59362C16.878 13.5056 13.7133 16.6835 9.80129 16.6917C5.88928 16.6998 2.71137 13.5351 2.70322 9.62311C2.69508 5.7111 5.85979 2.53319 9.77179 2.52505C13.6838 2.51691 16.8617 5.68161 16.8699 9.59362Z"
                stroke="#686868" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>)
    return (
        <div className="">
            <div className="pt-[28px] flex justify-between">
                <p className='text-[24px] font-semibold'>Job List</p>
                <button
                    onClick={() => document.getElementById('AddJobPopup').showModal()}
                    className='btn btn-secondary normal-case'>Add job
                </button>
            </div>
            <div className="overflow-x-auto w-full mt-[15px] ml-[-1px] mx-auto   rounded-[8px]">
                <table className=" py-[12px]  w-full  bg-transparent   text-[#475467] ">
                    <thead className="uppercase text-[12px] font-medium bg-[#DCE5FF] ">
                    <tr className='h-[44px] '>
                        <th className='w-[55px]  '>LN</th>
                        <th className='w-[60px]  '>LOC</th>
                        <th className='w-[64px]  '>QTY</th>
                        <th className='w-[56px]   '>CC</th>
                        <th className='w-[77px]   '>JOB CODE</th>
                        <th className='w-[68px]  '>AQ</th>
                        <th className='w-[240px]  text-left'>DESCRIPTION OF REPAIR</th>
                        <th className='w-[90px] '>WMC</th>
                        <th className='w-[109px] '>LABOUR HRS</th>
                        <th className='w-[100px] '>MATERIALS</th>
                        <th className='w-[89px]  '>STATUS</th>
                        <th className='w-[90px]  '>NET COST</th>
                        <th className='w-[149px]'>REVENUE CATEGORY</th>
                        <th className='w-[113px] '>LESSE Revenue</th>
                    </tr>
                    </thead>
                    <tbody className='text-[14px] font-medium'>
                    {tableData.map((row, i) => (
                        <tr
                            key={row.CODE}
                            onDragStart={(e) => handleDragStart(e, i)}
                            onDrop={(e) => handleDrop(e, i)}
                            onDragOver={handleAllowDrop}
                            draggable
                            className={` my-5 text-[14px] h-[72px] text-[#475467] ${i % 2 === 0 ? "bg-white" : "bg-transparent"}`}
                        >
                            <td className='pl-[18px]    text-center '>{i + 1}</td>
                            <td className=' py-[16px]   text-center '>{row.location_code}</td>
                            <td className=' py-[16px]   text-center '>{row.quantity}</td>
                            <td className=' py-[16px]   text-center '>{row.condition_code}</td>
                            <td className=' py-[16px]   text-center '>{row.job_code_applied}</td>
                            <td className=' py-[16px]   text-center '>--</td>
                            <td className=' py-[16px]    text-left '>{row.job_description}</td>
                            <td className=' py-[16px]   text-center '>{row.why_made_code}</td>
                            <td className=' py-[16px]    text-center '>{row.labor_time} HRS</td>
                            <td className=' py-[16px]   text-center '>$396.84</td>
                            <td className=' py-[16px]    text-center'>{row.material_cost}</td>
                            <td className=' py-[16px]   text-center '>N/A</td>
                            <td className=' py-[16px]    text-center '>Repair-Mechanical</td>
                            <td className="text-center ">
                                <input
                                    type="checkbox"
                                    // onChange={() => handleOrderCheckboxChange(index, "FINALIZED")}
                                    className=" checkbox mx-auto checkbox-primary mt-[6px]  w-[20px] h-[20px]"/>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

            </div>

        </div>
    );
};

export default JoblistForEdit;
