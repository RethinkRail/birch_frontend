import React, {useState} from 'react';

import {AiFillCaretDown} from 'react-icons/ai';


import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ActiveOrdersEditModal from './ActiveOrdersEditModal';
import CommentModal from './CommentModal';
import {NavLink} from 'react-router-dom';


// Function to format a date as 'dd/mm/yyyy'
const formatDate = (date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
};
const ActiveOrdersTable = ({ activeOrdersJson }) => {
    // console.log(activeOrdersJson);
    const [itemIndexForModal, setItemIndexForModal] = useState(0)
    const [order, setOrder] = useState(true)


    const [modifyedActiveOrders, setModifyedActiveOrders] = useState(activeOrdersJson)  // it will hold the total modifyed array

    const [commentObject, setCommentObject] = useState([])

    const [sortingBy, setSortingBy] = useState({
        LHR: 0,
        DIF: 0,
        car: 0,
        ARR_DATE: 0,
        LAST_CONTENT: 0,
        STATUS: 0,
        COMMENT: 0,
        MATERIAL_ETA: 0,
        PROJECTED: 0,
        FINALIZED: 0,
        SHIPPED: 0,
    })

    const handleOrderCheckboxChange = (index, type) => {    // the function will update the checkboxes 
        const updatedOrders = [...modifyedActiveOrders];

        // its a conditional randaring, where it will update based on type ( finalizzed or shipped)
        type === "FINALIZED" ? updatedOrders[index].locked_by = !updatedOrders[index].locked_by :
            updatedOrders[index].SHIPPED = !updatedOrders[index].SHIPPED;

        setModifyedActiveOrders(updatedOrders);  // updated modifyed orderList
    };




    // Initialize the selected dates state using the MATERIAL_ETA_1 and MATERIAL_ETA_2  field of each object

    // Function to update the selected date for a specific row
    const handleDateChange = (newDate, index, type) => {



        if (type === "material_eta") {
            const formattedDate = new Date(newDate).toISOString().split('T')[0] + modifyedActiveOrders[index].material_eta.slice(10);
            const updatedOrders = [...modifyedActiveOrders]
            updatedOrders[index]["material_eta"] = formattedDate
            setModifyedActiveOrders(updatedOrders)
        }
        else {
            const formattedDate = new Date(newDate).toISOString().split('T')[0] + modifyedActiveOrders[index].projected_out_date.slice(10);
            const updatedOrders = [...modifyedActiveOrders]
            updatedOrders[index]["projected_out_date"] = formattedDate
            setModifyedActiveOrders(updatedOrders)
        }
    };



    const sorting = (col) => {


        const updatedSortingBy = { ...sortingBy };
        updatedSortingBy[col] = updatedSortingBy[col] === 2 ? 1 : updatedSortingBy[col] + 1;
        for (const key in updatedSortingBy) {
            if (key !== col) updatedSortingBy[key] = 0;
        }
        setSortingBy(updatedSortingBy);
        console.log(updatedSortingBy);


        if (col === "car") {
            setModifyedActiveOrders([...modifyedActiveOrders].sort((a, b) => {
                if (sortingBy.car === 2) {
                    return a.car_id.localeCompare(b.car_id);
                } else {
                    return b.car_id.localeCompare(a.car_id);
                }
            }));
        }
        else if (col === "ARR_DATE") {
            setModifyedActiveOrders([...modifyedActiveOrders].sort((a, b) => {
                if (sortingBy.ARR_DATE === 2) {
                    const timestampA = new Date(a.arrival_date).getTime();
                    const timestampB = new Date(b.arrival_date).getTime();
                    return timestampA - timestampB;
                } else {
                    const timestampA = new Date(a.arrival_date).getTime();
                    const timestampB = new Date(b.arrival_date).getTime();
                    return timestampB - timestampA;
                }
            }));
        }
        else if (col === "LAST_CONTENT") {
            setModifyedActiveOrders([...modifyedActiveOrders].sort((a, b) => {
                if (sortingBy.LAST_CONTENT === 2) {
                    return a.railcar.products.name.localeCompare(b.railcar.products.name);
                } else {
                    return b.railcar.products.name.localeCompare(a.railcar.products.name);
                }
            }));
        }
        else if (col === "COMMENT") {
            setModifyedActiveOrders([...modifyedActiveOrders].sort((a, b) => {
                if (sortingBy.COMMENT === 2) {
                    return a.workupdates[0].update_date.localeCompare(b.workupdates[0].update_date);
                } else {
                    return b.workupdates[0].update_date.localeCompare(a.workupdates[0].update_date);
                }
            }));

        }
        else if (col === "MATERIAL_ETA") {
            setModifyedActiveOrders([...modifyedActiveOrders].sort((a, b) => {
                if (sortingBy.MATERIAL_ETA === 2) {
                    const timestampA = new Date(a.material_eta).getTime();
                    const timestampB = new Date(b.material_eta).getTime();
                    return timestampA - timestampB;
                } else {
                    const timestampA = new Date(a.material_eta).getTime();
                    const timestampB = new Date(b.material_eta).getTime();
                    return timestampB - timestampA;
                }
            }));

        }
        else if (col === "PROJECTED") {

            setModifyedActiveOrders([...modifyedActiveOrders].sort((a, b) => {
                if (sortingBy.PROJECTED === 2) {
                    // console.log("hitted ", a.projected_out_date);
                    const timestampA = new Date(a.projected_out_date.slice(0, 10)).getTime();
                    const timestampB = new Date(b.projected_out_date.slice(0, 10)).getTime();
                    return timestampA - timestampB;
                } else {
                    const timestampA = new Date(a.projected_out_date.slice(0, 10)).getTime();
                    const timestampB = new Date(b.projected_out_date.slice(0, 10)).getTime();
                    return timestampB - timestampA;
                }
            }));
        }
        else if (col === "STATUS") {
            setModifyedActiveOrders([...modifyedActiveOrders].sort((a, b) => {
                if (sortingBy.STATUS === 2) {
                    // console.log("hitted ", a.projected_out_date);
                    const timestampA = new Date(a.workupdates[0].update_date.slice(0, 10)).getTime();
                    const timestampB = new Date(b.workupdates[0].update_date.slice(0, 10)).getTime();
                    return timestampA - timestampB;
                } else {
                    const timestampA = new Date(a.workupdates[0].update_date.slice(0, 10)).getTime();
                    const timestampB = new Date(b.workupdates[0].update_date.slice(0, 10)).getTime();
                    return timestampB - timestampA;
                }
            }));
        }
        else if (col === "FINALIZED") {
            setModifyedActiveOrders([...modifyedActiveOrders].sort((a, b) => {
                if (sortingBy.FINALIZED === 2) {
                    return a.locked_by - b.locked_by;
                } else {
                    return b.locked_by - a.locked_by;
                }
            }));
        }
        else if (col === "SHIPPED") {
            setModifyedActiveOrders([...modifyedActiveOrders].sort((a, b) => {
                if (sortingBy.SHIPPED === 2) {
                    // console.log("hitted ", a.projected_out_date);
                    const timestampA = new Date(a.shipped_date.slice(0, 10)).getTime();
                    const timestampB = new Date(b.shipped_date.slice(0, 10)).getTime();
                    return timestampA - timestampB;
                } else {
                    const timestampA = new Date(a.shipped_date.slice(0, 10)).getTime();
                    const timestampB = new Date(b.shipped_date.slice(0, 10)).getTime();
                    return timestampB - timestampA;
                }
            }));
        }
        // console.log(col);
        setOrder(!order)
    }


    return (
        <div className="overflow-x-auto w-full mx-auto  mt-[-1px] text-[14px] font-medium">
            <div className="flex justify-between items-center mt-[23px]">
                <h2 className="text-[24px]  font-medium">Active Orders</h2>
                <button className='btn text-cetner normal-case  h-[44px] px-[18px] py-[10px] flex items-center justify-center bg-[#002E54] text-white text-[14px] font-medium hover:bg-[#002f54]'>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 4.16663V15.8333M4.16669 9.99996H15.8334" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <span className='mt-[]'>
                        New Order
                    </span>
                </button>

            </div>
            <div className="overflow-x-auto w-full mt-[20px] ml-[-1px] mx-auto border rounded-[8px]">
                <table className="border-y py-[12px]  w-full  bg-white   text-[#686868]">
                    <thead className="uppercase text-[12px] font-medium bg-[#DCE5FF] ">
                        <tr className='h-[44px]'>
                            <th onClick={() => sorting("LHR")} className="h-[44px] p-0  flex justify-between ml-[16px] items-center cursor-pointer">LHR
                                {(sortingBy.LHR === 1) ?
                                    <AiFillCaretDown /> :
                                    sortingBy.LHR === 2 ?
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M10.0152 7.23483L6.26516 3.48483C6.19484 3.41451 6.09946 3.375 6 3.375C5.90055 3.375 5.80517 3.41451 5.73484 3.48483L1.98484 7.23483C1.9324 7.28727 1.89668 7.35409 1.88221 7.42683C1.86774 7.49958 1.87516 7.57498 1.90354 7.6435C1.93193 7.71202 1.97999 7.77059 2.04166 7.81179C2.10333 7.853 2.17583 7.87499 2.25 7.87499H9.75C9.82417 7.87499 9.89667 7.853 9.95834 7.81179C10.02 7.77059 10.0681 7.71202 10.0965 7.6435C10.1248 7.57498 10.1323 7.49958 10.1178 7.42683C10.1033 7.35409 10.0676 7.28727 10.0152 7.23483Z" fill="#464646" />
                                        </svg> : <></>

                                }</th>
                            <th onClick={() => sorting("DIF")} className="h-[44px] p-0  items-center">
                                <div className="flex items-center cursor-pointer justify-between">
                                    DIF
                                    {(sortingBy.DIF === 1) ?
                                        <AiFillCaretDown /> :
                                        sortingBy.DIF === 2 ?
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10.0152 7.23483L6.26516 3.48483C6.19484 3.41451 6.09946 3.375 6 3.375C5.90055 3.375 5.80517 3.41451 5.73484 3.48483L1.98484 7.23483C1.9324 7.28727 1.89668 7.35409 1.88221 7.42683C1.86774 7.49958 1.87516 7.57498 1.90354 7.6435C1.93193 7.71202 1.97999 7.77059 2.04166 7.81179C2.10333 7.853 2.17583 7.87499 2.25 7.87499H9.75C9.82417 7.87499 9.89667 7.853 9.95834 7.81179C10.02 7.77059 10.0681 7.71202 10.0965 7.6435C10.1248 7.57498 10.1323 7.49958 10.1178 7.42683C10.1033 7.35409 10.0676 7.28727 10.0152 7.23483Z" fill="#464646" />
                                            </svg> : <></>

                                    }
                                </div>
                            </th>
                            <th onClick={() => sorting("car")} className="h-[44px]  p-0 flex items-center cursor-pointer justify-between pl-[1px]">

                                CAR
                                {(sortingBy.car === 1) ?
                                    <AiFillCaretDown /> :
                                    sortingBy.car === 2 ?
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M10.0152 7.23483L6.26516 3.48483C6.19484 3.41451 6.09946 3.375 6 3.375C5.90055 3.375 5.80517 3.41451 5.73484 3.48483L1.98484 7.23483C1.9324 7.28727 1.89668 7.35409 1.88221 7.42683C1.86774 7.49958 1.87516 7.57498 1.90354 7.6435C1.93193 7.71202 1.97999 7.77059 2.04166 7.81179C2.10333 7.853 2.17583 7.87499 2.25 7.87499H9.75C9.82417 7.87499 9.89667 7.853 9.95834 7.81179C10.02 7.77059 10.0681 7.71202 10.0965 7.6435C10.1248 7.57498 10.1323 7.49958 10.1178 7.42683C10.1033 7.35409 10.0676 7.28727 10.0152 7.23483Z" fill="#464646" />
                                        </svg> : <></>

                                }
                            </th>
                            <th onClick={() => sorting("ARR_DATE")} className="h-[44px]  w-[81px] ">
                                <div className="flex items-center cursor-pointer justify-between">
                                    ARR. DATE
                                    {(sortingBy.ARR_DATE === 1) ?
                                        <AiFillCaretDown /> :
                                        sortingBy.ARR_DATE === 2 ?
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10.0152 7.23483L6.26516 3.48483C6.19484 3.41451 6.09946 3.375 6 3.375C5.90055 3.375 5.80517 3.41451 5.73484 3.48483L1.98484 7.23483C1.9324 7.28727 1.89668 7.35409 1.88221 7.42683C1.86774 7.49958 1.87516 7.57498 1.90354 7.6435C1.93193 7.71202 1.97999 7.77059 2.04166 7.81179C2.10333 7.853 2.17583 7.87499 2.25 7.87499H9.75C9.82417 7.87499 9.89667 7.853 9.95834 7.81179C10.02 7.77059 10.0681 7.71202 10.0965 7.6435C10.1248 7.57498 10.1323 7.49958 10.1178 7.42683C10.1033 7.35409 10.0676 7.28727 10.0152 7.23483Z" fill="#464646" />
                                            </svg> : <></>

                                    }
                                </div>
                            </th>
                            <th onClick={() => sorting("LAST_CONTENT")} className="h-[44px]   px-[2px] ">
                                <div className="flex items-center cursor-pointer justify-between">
                                    LAST CONTENT
                                    {(sortingBy.LAST_CONTENT === 1) ?
                                        <AiFillCaretDown /> :
                                        sortingBy.LAST_CONTENT === 2 ?
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10.0152 7.23483L6.26516 3.48483C6.19484 3.41451 6.09946 3.375 6 3.375C5.90055 3.375 5.80517 3.41451 5.73484 3.48483L1.98484 7.23483C1.9324 7.28727 1.89668 7.35409 1.88221 7.42683C1.86774 7.49958 1.87516 7.57498 1.90354 7.6435C1.93193 7.71202 1.97999 7.77059 2.04166 7.81179C2.10333 7.853 2.17583 7.87499 2.25 7.87499H9.75C9.82417 7.87499 9.89667 7.853 9.95834 7.81179C10.02 7.77059 10.0681 7.71202 10.0965 7.6435C10.1248 7.57498 10.1323 7.49958 10.1178 7.42683C10.1033 7.35409 10.0676 7.28727 10.0152 7.23483Z" fill="#464646" />
                                            </svg> : <></>

                                    }
                                </div>
                            </th>
                            <th onClick={() => sorting("STATUS")} className="h-[44px] w-[233px] text-center pl-[20px] pr-[10px]">
                                <div className="flex items-center cursor-pointer justify-between">
                                    STATUS

                                    {(sortingBy.STATUS === 1) ?
                                        <AiFillCaretDown /> :
                                        sortingBy.STATUS === 2 ?
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10.0152 7.23483L6.26516 3.48483C6.19484 3.41451 6.09946 3.375 6 3.375C5.90055 3.375 5.80517 3.41451 5.73484 3.48483L1.98484 7.23483C1.9324 7.28727 1.89668 7.35409 1.88221 7.42683C1.86774 7.49958 1.87516 7.57498 1.90354 7.6435C1.93193 7.71202 1.97999 7.77059 2.04166 7.81179C2.10333 7.853 2.17583 7.87499 2.25 7.87499H9.75C9.82417 7.87499 9.89667 7.853 9.95834 7.81179C10.02 7.77059 10.0681 7.71202 10.0965 7.6435C10.1248 7.57498 10.1323 7.49958 10.1178 7.42683C10.1033 7.35409 10.0676 7.28727 10.0152 7.23483Z" fill="#464646" />
                                            </svg> : <></>

                                    }
                                </div>
                            </th>
                            <th onClick={() => sorting("COMMENT")} className="h-[44px]   w-[186px] text-center pl-[20px] pr-[10px]">
                                <div className="flex items-center cursor-pointer justify-between">
                                    COMMENT
                                    {(sortingBy.COMMENT === 1) ?
                                        <AiFillCaretDown /> :
                                        sortingBy.COMMENT === 2 ?
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10.0152 7.23483L6.26516 3.48483C6.19484 3.41451 6.09946 3.375 6 3.375C5.90055 3.375 5.80517 3.41451 5.73484 3.48483L1.98484 7.23483C1.9324 7.28727 1.89668 7.35409 1.88221 7.42683C1.86774 7.49958 1.87516 7.57498 1.90354 7.6435C1.93193 7.71202 1.97999 7.77059 2.04166 7.81179C2.10333 7.853 2.17583 7.87499 2.25 7.87499H9.75C9.82417 7.87499 9.89667 7.853 9.95834 7.81179C10.02 7.77059 10.0681 7.71202 10.0965 7.6435C10.1248 7.57498 10.1323 7.49958 10.1178 7.42683C10.1033 7.35409 10.0676 7.28727 10.0152 7.23483Z" fill="#464646" />
                                            </svg> : <></>

                                    }
                                </div>
                            </th>
                            <th onClick={() => sorting("MATERIAL_ETA")} className="h-[44px]   w-[154px] text-center pl-[20px] pr-[21px]">
                                <div className="flex items-center cursor-pointer justify-between">
                                    MATERIAL ETA
                                    {(sortingBy.MATERIAL_ETA === 1) ?
                                        <AiFillCaretDown /> :
                                        sortingBy.MATERIAL_ETA === 2 ?
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10.0152 7.23483L6.26516 3.48483C6.19484 3.41451 6.09946 3.375 6 3.375C5.90055 3.375 5.80517 3.41451 5.73484 3.48483L1.98484 7.23483C1.9324 7.28727 1.89668 7.35409 1.88221 7.42683C1.86774 7.49958 1.87516 7.57498 1.90354 7.6435C1.93193 7.71202 1.97999 7.77059 2.04166 7.81179C2.10333 7.853 2.17583 7.87499 2.25 7.87499H9.75C9.82417 7.87499 9.89667 7.853 9.95834 7.81179C10.02 7.77059 10.0681 7.71202 10.0965 7.6435C10.1248 7.57498 10.1323 7.49958 10.1178 7.42683C10.1033 7.35409 10.0676 7.28727 10.0152 7.23483Z" fill="#464646" />
                                            </svg> : <></>

                                    }
                                </div>
                            </th>
                            <th onClick={() => sorting("PROJECTED")} className="h-[44px]   w-[156px] whitespace-nowrap" >
                                <div className="flex items-center cursor-pointer justify-between">
                                    projected out date
                                    {(sortingBy.PROJECTED === 1) ?
                                        <AiFillCaretDown /> :
                                        sortingBy.PROJECTED === 2 ?
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10.0152 7.23483L6.26516 3.48483C6.19484 3.41451 6.09946 3.375 6 3.375C5.90055 3.375 5.80517 3.41451 5.73484 3.48483L1.98484 7.23483C1.9324 7.28727 1.89668 7.35409 1.88221 7.42683C1.86774 7.49958 1.87516 7.57498 1.90354 7.6435C1.93193 7.71202 1.97999 7.77059 2.04166 7.81179C2.10333 7.853 2.17583 7.87499 2.25 7.87499H9.75C9.82417 7.87499 9.89667 7.853 9.95834 7.81179C10.02 7.77059 10.0681 7.71202 10.0965 7.6435C10.1248 7.57498 10.1323 7.49958 10.1178 7.42683C10.1033 7.35409 10.0676 7.28727 10.0152 7.23483Z" fill="#464646" />
                                            </svg> : <></>

                                    }
                                </div>
                            </th>
                            <th onClick={() => sorting("FINALIZED")} className="h-[44px]  w-[91px] text-center pl-[3px]">
                                <div className="flex items-center cursor-pointer justify-evenly">
                                    FINALIZED
                                    {(sortingBy.FINALIZED === 1) ?
                                        <AiFillCaretDown /> :
                                        sortingBy.FINALIZED === 2 ?
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10.0152 7.23483L6.26516 3.48483C6.19484 3.41451 6.09946 3.375 6 3.375C5.90055 3.375 5.80517 3.41451 5.73484 3.48483L1.98484 7.23483C1.9324 7.28727 1.89668 7.35409 1.88221 7.42683C1.86774 7.49958 1.87516 7.57498 1.90354 7.6435C1.93193 7.71202 1.97999 7.77059 2.04166 7.81179C2.10333 7.853 2.17583 7.87499 2.25 7.87499H9.75C9.82417 7.87499 9.89667 7.853 9.95834 7.81179C10.02 7.77059 10.0681 7.71202 10.0965 7.6435C10.1248 7.57498 10.1323 7.49958 10.1178 7.42683C10.1033 7.35409 10.0676 7.28727 10.0152 7.23483Z" fill="#464646" />
                                            </svg> : <></>

                                    }
                                </div>
                            </th>
                            <th onClick={() => sorting("SHIPPED")} className="h-[44px]  text-center pl-[18px] "   >
                                <div className="flex items-center cursor-pointer justify-between">
                                    SHIPPED
                                    {(sortingBy.SHIPPED === 1) ?
                                        <AiFillCaretDown /> :
                                        sortingBy.SHIPPED === 2 ?
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10.0152 7.23483L6.26516 3.48483C6.19484 3.41451 6.09946 3.375 6 3.375C5.90055 3.375 5.80517 3.41451 5.73484 3.48483L1.98484 7.23483C1.9324 7.28727 1.89668 7.35409 1.88221 7.42683C1.86774 7.49958 1.87516 7.57498 1.90354 7.6435C1.93193 7.71202 1.97999 7.77059 2.04166 7.81179C2.10333 7.853 2.17583 7.87499 2.25 7.87499H9.75C9.82417 7.87499 9.89667 7.853 9.95834 7.81179C10.02 7.77059 10.0681 7.71202 10.0965 7.6435C10.1248 7.57498 10.1323 7.49958 10.1178 7.42683C10.1033 7.35409 10.0676 7.28727 10.0152 7.23483Z" fill="#464646" />
                                            </svg> : <div className='w-[12px]'></div>

                                    }
                                </div>
                            </th>
                            <th className="h-[44px] w-[72px] text-center pl-[18px] pr-[6px]">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {modifyedActiveOrders.map((Order, index) => (

                            <tr key={index} className={` h-[72px] text-[14px]  font-medium  ${index % 2 === 1 ? 'bg-[#F7F9FF]' : ''}`}>
                                <td className="px-[16px]">{

                                    // calculate the lhr
                                    (() => {
                                        const laborHours = Order.joblist.reduce((acc, item) => acc + item.labor_time * item.quantity, 0);
                                        const durationHours = Order.timesheets.reduce((acc, item) => acc + item.duration / 3600, 0);
                                        // console.log(durationHours / laborHours);
                                        const percentage = durationHours === 0 ? 0 : (durationHours / laborHours) * 100;
                                        return percentage.toFixed() + '%';
                                    })()

                                }</td>
                                <td className="pr-[6px]">{Order.DIF} 232</td>
                                <td className="px-[3px]">{Order.car_id}</td>
                                <td className="flex justify-center items-center pl-[] h-[72px]">{Order.arrival_date.slice(2, 10).split('-').reverse().join('/')}</td>
                                <td className="max-w-[113px] whitespace-nowrap overflow-hidden text-center" >{Order.railcar.products.name.slice(0, 13)} </td>
                                <td className="w-[245px] px-[] flex justify-center ">
                                    <select className=" text-[14px] font-mediumselect bg-transparent pl-[0px]  border-0 max-w-[213px]  focus:border-0 focus:ring-0">
                                        {Array.from(new Set(Order.workupdates.map(wu => wu.status_id + ": " + wu.statuscode.title))).map((status, i) => (
                                            <option key={i}>{status}</option>
                                        ))}
                                    </select>
                                </td>
                                <td
                                    className="cursor-pointer w-[198px] max-w-[198px] overflow-hidden whitespace-nowrap pr-[10px] text-center"
                                    onClick={() => {
                                        document.getElementById('commentModal').showModal()
                                        setCommentObject(Order.workupdates)
                                    }
                                    }
                                >
                                    {Order.workupdates[0].comment}
                                </td>
                                <td className="cursor-pointer w-[152px] pr-[10px] flex justify-center">
                                    <DatePicker
                                        selected={new Date(Order.material_eta.slice(0, 10))}
                                        customInput={<CustomDateInput />}
                                        showYearDropdown
                                        onChange={newDate => handleDateChange(newDate, index, "material_eta")}
                                        dateFormat="dd/MM/yyyy"
                                    />
                                </td>
                                <td className="cursor-pointer pl-[15px]">
                                    <DatePicker
                                        // selected={projected_out_date[index]}
                                        selected={new Date(Order.projected_out_date.slice(0, 10))}
                                        customInput={<CustomDateInput value={Order.projected_out_date.slice(0, 10)} />}
                                        showYearDropdown
                                        onChange={newDate => handleDateChange(newDate, index, "projected_out_date")}
                                        dateFormat="dd/MM/yyyy"
                                    />
                                </td>
                                <td className=" ">
                                    <input
                                        type="checkbox"
                                        // onChange={() => handleOrderCheckboxChange(index, "FINALIZED")}
                                        checked={Order.locked_by > -1}
                                        className=" checkbox checkbox-primary mt-[6px] ml-[29px] w-[20px] h-[20px]" />
                                </td>
                                <td className="">
                                    <input
                                        type="checkbox"
                                        // onChange={() => handleOrderCheckboxChange(index, "SHIPPED")}
                                        checked={Order.shipped_date !== process.env.REACT_APP_DEFAULT_DATE}
                                        className=" checkbox checkbox-primary mt-[6px] ml-[33px] w-[20px] h-[20px]" />
                                </td>
                                <td className="pl-[31px]">
                                    <NavLink to="/d">
                                        <span className=''
                                        // onClick={() => {
                                        //     document.getElementById('my_modal_5').showModal()
                                        //     setItemIndexForModal(index)
                                        // }}
                                        >
                                            {/* svg for eye icon  */}
                                            <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1.42012 8.71318C1.28394 8.49754 1.21584 8.38972 1.17772 8.22342C1.14909 8.0985 1.14909 7.9015 1.17772 7.77658C1.21584 7.61028 1.28394 7.50246 1.42012 7.28682C2.54553 5.50484 5.8954 1 11.0004 1C16.1054 1 19.4553 5.50484 20.5807 7.28682C20.7169 7.50246 20.785 7.61028 20.8231 7.77658C20.8517 7.9015 20.8517 8.0985 20.8231 8.22342C20.785 8.38972 20.7169 8.49754 20.5807 8.71318C19.4553 10.4952 16.1054 15 11.0004 15C5.8954 15 2.54553 10.4952 1.42012 8.71318Z" stroke="#686868" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                <path d="M11.0004 11C12.6573 11 14.0004 9.65685 14.0004 8C14.0004 6.34315 12.6573 5 11.0004 5C9.34355 5 8.0004 6.34315 8.0004 8C8.0004 9.65685 9.34355 11 11.0004 11Z" stroke="#686868" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>
                                        </span>
                                    </NavLink>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ActiveOrdersEditModal index={itemIndexForModal} />
            <CommentModal data={commentObject} />
        </div >
    );
};

const CustomDateInput = ({ value, onClick }) => (
    <div className="w-fit mx-auto">
        <div onClick={onClick} className='flex items-center justify-between  border  rounded-[4px] w-[116px] whitespace-nowrap overflow-hidden h-[32px] '>
            <p className='pl-[4px] py-[6px]'>{value}</p>
            <button className='mr-[5px]'>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.75 7.5H2.25M12 1.5V4.5M6 1.5V4.5M5.85 16.5H12.15C13.4101 16.5 14.0402 16.5 14.5215 16.2548C14.9448 16.039 15.289 15.6948 15.5048 15.2715C15.75 14.7902 15.75 14.1601 15.75 12.9V6.6C15.75 5.33988 15.75 4.70982 15.5048 4.22852C15.289 3.80516 14.9448 3.46095 14.5215 3.24524C14.0402 3 13.4101 3 12.15 3H5.85C4.58988 3 3.95982 3 3.47852 3.24524C3.05516 3.46095 2.71095 3.80516 2.49524 4.22852C2.25 4.70982 2.25 5.33988 2.25 6.6V12.9C2.25 14.1601 2.25 14.7902 2.49524 15.2715C2.71095 15.6948 3.05516 16.039 3.47852 16.2548C3.95982 16.5 4.58988 16.5 5.85 16.5Z" stroke="#686868" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>
        </div>
    </div>
);


export default ActiveOrdersTable;

