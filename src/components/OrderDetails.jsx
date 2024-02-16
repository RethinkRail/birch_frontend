import React, {useRef, useState} from 'react';
import JoblistTable from "./JoblistTable";
import PartsTable from "./PartsTable";
import {convertSqlToFormattedDate} from "../utils/DateTimeHelper";
import Modal from "react-modal";
import qs from "qs";
import axios from "axios";
import {showToastMessage} from "../utils/CommonHelper";
import {toast} from "react-toastify";
import DatePicker from "react-datepicker";
import CustomDateInput from "./CustomDateInput";

const OrderDetails = ({ workOrder,statusCode,updateWorkUpdates,updateArrivalDate,updateInspectedDate,
                          updateCleanDate,updateRepairScheduleDate,updatePaintDate,updateRepairDate,
                          updateFinalDate,updateQADate,updatePOD,updateMTI,updateMarkAsShipped
                    }) => {
    console.log(workOrder)
    const [isStatusDropDownModalOpenInDetails, setIsStatusDropDownModalOpenInDetails] = useState(false);
    const statusCommentDropDownInDetails = useRef(null);
    const [railcarToChangeStaus,setRailCarToChangeStatus]= useState("")
    const [updatedStatusCode,setupdatedStatusCode]= useState("")

    const handleDropdownChangeInDetails = (e,workId) =>{
        setupdatedStatusCode(e.target.value)
        setIsStatusDropDownModalOpenInDetails(true)
    }

    const orderDetailsModal = document.getElementById('orderDetailsModal');
    //const statusTextArea = useRef(null);
    const customStylesForCommentModal = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            width:'400px',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
        },
    };
    const closeModal =()=>{
        console.log("close modal")
        if (orderDetailsModal) {
            orderDetailsModal.close();
        }else {
            console.log("Modal is not closing")
        }
    }
    const handleArrivalDate = (newDate) => {
        updateArrivalDate(workOrder.id,newDate)
        newDate==null?workOrder.arrival_date=process.env.REACT_APP_DEFAULT_DATE:workOrder.arrival_date= new Date(newDate)
    }

    const handleInspectionDate = (newDate) => {
        updateInspectedDate(workOrder.id,newDate)
        newDate==null?workOrder.inspected_date=process.env.REACT_APP_DEFAULT_DATE:workOrder.inspected_date= new Date(newDate)
    }

    const handleCleanDate = (newDate) =>{
        updateCleanDate(workOrder.id,newDate)
        newDate==null?workOrder.clean_date=process.env.REACT_APP_DEFAULT_DATE:workOrder.clean_date= new Date(newDate)
    }
    const handleRepairScheduleDate= (newDate)=>{
        updateRepairScheduleDate(workOrder.id,newDate)
        newDate==null?workOrder.repair_schedule_date=process.env.REACT_APP_DEFAULT_DATE:workOrder.repair_schedule_date= new Date(newDate)
    }
    const handlePaintDate = (newDate) =>{
        updatePaintDate(workOrder.id,newDate)
        newDate==null?workOrder.paint_date=process.env.REACT_APP_DEFAULT_DATE:workOrder.paint_date= new Date(newDate)
    }

    const handleRepairDate = (newDate) =>{
        updateRepairDate(workOrder.id,newDate)
        newDate==null?workOrder.repair_date=process.env.REACT_APP_DEFAULT_DATE:workOrder.repair_date= new Date(newDate)
    }
    const handleFinalDate = (newDate) =>{
        updateFinalDate(workOrder.id,newDate)
        newDate==null?workOrder.final_date=process.env.REACT_APP_DEFAULT_DATE:workOrder.final_date= new Date(newDate)
    }

    const handleQADate = (newDate) =>{
        updateQADate(workOrder.id,newDate)
        newDate==null?workOrder.qa_date=process.env.REACT_APP_DEFAULT_DATE:workOrder.qa_date= new Date(newDate)
    }

    const handlePOD = (newDate) =>{
        updatePOD(workOrder.id,newDate)
        newDate==null?workOrder.projected_out_date=process.env.REACT_APP_DEFAULT_DATE:workOrder.projected_out_date= new Date(newDate)
    }

    const handleMTI = (newDate) =>{
        updateMTI(workOrder.id,newDate)
        newDate==null?workOrder.month_to_invoice=process.env.REACT_APP_DEFAULT_DATE:workOrder.month_to_invoice= new Date(newDate)
    }
    //handleShipped
    const handleShipped = (newDate) =>{
        updateMarkAsShipped(workOrder.id,newDate)
        newDate==null?workOrder.shipped_date=process.env.REACT_APP_DEFAULT_DATE:workOrder.shipped_date= new Date(newDate)
    }

    const getValueById = (id) => {
        const element = statusCommentDropDownInDetails.current;
        if (element && element.id === id) {
            return element.value;
        }
        return null;
    };

    const postStatusFromDetails = () =>{
        var comment = getValueById("statusUpdateMessageFromDropDownInDetails");
        if(comment == null || comment.length === 0){
            return
        }
        let data = qs.stringify({
            'work_id': workOrder.id,
            'user_id': JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id'],
            'status_id': updatedStatusCode.split(":")[0],
            'comment': comment
        });
        console.log(data)
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.REACT_APP_BIRCH_API_URL+'post_work_updates',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data
        };

        axios.request(config)
            .then((response) => {
                console.log(response)
                updateWorkUpdates(workOrder.id,response.data,updatedStatusCode.split(":")[1])
                setIsStatusDropDownModalOpenInDetails(false);
                setupdatedStatusCode("")
            })
            .catch((error) => {
                console.log(error);
                setIsStatusDropDownModalOpenInDetails(false);
                setupdatedStatusCode("")
                toast.error("Something went wrong")
            });
    }
    console.log(workOrder)
    return (
        <div>
            <dialog id="orderDetailsModal" className="modal rounded-md h-full ">
                <div className="w-full bg-white h-full">
                    <div className="bg-white max-h-full  max-h-[100vh] w-full pb-5 rounded-md overflow-auto">
                        <div className="w-full fixed fixed h-[60px]  bg-[#DCE5FF] px-6 py-[18px] text-lg font-semibold  ">
                            <span className="float-left">{workOrder.railcar_id!=null?workOrder.railcar_id:""}</span>
                            <form method="dialog">
                                <div className="float-right mr-5">
                                    <button className="" onClick={closeModal}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M18 6L6 18M6 6L18 18" stroke="#464646" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            </form>

                        </div>
                    </div>
                    <div className="bg-[#F7F9FF] w-full py-10 px-24 max-h-[100vh]  rounded overflow-auto">
                        <div className="absolute top-1/3 right-4 ">
                            <ul tabIndex={0} className="dropdown-content z-[1] menu  shadow bg-white p-0">
                                <li className='flex h-fit text-[10px] p-0'>
                                    <span className="p-1">
                                        <svg width="10" height="10" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M11.6668 9.16663H6.66683M8.3335 12.5H6.66683M13.3335 5.83329H6.66683M16.6668 5.66663V14.3333C16.6668 15.7334 16.6668 16.4335 16.3943 16.9683C16.1547 17.4387 15.7722 17.8211 15.3018 18.0608C14.767 18.3333 14.067 18.3333 12.6668 18.3333H7.3335C5.93336 18.3333 5.2333 18.3333 4.69852 18.0608C4.22811 17.8211 3.84566 17.4387 3.60598 16.9683C3.3335 16.4335 3.3335 15.7334 3.3335 14.3333V5.66663C3.3335 4.26649 3.3335 3.56643 3.60598 3.03165C3.84566 2.56124 4.22811 2.17879 4.69852 1.93911C5.2333 1.66663 5.93336 1.66663 7.3335 1.66663H12.6668C14.067 1.66663 14.767 1.66663 15.3018 1.93911C15.7722 2.17879 16.1547 2.56124 16.3943 3.03165C16.6668 3.56643 16.6668 4.26649 16.6668 5.66663Z" stroke="#23393D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                        BRC
                                    </span>
                                </li>
                                <li className='flex h-fit text-[10px] p-0' >
                                    <span className="p-1">
                                        <svg width="10" height="10" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M14.1665 14.1667L18.3332 10L14.1665 5.83333M5.83317 5.83333L1.6665 10L5.83317 14.1667M11.6665 2.5L8.33317 17.5" stroke="#23393D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                        ARR-500B
                                    </span>
                                </li>
                                <li className='flex h-fit text-[10px] p-0'>
                                    <span className="p-1">
                                        <svg width="10" height="10" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M11.6668 9.16663H6.66683M8.3335 12.5H6.66683M13.3335 5.83329H6.66683M16.6668 5.66663V14.3333C16.6668 15.7334 16.6668 16.4335 16.3943 16.9683C16.1547 17.4387 15.7722 17.8211 15.3018 18.0608C14.767 18.3333 14.067 18.3333 12.6668 18.3333H7.3335C5.93336 18.3333 5.2333 18.3333 4.69852 18.0608C4.22811 17.8211 3.84566 17.4387 3.60598 16.9683C3.3335 16.4335 3.3335 15.7334 3.3335 14.3333V5.66663C3.3335 4.26649 3.3335 3.56643 3.60598 3.03165C3.84566 2.56124 4.22811 2.17879 4.69852 1.93911C5.2333 1.66663 5.93336 1.66663 7.3335 1.66663H12.6668C14.067 1.66663 14.767 1.66663 15.3018 1.93911C15.7722 2.17879 16.1547 2.56124 16.3943 3.03165C16.6668 3.56643 16.6668 4.26649 16.6668 5.66663Z" stroke="#23393D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                        Invoice
                                    </span>
                                </li>
                                <li className='flex h-fit text-[10px] p-0'>
                                    <span className="p-1">
                                        <svg width="10" height="10" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M11.6668 9.16663H6.66683M8.3335 12.5H6.66683M13.3335 5.83329H6.66683M16.6668 5.66663V14.3333C16.6668 15.7334 16.6668 16.4335 16.3943 16.9683C16.1547 17.4387 15.7722 17.8211 15.3018 18.0608C14.767 18.3333 14.067 18.3333 12.6668 18.3333H7.3335C5.93336 18.3333 5.2333 18.3333 4.69852 18.0608C4.22811 17.8211 3.84566 17.4387 3.60598 16.9683C3.3335 16.4335 3.3335 15.7334 3.3335 14.3333V5.66663C3.3335 4.26649 3.3335 3.56643 3.60598 3.03165C3.84566 2.56124 4.22811 2.17879 4.69852 1.93911C5.2333 1.66663 5.93336 1.66663 7.3335 1.66663H12.6668C14.067 1.66663 14.767 1.66663 15.3018 1.93911C15.7722 2.17879 16.1547 2.56124 16.3943 3.03165C16.6668 3.56643 16.6668 4.26649 16.6668 5.66663Z" stroke="#23393D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                        BRC
                                    </span>
                                </li>
                                <li className='flex h-fit text-[10px] p-0'>
                                <span className="p-1">
                                    <svg width="10" height="10" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.5 9.99996L7.5 9.99996M17.5 4.99996L7.5 4.99996M17.5 15L7.5 15M4.16667 9.99996C4.16667 10.4602 3.79357 10.8333 3.33333 10.8333C2.8731 10.8333 2.5 10.4602 2.5 9.99996C2.5 9.53972 2.8731 9.16663 3.33333 9.16663C3.79357 9.16663 4.16667 9.53972 4.16667 9.99996ZM4.16667 4.99996C4.16667 5.4602 3.79357 5.83329 3.33333 5.83329C2.8731 5.83329 2.5 5.4602 2.5 4.99996C2.5 4.53972 2.8731 4.16663 3.33333 4.16663C3.79357 4.16663 4.16667 4.53972 4.16667 4.99996ZM4.16667 15C4.16667 15.4602 3.79357 15.8333 3.33333 15.8333C2.8731 15.8333 2.5 15.4602 2.5 15C2.5 14.5397 2.8731 14.1666 3.33333 14.1666C3.79357 14.1666 4.16667 14.5397 4.16667 15Z" stroke="#23393D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    Work Order
                                </span>
                                </li>


                            </ul>
                        </div>
                        <div className=" w-full">
                            <div className="w-full bg-white p-2">
                                <h6 className='font-normal'>Order Information</h6>
                                <div className="mt-[8px]  grid grid-cols-2 ">
                                    <div>
                                        <div className="mt-[8px]  grid grid-cols-5 gap-0.5">
                                            <div className="p-2">
                                                <p className='text-xs font-normal'>#Wo Number</p>
                                                <p className='text-[#979C9E] text-xs font-normal'>{workOrder.work_order}</p>
                                            </div>
                                            <div className="p-2">
                                                <p className='text-xs font-normal'>Yard</p>
                                                <p className='text-[#979C9E] text-xs font-normal'>{workOrder.yard.name?workOrder.yard.name:""}</p>
                                            </div>
                                            <div className="p-2">
                                                <p className='text-xs font-normal'>SPLC</p>
                                                <p className='text-[#979C9E] text-xs font-normal'>{workOrder.yard.name?workOrder.yard.splc:""}</p>
                                            </div>
                                            <div className="p-2">
                                                <p className='text-xs font-normal'>Details Source</p>
                                                <p className='text-[#979C9E] text-xs font-normal'>{workOrder.yard.detail_source?workOrder.yard.detail_source:""}</p>
                                            </div>
                                            <div className="p-2">
                                                <p className='text-xs font-normal'>Facility Type</p>
                                                <p className='text-[#979C9E] text-xs font-normal'>{workOrder.yard.facility_type?workOrder.yard.facility_type:""}</p>
                                            </div>
                                        </div>
                                        <div className="mt-[8px]  grid grid-cols-5 gap-0.5">
                                            <div className="p-1">
                                                <p className='text-xs font-normal'>Arrival Date</p>
                                                <span>
                                              <DatePicker
                                                  customInput={<CustomDateInput value={workOrder.arrival_date !==process.env.REACT_APP_DEFAULT_DATE?workOrder.arrival_date:null } />}
                                                  selected={workOrder.arrival_date !==process.env.REACT_APP_DEFAULT_DATE?new Date(workOrder.arrival_date):null}
                                                  onChange = {
                                                      newDate =>handleArrivalDate(newDate)
                                                  }
                                                  showYearDropdown
                                                  dateFormat="MM-dd-yyyy"
                                              />
                                        </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal '>Inspection Date</p>
                                                <span>
                                              <DatePicker
                                                  customInput={<CustomDateInput value={workOrder.inspected_date !==process.env.REACT_APP_DEFAULT_DATE?workOrder.inspected_date:null } />}
                                                  selected={workOrder.inspected_date !==process.env.REACT_APP_DEFAULT_DATE?new Date(workOrder.inspected_date):null}
                                                  onChange = {
                                                      newDate =>handleInspectionDate(newDate)
                                                  }
                                                  showYearDropdown
                                                  dateFormat="MM-dd-yyyy"
                                              />
                                        </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal '>Clean Date</p>
                                                <span>
                                              <DatePicker
                                                  customInput={<CustomDateInput value={workOrder.clean_date !==process.env.REACT_APP_DEFAULT_DATE?workOrder.clean_date:null } />}
                                                  selected={workOrder.clean_date !==process.env.REACT_APP_DEFAULT_DATE?new Date(workOrder.clean_date):null}
                                                  onChange = {
                                                      newDate =>handleCleanDate(newDate)
                                                  }
                                                  showYearDropdown
                                                  dateFormat="MM-dd-yyyy"
                                              />
                                        </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal '>Repair Scheduled</p>
                                                <span >
                                              <DatePicker
                                                  customInput={<CustomDateInput value={workOrder.repair_schedule_date !==process.env.REACT_APP_DEFAULT_DATE?workOrder.repair_schedule_date:null } />}
                                                  selected={workOrder.repair_schedule_date !==process.env.REACT_APP_DEFAULT_DATE?new Date(workOrder.repair_schedule_date):null}
                                                  onChange = {
                                                      newDate =>handleRepairScheduleDate(newDate)
                                                  }
                                                  showYearDropdown
                                                  dateFormat="MM-dd-yyyy"
                                              />
                                        </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal'>Paint Date</p>
                                                <span >
                                              <DatePicker
                                                  customInput={<CustomDateInput value={workOrder.paint_date !==process.env.REACT_APP_DEFAULT_DATE?workOrder.paint_date:null } />}
                                                  selected={workOrder.paint_date !==process.env.REACT_APP_DEFAULT_DATE?new Date(workOrder.paint_date):null}
                                                  onChange = {
                                                      newDate =>handlePaintDate(newDate)
                                                  }
                                                  showYearDropdown
                                                  dateFormat="MM-dd-yyyy"
                                              />
                                        </span>
                                            </div>
                                        </div>
                                        <div className="mt-[8px]  grid grid-cols-5 gap-0.5">
                                            <div className="p-1 ">
                                                <p className='text-xs font-normal'>Repair Date</p>
                                                <span >
                                              <DatePicker
                                                  customInput={<CustomDateInput value={workOrder.repair_date !==process.env.REACT_APP_DEFAULT_DATE?workOrder.repair_date:null } />}
                                                  selected={workOrder.repair_date !==process.env.REACT_APP_DEFAULT_DATE?new Date(workOrder.repair_date):null}
                                                  onChange = {
                                                      newDate =>handleRepairDate(newDate)
                                                  }
                                                  showYearDropdown
                                                  dateFormat="MM-dd-yyyy"
                                              />
                                        </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal '>Final Date</p>
                                                <span >
                                              <DatePicker
                                                  customInput={<CustomDateInput value={workOrder.final_date !==process.env.REACT_APP_DEFAULT_DATE?workOrder.final_date:null } />}
                                                  selected={workOrder.final_date !==process.env.REACT_APP_DEFAULT_DATE?new Date(workOrder.final_date):null}
                                                  onChange = {
                                                      newDate =>handleFinalDate(newDate)
                                                  }
                                                  showYearDropdown
                                                  dateFormat="MM-dd-yyyy"
                                              />
                                        </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal'>QA Date</p>
                                                <span >
                                              <DatePicker
                                                  customInput={<CustomDateInput value={workOrder.qa_date !==process.env.REACT_APP_DEFAULT_DATE?workOrder.qa_date:null } />}
                                                  selected={workOrder.qa_date !==process.env.REACT_APP_DEFAULT_DATE?new Date(workOrder.qa_date):null}
                                                  onChange = {
                                                      newDate =>handleQADate(newDate)
                                                  }
                                                  showYearDropdown
                                                  dateFormat="MM-dd-yyyy"
                                              />
                                        </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal '>POD</p>
                                                <span >
                                              <DatePicker
                                                  customInput={<CustomDateInput value={workOrder.projected_out_date !==process.env.REACT_APP_DEFAULT_DATE?workOrder.projected_out_date:null } />}
                                                  selected={workOrder.projected_out_date !==process.env.REACT_APP_DEFAULT_DATE?new Date(workOrder.projected_out_date):null}
                                                  onChange = {
                                                      newDate =>handlePOD(newDate)
                                                  }
                                                  showYearDropdown
                                                  dateFormat="MM-dd-yyyy"
                                              />
                                        </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal '>MTI</p>
                                                <span >
                                              <DatePicker
                                                  customInput={<CustomDateInput value={workOrder.month_to_invoice !==process.env.REACT_APP_DEFAULT_DATE?workOrder.month_to_invoice:null } />}
                                                  selected={workOrder.month_to_invoice !==process.env.REACT_APP_DEFAULT_DATE?new Date(workOrder.month_to_invoice):null}
                                                  onChange = {
                                                      newDate =>handleMTI(newDate)
                                                  }
                                                  showYearDropdown
                                                  dateFormat="MM-dd-yyyy"
                                              />
                                        </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='grid grid-cols-2 '>

                                        <div className="mt-[8px]">
                                            <div className='p-1'>
                                                <p className='text-xs font-normal'>Status</p>
                                                <span>
                                                <select onChange={(e) => handleDropdownChangeInDetails(e,workOrder.id)} disabled={workOrder.locked_by>0} className={`w-full placeholder-opacity-90 mr-4 py-2 ${workOrder.index % 2 === 0 ? '' : 'bg-[#F7F9FF]'}`}>
                                                    {statusCode.map((sc) => (
                                                        <option className={'w-29'} key={sc.code} selected={workOrder.workupdates[0].status_id === sc.code}>
                                                            {sc.code + ":" + sc.title}
                                                        </option>
                                                    ))}
                                                </select>
                                            </span>
                                            </div>
                                            <div className='mt-[8px]'>
                                                <div className='p-1'>
                                                <p className='text-xs font-normal'>Reasons to come</p>
                                                <textarea rows="2" className='text-[#979C9E] w-full p-2 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 my-4'>{workOrder.reason_to_come}</textarea>
                                                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">UPDATE</button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-[8px]">
                                            <div className='p-1'>
                                                <p className='text-xs font-normal'>Routing Status</p>
                                                <span>
                                                <select onChange={(e) => handleDropdownChangeInDetails(e,workOrder.id)} disabled={workOrder.locked_by>0} className={`w-32 placeholder-opacity-90 mr-4 ${workOrder.index % 2 === 0 ? '' : 'bg-[#F7F9FF]'}`}>
                                                    {statusCode.map((sc) => (
                                                        <option className={'w-29'} key={sc.code} selected={workOrder.workupdates[0].status_id === sc.code}>
                                                            {sc.code + ":" + sc.title}
                                                        </option>
                                                    ))}
                                                </select>
                                                </span>
                                            </div>
                                            <div className='mt-[8px]'>
                                                <div className='p-1'>
                                                    <p className='text-xs font-normal'>Reasons to come</p>
                                                    <textarea rows="2" className='text-[#979C9E] w-full p-2 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 my-4'>{workOrder.reason_to_come}</textarea>
                                                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">UPDATE</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/*<div className="mt-[8px]  grid grid-cols-10 gap-1 p-2">*/}
                                {/*    <div className="p-1">*/}
                                {/*        <p className='text-xs font-normal h-3/5'>Arrival Date</p>*/}
                                {/*        <span>*/}
                                {/*              <DatePicker*/}
                                {/*                  customInput={<CustomDateInput value={workOrder.arrival_date !==process.env.REACT_APP_DEFAULT_DATE?workOrder.arrival_date:null } />}*/}
                                {/*                  selected={workOrder.arrival_date !==process.env.REACT_APP_DEFAULT_DATE?new Date(workOrder.arrival_date):null}*/}
                                {/*                  onChange = {*/}
                                {/*                    newDate =>handleArrivalDate(newDate)*/}
                                {/*                    }*/}
                                {/*                  showYearDropdown*/}
                                {/*                  dateFormat="MM-dd-yyyy"*/}
                                {/*              />*/}
                                {/*        </span>*/}
                                {/*    </div>*/}
                                {/*    <div className="p-1">*/}
                                {/*        <p className='text-xs font-normal h-3/5'>Inspection Date</p>*/}
                                {/*        <span>*/}
                                {/*              <DatePicker*/}
                                {/*                  customInput={<CustomDateInput value={workOrder.inspected_date !==process.env.REACT_APP_DEFAULT_DATE?workOrder.inspected_date:null } />}*/}
                                {/*                  selected={workOrder.inspected_date !==process.env.REACT_APP_DEFAULT_DATE?new Date(workOrder.inspected_date):null}*/}
                                {/*                  onChange = {*/}
                                {/*                      newDate =>handleInspectionDate(newDate)*/}
                                {/*                  }*/}
                                {/*                  showYearDropdown*/}
                                {/*                  dateFormat="MM-dd-yyyy"*/}
                                {/*              />*/}
                                {/*        </span>*/}
                                {/*    </div>*/}
                                {/*    <div className="p-1">*/}
                                {/*        <p className='text-xs font-normal h-3/5'>Clean Date</p>*/}
                                {/*        <span>*/}
                                {/*              <DatePicker*/}
                                {/*                  customInput={<CustomDateInput value={workOrder.clean_date !==process.env.REACT_APP_DEFAULT_DATE?workOrder.clean_date:null } />}*/}
                                {/*                  selected={workOrder.clean_date !==process.env.REACT_APP_DEFAULT_DATE?new Date(workOrder.clean_date):null}*/}
                                {/*                  onChange = {*/}
                                {/*                      newDate =>handleCleanDate(newDate)*/}
                                {/*                  }*/}
                                {/*                  showYearDropdown*/}
                                {/*                  dateFormat="MM-dd-yyyy"*/}
                                {/*              />*/}
                                {/*        </span>*/}
                                {/*    </div>*/}
                                {/*    <div className="p-1">*/}
                                {/*        <p className='text-xs font-normal h-3/5'>Repair Scheduled</p>*/}
                                {/*        <span >*/}
                                {/*              <DatePicker*/}
                                {/*                  customInput={<CustomDateInput value={workOrder.repair_schedule_date !==process.env.REACT_APP_DEFAULT_DATE?workOrder.repair_schedule_date:null } />}*/}
                                {/*                  selected={workOrder.repair_schedule_date !==process.env.REACT_APP_DEFAULT_DATE?new Date(workOrder.repair_schedule_date):null}*/}
                                {/*                  onChange = {*/}
                                {/*                      newDate =>handleRepairScheduleDate(newDate)*/}
                                {/*                  }*/}
                                {/*                  showYearDropdown*/}
                                {/*                  dateFormat="MM-dd-yyyy"*/}
                                {/*              />*/}
                                {/*        </span>*/}
                                {/*    </div>*/}
                                {/*    <div className="p-1">*/}
                                {/*        <p className='text-xs font-normal h-3/5'>Paint Date</p>*/}
                                {/*        <span >*/}
                                {/*              <DatePicker*/}
                                {/*                  customInput={<CustomDateInput value={workOrder.paint_date !==process.env.REACT_APP_DEFAULT_DATE?workOrder.paint_date:null } />}*/}
                                {/*                  selected={workOrder.paint_date !==process.env.REACT_APP_DEFAULT_DATE?new Date(workOrder.paint_date):null}*/}
                                {/*                  onChange = {*/}
                                {/*                      newDate =>handlePaintDate(newDate)*/}
                                {/*                  }*/}
                                {/*                  showYearDropdown*/}
                                {/*                  dateFormat="MM-dd-yyyy"*/}
                                {/*              />*/}
                                {/*        </span>*/}
                                {/*    </div>*/}
                                {/*    <div className="p-1 ">*/}
                                {/*        <p className='text-xs font-normal h-3/5'>Repair Date</p>*/}
                                {/*        <span >*/}
                                {/*              <DatePicker*/}
                                {/*                  customInput={<CustomDateInput value={workOrder.repair_date !==process.env.REACT_APP_DEFAULT_DATE?workOrder.repair_date:null } />}*/}
                                {/*                  selected={workOrder.repair_date !==process.env.REACT_APP_DEFAULT_DATE?new Date(workOrder.repair_date):null}*/}
                                {/*                  onChange = {*/}
                                {/*                      newDate =>handleRepairDate(newDate)*/}
                                {/*                  }*/}
                                {/*                  showYearDropdown*/}
                                {/*                  dateFormat="MM-dd-yyyy"*/}
                                {/*              />*/}
                                {/*        </span>*/}
                                {/*    </div>*/}
                                {/*    <div className="p-1">*/}
                                {/*        <p className='text-xs font-normal h-3/5'>Final Date</p>*/}
                                {/*        <span >*/}
                                {/*              <DatePicker*/}
                                {/*                  customInput={<CustomDateInput value={workOrder.final_date !==process.env.REACT_APP_DEFAULT_DATE?workOrder.final_date:null } />}*/}
                                {/*                  selected={workOrder.final_date !==process.env.REACT_APP_DEFAULT_DATE?new Date(workOrder.final_date):null}*/}
                                {/*                  onChange = {*/}
                                {/*                      newDate =>handleFinalDate(newDate)*/}
                                {/*                  }*/}
                                {/*                  showYearDropdown*/}
                                {/*                  dateFormat="MM-dd-yyyy"*/}
                                {/*              />*/}
                                {/*        </span>*/}
                                {/*    </div>*/}
                                {/*    <div className="p-1">*/}
                                {/*        <p className='text-xs font-normal h-3/5'>QA Date</p>*/}
                                {/*        <span >*/}
                                {/*              <DatePicker*/}
                                {/*                  customInput={<CustomDateInput value={workOrder.qa_date !==process.env.REACT_APP_DEFAULT_DATE?workOrder.qa_date:null } />}*/}
                                {/*                  selected={workOrder.qa_date !==process.env.REACT_APP_DEFAULT_DATE?new Date(workOrder.qa_date):null}*/}
                                {/*                  onChange = {*/}
                                {/*                      newDate =>handleQADate(newDate)*/}
                                {/*                  }*/}
                                {/*                  showYearDropdown*/}
                                {/*                  dateFormat="MM-dd-yyyy"*/}
                                {/*              />*/}
                                {/*        </span>*/}
                                {/*    </div>*/}
                                {/*    <div className="p-1">*/}
                                {/*        <p className='text-xs font-normal h-3/5'>POD</p>*/}
                                {/*        <span >*/}
                                {/*              <DatePicker*/}
                                {/*                  customInput={<CustomDateInput value={workOrder.projected_out_date !==process.env.REACT_APP_DEFAULT_DATE?workOrder.projected_out_date:null } />}*/}
                                {/*                  selected={workOrder.projected_out_date !==process.env.REACT_APP_DEFAULT_DATE?new Date(workOrder.projected_out_date):null}*/}
                                {/*                  onChange = {*/}
                                {/*                      newDate =>handlePOD(newDate)*/}
                                {/*                  }*/}
                                {/*                  showYearDropdown*/}
                                {/*                  dateFormat="MM-dd-yyyy"*/}
                                {/*              />*/}
                                {/*        </span>*/}
                                {/*    </div>*/}
                                {/*    <div className="p-1">*/}
                                {/*        <p className='text-xs font-normal h-3/5'>MTI</p>*/}
                                {/*        <span >*/}
                                {/*              <DatePicker*/}
                                {/*                  customInput={<CustomDateInput value={workOrder.month_to_invoice !==process.env.REACT_APP_DEFAULT_DATE?workOrder.month_to_invoice:null } />}*/}
                                {/*                  selected={workOrder.month_to_invoice !==process.env.REACT_APP_DEFAULT_DATE?new Date(workOrder.month_to_invoice):null}*/}
                                {/*                  onChange = {*/}
                                {/*                      newDate =>handleMTI(newDate)*/}
                                {/*                  }*/}
                                {/*                  showYearDropdown*/}
                                {/*                  dateFormat="MM-dd-yyyy"*/}
                                {/*              />*/}
                                {/*        </span>*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                            </div>

                            <div className="w-full bg-white p-[25px]  mt-[24px]">
                                <h1 className='text-[24px] font-semibold'>Car Information</h1>
                                <div className="mt-[24px] flex flex-wrap">
                                    <div className="">
                                        <h2 className='text-[16px] font-normal '>Equipment</h2>
                                        <p className='text-[#979C9E] mt-[10px]'>District A234</p>
                                    </div>
                                    <div className="">
                                        <h2 className='text-[16px] font-normal '>Car type</h2>
                                        <p className='text-[#979C9E] mt-[10px]'>XXXXXX</p>
                                    </div>
                                    <div className="">
                                        <h2 className='text-[16px] font-normal '>Last Product</h2>
                                        <p className='text-[#979C9E] mt-[10px]'>District A234</p>
                                    </div>
                                    <div className="">
                                        <h2 className='text-[16px] font-normal '>El Index</h2>
                                        <p className='text-[#979C9E] mt-[10px]'>District A234</p>
                                    </div>
                                    <div className=" my-[16px]">
                                        <h2 className='text-[16px] font-normal '>Owner</h2>
                                        <p className='text-[#979C9E] mt-[10px]'>XXXX</p>
                                    </div>
                                    <div className=" my-[16px]">
                                        <h2 className='text-[16px] font-normal '>Lesse</h2>
                                        <p className='text-[#979C9E] mt-[10px]'>XXXXX</p>
                                    </div>

                                </div>
                            </div>
                            <div className="w-full bg-white p-[25px] flex mt-[24px] border rounded">
                                <div className="">
                                    <h2 className='text-[16px] font-normal '>TOTAL HOURS</h2>
                                    <p className='text-[#979C9E] mt-[10px]'>110 hrs</p>
                                </div>
                                <div className="">
                                    <h2 className='text-[16px] font-normal '>TOTAL LABOUR</h2>
                                    <p className='text-[#979C9E] mt-[10px]'>$ 9,829,874</p>
                                </div>
                                <div className="">
                                    <h2 className='text-[16px] font-normal '>TOTAL MATERIALS</h2>
                                    <p className='text-[#979C9E] mt-[10px]'>$ 9,829,874</p>
                                </div>
                                <div className="]">
                                    <h2 className='text-[16px] font-normal '>TOTAL NET</h2>
                                    <p className='text-[#979C9E] mt-[10px]'>$ 9,829,874</p>
                                </div>
                            </div>
                        </div>
                        {/*<JoblistTable />*/}
                        {/*<PartsTable />*/}
                        <div className="mt-[10px] p-[25px] border rounded-md ">
                            <h1 className="text-[24px] font-bold">Order updated</h1>
                            <div className="flex">
                            <span className=' px-[24px] py-[16px] border-b-4 border-[#002E54]'>
                                <h4 className='text-[20px] font-bold'>Inbounded</h4>
                                <p className='text-[#475467]'>Aug 20</p>
                            </span>
                                <span className='px-[24px] py-[16px] border-b-2'>
                                <h4 className='text-[20px] font-bold'>Inspected</h4>
                                <p className='text-[#475467]'>Aug 20</p>
                            </span>
                                <span className='px-[24px] py-[16px] border-b-2'>
                                <h4 className='text-[20px] font-bold'>Estimated</h4>
                                <p className='text-[#475467]'>Aug 20</p>
                            </span>
                                <span className=' px-[24px] py-[16px] border-b-2'>
                                <h4 className='text-[20px] font-bold'>Approved</h4>
                                <p className='text-[#475467]'>Aug 20</p>
                            </span>
                                <span className='px-[24px] py-[16px] border-b-2'>
                                <h4 className='text-[20px] font-bold'>Clean</h4>
                                <p className='text-[#475467]'>Aug 20</p>
                            </span>
                                <span className=' px-[24px] py-[16px] border-b-2'>
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
                    {/*<dialog id="statusModalInDetails" className="modal rounded-md max-h-[100vh]">*/}
                    {/*    <textarea id="statusUpdateMessageFromDropDown" rows="2" ref={statusCommentDropDown}*/}
                    {/*              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 my-4"*/}
                    {/*              placeholder="Write your comments here..."></textarea>*/}
                    {/*    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={postStatusFromDetails}>SUBMIT</button>*/}
                    {/*</dialog>*/}

                    <Modal
                        isOpen={isStatusDropDownModalOpenInDetails}
                        onRequestClose={()=>{
                            if(getValueById("statusUpdateMessageFromDropDown")!==''){
                                postStatusFromDetails()
                            }
                        }
                        }
                        parentSelector={() => document.querySelector('#orderDetailsModal')}
                        id="theIdHere"
                        contentLabel="POST COMMENT"
                        style={customStylesForCommentModal}
                    >
                        <textarea id="statusUpdateMessageFromDropDownInDetails" rows="2" ref={statusCommentDropDownInDetails}
                                  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 my-4"
                                  placeholder="Write your comments here..."></textarea>
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={postStatusFromDetails}>SUBMIT</button>
                    </Modal>
                </div>
            </dialog>
        </div>
    );

};

export default OrderDetails;