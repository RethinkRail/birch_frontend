import React, {useRef} from 'react';
import {convertSqlToFormattedDateTime} from "../utils/DateTimeHelper";
import qs from "qs";
import axios from "axios";
import JoblistTable from "./JoblistTable";
import PartsTable from "./PartsTable";

const OrderDetailsModal = ({ workOrder,commonData}) => {
    const orderDetailsModal = document.getElementById('orderDetailsModal');
    const statusTextArea = useRef(null);

    // console.log(Object.values(groupedItems)[0].status_id)
    // const sorted_grouped_items = Object.values(groupedItems).sort((a,b)=>a.status-b.status)
    // console.log(sorted_grouped_items)
    //console.log(groupedItems[groupedItems.length-1])
    const closeModal =()=>{
        if (orderDetailsModal) {
            statusTextArea.current.value = ''
            orderDetailsModal.close();
        }
    }
    const getValueById = (id) => {
        const element = statusTextArea.current;
        if (element && element.id === id) {
            return element.value;
        }
        return null;
    };
    return (
        <dialog id="orderDetailsModal" className="modal rounded-md">
            <div className="bg-[#F7F9FF]  max-h-[95vh] p-10 mx-2 pb-5 rounded overflow-auto">
                <form method="dialog" className='flex justify-end m-2'>
                    {/* if there is a button in form, it will close the modal */}
                    <button className="">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 1L1 13M1 1L13 13" stroke="#464646" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </form>
                <div className="h-[841px] ">
                    <div className="flex justify-between">
                        <h1 className="text-3xl font-bold">Order Details</h1>

                        {/*  three dot (...) dropdown */}
                        <div className="dropdown dropdown-left">
                            <label tabIndex={0} className=" m-1">
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.9998 17.3334C16.7362 17.3334 17.3332 16.7364 17.3332 16C17.3332 15.2637 16.7362 14.6667 15.9998 14.6667C15.2635 14.6667 14.6665 15.2637 14.6665 16C14.6665 16.7364 15.2635 17.3334 15.9998 17.3334Z" stroke="#686868" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M15.9998 8.00004C16.7362 8.00004 17.3332 7.40309 17.3332 6.66671C17.3332 5.93033 16.7362 5.33337 15.9998 5.33337C15.2635 5.33337 14.6665 5.93033 14.6665 6.66671C14.6665 7.40309 15.2635 8.00004 15.9998 8.00004Z" stroke="#686868" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M15.9998 26.6667C16.7362 26.6667 17.3332 26.0698 17.3332 25.3334C17.3332 24.597 16.7362 24 15.9998 24C15.2635 24 14.6665 24.597 14.6665 25.3334C14.6665 26.0698 15.2635 26.6667 15.9998 26.6667Z" stroke="#686868" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </label>
                            <ul tabIndex={0} className="dropdown-content z-[1] menu  shadow bg-white  w-[160px]">
                                <li className=''>
                                    <div
                                        onClick={() => {   // joblist table modal openning
                                            document.getElementById('editOrderDetailsModal').showModal()
                                            // setSendOrder(Order)
                                            console.log("clicked");
                                        }}
                                    >
                                        <span className='flex h-fit py-[5px]'>
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M14.9998 1.66663L18.3332 4.99996M1.6665 18.3333L2.73017 14.4332C2.79957 14.1787 2.83426 14.0515 2.88753 13.9329C2.93482 13.8275 2.99294 13.7274 3.06093 13.6341C3.13752 13.5289 3.23076 13.4357 3.41726 13.2492L12.0284 4.63803C12.1934 4.47302 12.2759 4.39052 12.3711 4.35961C12.4548 4.33242 12.5449 4.33242 12.6286 4.35961C12.7237 4.39052 12.8062 4.47302 12.9712 4.63803L15.3618 7.02855C15.5268 7.19356 15.6093 7.27607 15.6402 7.3712C15.6674 7.45489 15.6674 7.54503 15.6402 7.62872C15.6093 7.72385 15.5268 7.80636 15.3618 7.97136L6.75059 16.5825C6.5641 16.769 6.47085 16.8623 6.36574 16.9389C6.27241 17.0069 6.17227 17.065 6.06693 17.1123C5.94829 17.1655 5.82107 17.2002 5.56662 17.2696L1.6665 18.3333Z" stroke="#23393D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>

                                            Edit
                                        </span>
                                    </div>

                                </li>
                                <li className='flex h-fit py-[5px]'>
                                    <span>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M14.1665 14.1667L18.3332 10L14.1665 5.83333M5.83317 5.83333L1.6665 10L5.83317 14.1667M11.6665 2.5L8.33317 17.5" stroke="#23393D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                        ARR-500B
                                    </span>
                                </li>
                                <li className='flex h-fit py-[5px]'>
                                    <span>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M11.6668 9.16663H6.66683M8.3335 12.5H6.66683M13.3335 5.83329H6.66683M16.6668 5.66663V14.3333C16.6668 15.7334 16.6668 16.4335 16.3943 16.9683C16.1547 17.4387 15.7722 17.8211 15.3018 18.0608C14.767 18.3333 14.067 18.3333 12.6668 18.3333H7.3335C5.93336 18.3333 5.2333 18.3333 4.69852 18.0608C4.22811 17.8211 3.84566 17.4387 3.60598 16.9683C3.3335 16.4335 3.3335 15.7334 3.3335 14.3333V5.66663C3.3335 4.26649 3.3335 3.56643 3.60598 3.03165C3.84566 2.56124 4.22811 2.17879 4.69852 1.93911C5.2333 1.66663 5.93336 1.66663 7.3335 1.66663H12.6668C14.067 1.66663 14.767 1.66663 15.3018 1.93911C15.7722 2.17879 16.1547 2.56124 16.3943 3.03165C16.6668 3.56643 16.6668 4.26649 16.6668 5.66663Z" stroke="#23393D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                        Invoice
                                    </span>
                                </li>
                                <li className='flex h-fit py-[5px]'>
                                    <span>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M11.6668 9.16663H6.66683M8.3335 12.5H6.66683M13.3335 5.83329H6.66683M16.6668 5.66663V14.3333C16.6668 15.7334 16.6668 16.4335 16.3943 16.9683C16.1547 17.4387 15.7722 17.8211 15.3018 18.0608C14.767 18.3333 14.067 18.3333 12.6668 18.3333H7.3335C5.93336 18.3333 5.2333 18.3333 4.69852 18.0608C4.22811 17.8211 3.84566 17.4387 3.60598 16.9683C3.3335 16.4335 3.3335 15.7334 3.3335 14.3333V5.66663C3.3335 4.26649 3.3335 3.56643 3.60598 3.03165C3.84566 2.56124 4.22811 2.17879 4.69852 1.93911C5.2333 1.66663 5.93336 1.66663 7.3335 1.66663H12.6668C14.067 1.66663 14.767 1.66663 15.3018 1.93911C15.7722 2.17879 16.1547 2.56124 16.3943 3.03165C16.6668 3.56643 16.6668 4.26649 16.6668 5.66663Z" stroke="#23393D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                        BRC
                                    </span>
                                </li>
                                <li className='flex h-fit py-[5px]'>
                                    <span>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M17.5 9.99996L7.5 9.99996M17.5 4.99996L7.5 4.99996M17.5 15L7.5 15M4.16667 9.99996C4.16667 10.4602 3.79357 10.8333 3.33333 10.8333C2.8731 10.8333 2.5 10.4602 2.5 9.99996C2.5 9.53972 2.8731 9.16663 3.33333 9.16663C3.79357 9.16663 4.16667 9.53972 4.16667 9.99996ZM4.16667 4.99996C4.16667 5.4602 3.79357 5.83329 3.33333 5.83329C2.8731 5.83329 2.5 5.4602 2.5 4.99996C2.5 4.53972 2.8731 4.16663 3.33333 4.16663C3.79357 4.16663 4.16667 4.53972 4.16667 4.99996ZM4.16667 15C4.16667 15.4602 3.79357 15.8333 3.33333 15.8333C2.8731 15.8333 2.5 15.4602 2.5 15C2.5 14.5397 2.8731 14.1666 3.33333 14.1666C3.79357 14.1666 4.16667 14.5397 4.16667 15Z" stroke="#23393D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                        Work Order
                                    </span>
                                </li>


                            </ul>
                        </div>
                    </div>
                    <div className="border-t-2 mt-[20px] mb-[24px] w-full"></div>
                    <div className="w-[1360px] bg-white p-[20px]">
                        <h1 className='text-[24px] font-semibold'>Order Information</h1>
                        <div className="mt-[24px] flex flex-wrap">
                            <div className="w-[330px]">
                                <h2 className='text-[16px] font-normal '>#Wo Number</h2>
                                <p className='text-[#979C9E] mt-[10px]'>District A234</p>
                            </div>
                            <div className="w-[330px]">
                                <h2 className='text-[16px] font-normal '>Yard</h2>
                                <p className='text-[#979C9E] mt-[10px]'>XXX</p>
                            </div>
                            <div className="w-[330px]">
                                <h2 className='text-[16px] font-normal '>Details Source</h2>
                                <p className='text-[#979C9E] mt-[10px]'>District A234</p>
                            </div>
                            <div className="w-[330px]">
                                <h2 className='text-[16px] font-normal '>Reasons to come</h2>
                                <p className='text-[#979C9E] mt-[10px]'>District A234</p>
                            </div>
                            <div className="w-[330px] my-[16px]">
                                <h2 className='text-[16px] font-normal '>Projected Out Date</h2>
                                <p className='text-[#979C9E] mt-[10px]'>XXX</p>
                            </div>
                            <div className="w-[330px] my-[16px]">
                                <h2 className='text-[16px] font-normal '>Arrival Date</h2>
                                <p className='text-[#979C9E] mt-[10px]'>XXX</p>
                            </div>
                            <div className="w-[330px] my-[16px]">
                                <h2 className='text-[16px] font-normal '>Status</h2>
                                <p className='text-[#979C9E] mt-[10px]'>XXX</p>
                            </div>
                            <div className="w-[330px] my-[16px]">
                                <h2 className='text-[16px] font-normal '>Clean Date</h2>
                                <p className='text-[#979C9E] mt-[10px]'>District A234</p>
                            </div>

                        </div>
                    </div>
                    <div className="w-[1360px] bg-white p-[20px]  mt-[24px]">
                        <h1 className='text-[24px] font-semibold'>Car Information</h1>
                        <div className="mt-[24px] flex flex-wrap">
                            <div className="w-[330px]">
                                <h2 className='text-[16px] font-normal '>Equipment</h2>
                                <p className='text-[#979C9E] mt-[10px]'>District A234</p>
                            </div>
                            <div className="w-[330px]">
                                <h2 className='text-[16px] font-normal '>Car type</h2>
                                <p className='text-[#979C9E] mt-[10px]'>XXX</p>
                            </div>
                            <div className="w-[330px]">
                                <h2 className='text-[16px] font-normal '>Last Product</h2>
                                <p className='text-[#979C9E] mt-[10px]'>District A234</p>
                            </div>
                            <div className="w-[330px]">
                                <h2 className='text-[16px] font-normal '>El Index</h2>
                                <p className='text-[#979C9E] mt-[10px]'>District A234</p>
                            </div>
                            <div className="w-[330px] my-[16px]">
                                <h2 className='text-[16px] font-normal '>Owner</h2>
                                <p className='text-[#979C9E] mt-[10px]'>XXX</p>
                            </div>
                            <div className="w-[330px] my-[16px]">
                                <h2 className='text-[16px] font-normal '>Lesse</h2>
                                <p className='text-[#979C9E] mt-[10px]'>XXX</p>
                            </div>

                        </div>
                    </div>
                    <div className="w-[1360px] bg-white p-[14px] flex mt-[24px] border rounded">
                        <div className="w-[327px]">
                            <h2 className='text-[16px] font-normal '>TOTAL HOURS</h2>
                            <p className='text-[#979C9E] mt-[10px]'>110 hrs</p>
                        </div>
                        <div className="w-[327px]">
                            <h2 className='text-[16px] font-normal '>TOTAL LABOUR</h2>
                            <p className='text-[#979C9E] mt-[10px]'>$ 9,829,874</p>
                        </div>
                        <div className="w-[327px]">
                            <h2 className='text-[16px] font-normal '>TOTAL MATERIALS</h2>
                            <p className='text-[#979C9E] mt-[10px]'>$ 9,829,874</p>
                        </div>
                        <div className="w-[327px]">
                            <h2 className='text-[16px] font-normal '>TOTAL NET</h2>
                            <p className='text-[#979C9E] mt-[10px]'>$ 9,829,874</p>
                        </div>
                    </div>

                </div>
                <JoblistTable />
                <PartsTable />
                <div className="mt-[10px] p-[20px] border rounded-md ">
                    <h1 className="text-[24px] font-bold">Order updated</h1>
                    <div className="flex">
                        <span className='w-[204px] px-[24px] py-[16px] border-b-4 border-[#002E54]'>
                            <h4 className='text-[20px] font-bold'>Inbounded</h4>
                            <p className='text-[#475467]'>Aug 20</p>
                        </span>
                        <span className='w-[204px] px-[24px] py-[16px] border-b-2'>
                            <h4 className='text-[20px] font-bold'>Inspected</h4>
                            <p className='text-[#475467]'>Aug 20</p>
                        </span>
                        <span className='w-[204px] px-[24px] py-[16px] border-b-2'>
                            <h4 className='text-[20px] font-bold'>Estimated</h4>
                            <p className='text-[#475467]'>Aug 20</p>
                        </span>
                        <span className='w-[204px] px-[24px] py-[16px] border-b-2'>
                            <h4 className='text-[20px] font-bold'>Approved</h4>
                            <p className='text-[#475467]'>Aug 20</p>
                        </span>
                        <span className='w-[204px] px-[24px] py-[16px] border-b-2'>
                            <h4 className='text-[20px] font-bold'>Clean</h4>
                            <p className='text-[#475467]'>Aug 20</p>
                        </span>
                        <span className='w-[204px] px-[24px] py-[16px] border-b-2'>
                            <h4 className='text-[20px] font-bold'>Blast</h4>
                            <p className='text-[#475467]'>Aug 20</p>
                        </span>
                        <div className="w-[96px] py-[16px] flex border-b-2 justify-center items-center">
                            <div className="w-[48px] h-[48px]  rounded-full bg-[#002E54] flex justify-center items-center">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 18L15 12L9 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </dialog>
    );
};

export default OrderDetailsModal;