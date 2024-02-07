// Table.js
import React, { useState } from 'react';
import Jobs from '../DataSets/get_jobs.json'
// This component represents a draggable table with the ability to rearrange rows.

const PartsTable = () => {
    // State to manage the table Jobs, which will be rearranged.
    const [ModifyedData, setModifyedData] = useState(Jobs.flatMap((job) => job.jobparts));
    console.log(ModifyedData);

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
        const updatedData = [...ModifyedData];
        // Remove the dragged row from its original position.
        const [draggedRow] = updatedData.splice(sourceIndex, 1);
        // Insert the dragged row at the new position.
        updatedData.splice(rowIndex, 0, draggedRow);
        // Update the state with the rearranged data.
        setModifyedData(updatedData);
    };

    // Function to handle the drag over event and allow dropping.
    const handleAllowDrop = (e) => {
        e.preventDefault();
    };


    return (
        <div className="jobparts mt-[51px]">
            <div className="pt-[-3px]">
                <p className='text-[24px] font-semibold'>Parts List</p>
            </div>
            <div className="overflow-x-auto w-full mt-[33px] ml-[-1px] border mx-auto   rounded-[8px]">
                <table className=" py-[12px]  w-full  bg-transparent   text-[#475467] ">
                    <thead className="uppercase text-[12px] font-medium bg-[#DCE5FF] ">
                        <tr className='h-[44px] '>
                            <th className='text-left pl-[14px] w-[183px]'>CODE</th>
                            <th className='w-[426px] text-left'>TITLE</th>
                            <th className='w-[150px] '>COST</th>
                            <th className='w-[151px] '>PRICE IN INVENTORY</th>
                            <th className='w-[151px]  '>QUANTITY</th>
                            <th className='w-[150px] '>CONDITION</th>
                            <th className='w-[151px] '>AVAILIBILITY</th>
                        </tr>
                    </thead>
                    <tbody className='text-[14px] font-medium'>
                        {/* {tableData.map((data, ModifyedDataind) => data.jobparts.map((row, i) => ( */}
                        {ModifyedData.map((row, i) => (
                            <tr
                                key={row.CODE}
                                onDragStart={(e) => handleDragStart(e, i)}
                                onDrop={(e) => handleDrop(e, i)}
                                onDragOver={handleAllowDrop}
                                draggable
                                className={` my-5 border-b border-[#EAECF0] text-[14px] h-[72px] text-[#475467] ${i % 2 === 0 ? "bg-white" : "bg-transparent"}`}
                            >
                                <td className='pl-[18px]  text-left w-[183px]'>{row.parts.code}</td>
                                <td className=' py-[16px] w-[426px]  whitespace-nowrap'>{row.parts.title.slice(0, 50)}</td>
                                <td className=' py-[16px] w-[150px] text-center '>{row.totalcost}</td>
                                <td className=' py-[16px] w-[151px] text-center '>{row.parts.price}</td>
                                <td className=' py-[16px] w-[151px] text-center '>{row.quantity}</td>
                                <td className=' py-[16px] w-[150px] text-center '>{row.parts.part_condition}</td>
                                <td className=' py-[16px] w-[151px] text-center '>{row.availability}</td>
                            </tr>
                        ))

                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PartsTable;
