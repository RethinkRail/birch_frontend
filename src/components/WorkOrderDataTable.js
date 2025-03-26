import React, {useCallback, useEffect, useRef, useState} from "react";
import {round2Dec} from "../utils/NumberHelper";
import {convertSqlToFormattedDate, differenceBetweenTwoTimeStamp} from "../utils/DateTimeHelper";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CommentModal from "./CommentModal";
import DataTable from "react-data-table-component";
import Modal from 'react-modal'; // Make sure to install react-modal
import axios from "axios";
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OrderDetails from "./OrderDetails";
import CustomDateInput from "./CustomDateInput";
import ReorderableTable from "./ReorderableTable";
import debounce from 'lodash/debounce';
import {hasRole} from "../utils/CommonHelper";
import CustomDateInputFullWidth from "./CustomDateInputFullWidth";

const qs = require('qs');

const WorkOrderDataTable = ({
                                workOrders,
                                handlePaste,
                                statusCode,
                                commonData,
                                updateWorkUpdates,
                                updateArrivalDate,
                                updateInspectedDate,
                                updateCleanDate,
                                updateRepairScheduleDate,
                                updatePaintDate,
                                updateExteriorPaintDate,
                                updatePDDate,
                                updateValveTearDownDate,
                                updateValveAssemblyDate,
                                updateRepairDate,
                                updateFinalDate,
                                updateQADate,
                                updateMaterialETA,
                                updateMTI,
                                updateMOWK,
                                updatePOD,
                                updateMarkAsFinalized,
                                updateMarkAsShipped,
                                updateReasonToCome,
                                updateSP,
                                updateTQ,
                                updateRE,
                                updateEP,
                                updateOwnerBilling,
                                updateBillToLessee,
                                searchCar,
                                createAjob,
                                pasteJobs,
                                updateAJob,
                                deleteJob,
                                handleStorageUpdate,
                                handIsLockedForTimeClocking,
                                updateBillToLesseForAJob
                            }) => {
    const orderDetailsModalRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Debounced function to handle search
    const debouncedSearch = useCallback(
        debounce((term) => {
            console.log(`Searching for: ${term}`);
            // Add your search logic here
        }, 300), // Delay in milliseconds
        []
    );

    const handleSearchClick = () => {
        // alert(`Search clicked with term: ${searchTerm}`);
        searchCar(searchTerm.toUpperCase())
        setSearchTerm(''); // Clear the search box
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            //alert(`Enter pressed with term: ${searchTerm}`);
            searchCar(searchTerm)
            setSearchTerm(''); // Clear the search box
        }
    };

    const handleChange = (event) => {
        const value = event.target.value.toUpperCase();
        setSearchTerm(value);
        debouncedSearch(value); // Call debounced search function
    };

    const notify = (message) => toast();
    const [commentObject, setCommentObject] = useState([])
    const [workIdForComment, setWorkIdForComment] = useState(null)
    const [isStatusDropDownModalOpen, setIsStatusDropDownModalOpen] = useState(false);
    const [workOrderToView, setWorkOrderToView] = useState(null)
    const [railcarToChangeStaus, setRailCarToChangeStatus] = useState("")
    const [updatedStatusCode, setupdatedStatusCode] = useState("")
    let workOrderData = [];
    const [woForDT, setWoForDT] = useState([])
    const statusCommentDropDown = useRef(null);
    // const orderDetailsModal = document.getElementById('orderDetailsModal');
    //orderDetailsModal.close()

    const orderDetailsModal = document.getElementById('orderDetailsModal');

    const [canFinalized, setCanFinalized] = useState(false);

    useEffect(() => {
        const userToken = localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE);
        if (userToken) {
            setCanFinalized(hasRole( 'ADMIN') || hasRole('BILLING') || hasRole('CUSTOMER SERVICE'));
        }
    }, []);

    useEffect(() => {
        const handleChanges = () => {
           // console.log("Work orders changed from data table", workOrders)
            //console.log(workOrderToView)
            if(workOrderToView) {
                if(workOrders.length>0){
                    const updated = workOrders.find(work => work.id == workOrderToView.id)
                    if(updated){
                        setWorkOrderToView(updated)
                    }else {
                        setWorkOrderToView(null)
                    }
                }


            }
        }
        handleChanges()
    }, [workOrders])
    useEffect(() => {
        const handleChanges = () => {
//            console.log("Wawuuuu", workOrderToView)
        }
        handleChanges()
    }, [workOrderToView])

    useEffect(() => {
        if (workOrderToView != null) {
            const wo = workOrders.find(obj => obj['id'] === workOrderToView.id)
            setWorkOrderToView(wo)

        }
//        console.log("in action")
    }, [workOrders])


    useEffect(() => {

        workOrderData=[]
        workOrders.forEach((workOrder, index) => {
            const laborHours = workOrder.joblist != null ? workOrder.joblist.reduce((acc, item) => acc + item.labor_time * item.quantity, 0) : 0;
            const durationHours = workOrder.time_log.reduce((acc, item) => acc + item.logged_time_in_seconds / 3600, 0);
            const percentage = durationHours === 0 ? 0 : (durationHours / laborHours) * 100;
            var actual_dif = workOrder.arrival_date == process.env.REACT_APP_DEFAULT_DATE ? 0 : differenceBetweenTwoTimeStamp(new Date().toISOString().slice(0, 19), workOrder.arrival_date)["days"]

            const workOrderObject = {
                'workOrder': workOrder,
                'estimated_time': round2Dec(laborHours),
                'labor_hours': round2Dec(durationHours),
                'lhr': !isNaN(percentage) && isFinite(percentage) ? round2Dec(percentage) + "%" : "0.00%",
                'dif': actual_dif,
                'railcar_id': workOrder.railcar_id,
                'arrival_date': workOrder.arrival_date == process.env.REACT_APP_DEFAULT_DATE ? null : convertSqlToFormattedDate(workOrder.arrival_date),
                'inspected_date': workOrder.inspected_date == process.env.REACT_APP_DEFAULT_DATE ? null : convertSqlToFormattedDate(workOrder.inspected_date),
                'clean_date': workOrder.clean_date == process.env.REACT_APP_DEFAULT_DATE ? null : convertSqlToFormattedDate(workOrder.clean_date),
                'repair_schedule_date': workOrder.repair_schedule_date == process.env.REACT_APP_DEFAULT_DATE ? null : convertSqlToFormattedDate(workOrder.repair_schedule_date),
                'paint_date': workOrder.paint_date == process.env.REACT_APP_DEFAULT_DATE ? null : convertSqlToFormattedDate(workOrder.paint_date),
                'repair_date': workOrder.repair_date == process.env.REACT_APP_DEFAULT_DATE ? null : convertSqlToFormattedDate(workOrder.repair_date),
                'final_date': workOrder.final_date == process.env.REACT_APP_DEFAULT_DATE ? null : convertSqlToFormattedDate(workOrder.final_date),
                'qa_date': workOrder.qa_date == process.env.REACT_APP_DEFAULT_DATE ? null : convertSqlToFormattedDate(workOrder.qa_date),
                'projected_out_date': workOrder.projected_out_date ,
                'month_to_invoice': workOrder.month_to_invoice !== process.env.REACT_APP_DEFAULT_DATE ? convertSqlToFormattedDate(workOrder.month_to_invoice) : null,
                'last_content': workOrder.railcar.products.name,
                'status': workOrder.workupdates[0].status_id,
                'comment': workOrder.workupdates,
                'material_eta': workOrder.material_eta,
                'finalized': workOrder.locked_by,
                'shipped': workOrder.shipped_date,
                'work_id': workOrder.id,
                'is_storage': workOrder.is_storage,
                'index': index
            }
            // console.log(workOrderObject.material_eta)
            // console.log(workOrderObject.projected_out_date)
            workOrderData.push(workOrderObject)
        })
        console.log()
        workOrderData.sort((a, b) => new Date(b.arrival_date) - new Date(a.arrival_date));
        setWoForDT(workOrderData)
//        console.log("in action")
    }, [workOrders])


    const customStylesForCommentModal = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            width: '400px',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
        },
    };
    const handleDropdownChange = (e, workId) => {
        e.preventDefault()
        openStatusDialog(workId, e.target.value)
    }
    const openStatusDialog = (workId, new_status) => {
        setupdatedStatusCode(new_status)
        setRailCarToChangeStatus(workId)
        setIsStatusDropDownModalOpen(true)
    };
    const postStatus = () => {
        //console.log(comment)
        var comment = getValueById("statusUpdateMessageFromDropDown");
        if (comment == null || comment.length === 0) {
            return
        }
        let data = qs.stringify({
            'work_id': railcarToChangeStaus,
            'user_id': JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id'],
            'status_id': updatedStatusCode.split(":")[0],
            'source': "home_page",
            'comment': comment
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.REACT_APP_BIRCH_API_URL + 'post_work_updates',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                updateWorkUpdates(railcarToChangeStaus, response.data, updatedStatusCode.split(":")[1])
                setRailCarToChangeStatus("")
                setupdatedStatusCode("")
                setIsStatusDropDownModalOpen(false);
            })
            .catch((error) => {
                console.log(error);
                setIsStatusDropDownModalOpen(false);
                setRailCarToChangeStatus("")
                setupdatedStatusCode("")
                setIsStatusDropDownModalOpen(false);
            });
    };
    const workOrdersTableColumn = [
        {
            name: "LHR",
            selector: row => row.lhr,
            sortable: true,
            width: '4%',
            cell: (row) => (
                <span
                    className="cursor-alias tooltip tooltip-right before:whitespace-pre-wrap before:content-[attr(data-tip)]"
                    data-tip={`Estimated Hour: ${row.estimated_time}\nHours Applied: ${row.labor_hours}`}
                >
                {row.lhr}
            </span>
            ),
        },
        {
            name: "DIF",
            selector: row => row.dif,
            sortable: true,
            width: '5%',
            cell: (row) => (
                <span className="whitespace-pre-line text-xs ">
                {row.dif > 0 ? row.dif : "-"}
            </span>
            ),
        },
        {
            name: "CAR",
            selector: row => row.railcar_id,
            sortable: true,
            width: '10%',
        },
        {
            name: "LAST CONTENT",
            selector: row => row.last_content,
            sortable: true,
            cell: (row) => (
                <span className="whitespace-pre-line text-xs sm:text-sm md:text-base">
                {row.last_content}
            </span>
            ),
            width: "11%",
        },
        {
            name: "STATUS",
            selector: row => row.status,
            width: "13%",
            cell: (row) => (
                <select
                    onChange={(e) => handleDropdownChange(e, row.work_id)}
                    disabled={row.finalized > 0}
                    className={`w-full placeholder-opacity-90 ${row.index % 2 === 0 ? '' : 'bg-[#F7F9FF]'} sm:text-xs md:text-sm`}
                >
                    {statusCode.map((sc) => (
                        <option key={sc.code} selected={row.status === sc.code}>
                            {sc.code + ":" + sc.title}
                        </option>
                    ))}
                </select>
            ),
            sortable: true,
        },
        {
            name: "COMMENT",
            selector: row => row.comment,
            width: "17%",
            cell: (row) => (
                <span
                    onClick={() => {
                        if (row.finalized == null) {
                            document.getElementById('commentModal').showModal();
                            setCommentObject(row.comment);
                            setWorkIdForComment(row.work_id);
                        }
                    }}
                    className="cursor-pointer whitespace-pre-line text-xs sm:text-sm md:text-base text-ellipsis"
                >
                {row.comment[0].comment}
            </span>
            ),
            sortable: true,
        },
        {
            name: "MATERIAL ETA",
            selector: row => row.material_eta || '',
            width: "9%",
            cell: (row) => (
                <span className="w-full items-start">
                <DatePicker
                    customInput={<CustomDateInputFullWidth value={row.material_eta ? new Date(row.material_eta) : null} />}
                    selected={row.material_eta !== process.env.REACT_APP_DEFAULT_DATE ? new Date(row.material_eta) : null}
                    onChange={newDate => updateMaterialETA(row.work_id, newDate)}
                    showYearDropdown
                    isClearable
                    disabled={row.finalized > 0}
                    dateFormat="MM-dd-yyyy"
                    className=""
                />
                </span>
            ),
            sortFunction: (a, b) => {
                const dateA = a.material_eta ? new Date(a.material_eta) : new Date(0);
                const dateB = b.material_eta ? new Date(b.material_eta) : new Date(0);
                return dateA - dateB;
            },
            sortable: true,
            className: "hidden sm:block"
        },
        {
            name: "POD",
            selector: row => row.projected_out_date || '',
            width: "8%",
            cell: (row) => (
                <span className="w-full items-start">
                    <DatePicker
                        customInput={<CustomDateInputFullWidth value={row.projected_out_date ? new Date(row.projected_out_date) : null} />}
                        selected={row.projected_out_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(row.projected_out_date) : null}
                        onChange={newDate => updatePOD(row.work_id, newDate)}
                        showYearDropdown
                        dateFormat="MM-dd-yyyy"
                        disabled={row.finalized > 0}
                        className="w-full sm:w-auto md:w-auto text-xs sm:text-sm md:text-base"
                    />
                </span>
            ),
            sortable: true,
            sortFunction: (a, b) => {
                const dateA = a.projected_out_date ? new Date(a.projected_out_date) : new Date(0);
                const dateB = b.projected_out_date ? new Date(b.projected_out_date) : new Date(0);
                return dateA - dateB;
            },
        },
        {
            name: "INVOICED",
            selector: row => row.finalized,
            width: "5%",
            sortable: true,
            cell: (row) => (
                <div className="flex justify-center items-center">
                    <input
                        disabled={!canFinalized}
                        type="checkbox"
                        onChange={(event) => updateMarkAsFinalized(row.work_id, event.target.checked)}
                        checked={row.finalized !== null}
                        className="checkbox checkbox-primary"
                    />
                </div>
            ),
        },
        {
            name: "SHIPPED",
            selector: row => row.shipped,
            width: "9%",
            sortable: true,
            cell: (row) => (
                <span className="w-full items-start">
                    <DatePicker
                        customInput={<CustomDateInputFullWidth value={row.shipped !== process.env.REACT_APP_DEFAULT_DATE ? new Date(row.shipped) : null} />}
                        selected={row.shipped !== process.env.REACT_APP_DEFAULT_DATE ? new Date(row.shipped) : null}
                        onChange={newDate => updateMarkAsShipped(row.work_id, newDate)}
                        showYearDropdown
                        isClearable
                        dateFormat="MM-dd-yyyy"
                        className="w-full text-sm"
                    />
                </span>
            ),
        },
        {
            name: "VIEW",
            selector: row => row.workOrder,
            width: "6%",
            sortable: false,
            cell: (row) => (
                <span
                    className="align-middle cursor-pointer mt-[10px]"
                    onClick={() => {
                        setWorkOrderToView(row.workOrder);
                        handleShowOrderDetails(row.workOrder);
                    }}
                >
                {/* Eye Icon SVG */}
                    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M1.42012 8.71318C1.28394 8.49754 1.21584 8.38972 1.17772 8.22342C1.14909 8.0985 1.14909 7.9015 1.17772 7.77658C1.21584 7.61028 1.28394 7.50246 1.42012 7.28682C2.54553 5.50484 5.8954 1 11.0004 1C16.1054 1 19.4553 5.50484 20.5807 7.28682C20.7169 7.50246 20.785 7.61028 20.8231 7.77658C20.8517 7.9015 20.8517 8.0985 20.8231 8.22342C20.785 8.38972 20.7169 8.49754 20.5807 8.71318C19.4553 10.4952 16.1054 15 11.0004 15C5.8954 15 2.54553 10.4952 1.42012 8.71318Z"
                        stroke="#686868" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    />
                    <path
                        d="M11.0004 11C12.6573 11 14.0004 9.65685 14.0004 8C14.0004 6.34315 12.6573 5 11.0004 5C9.34355 5 8.0004 6.34315 8.0004 8C8.0004 9.65685 9.34355 11 11.0004 11Z"
                        stroke="#686868" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    />
                </svg>
            </span>
            ),
        },
    ];


    const conditionalRowStyles = [
        {
            when: row => row.finalized > 0,
            style: {
                backgroundColor: '#f4f4f6',
            },
            classNames: ["py-1", "whitespace-nowrap", "font-bold", "text-xs"]
        },
        {
            when: row => row.finalized < 1 && row.index % 2 == 1,
            style: {
                backgroundColor: '#F7F9FF',
            },
            classNames: ["py-1", "whitespace-nowrap", "font-bold", "text-xs"]
        },
        {
            when: row => row.finalized < 1 && row.index % 2 == 0,
            style: {
                backgroundColor: '#FFFFFFFF', // Yellow background for rows where age is less than 25
            },
            classNames: ["py-1", "whitespace-nowrap", "font-bold", "text-xs"]
        },
    ];
    const myStyles = {
        headRow: {
            style: {
                "backgroundColor": "#DCE5FF",
                "font-size": "10px",
                "padding": "1px",
                "font-family": 'Inter',
                "font-weight": "500"
            },
        },
        headCells: {
            style: {
                paddingLeft: '10px',
                paddingRight: '2px',
            },
        },
        cells: {
            style: {"font-size": "10px", "font-family": 'Inter', "font-weight": "500", "padding-left": "10px"},
        },

    }
    const getValueById = (id) => {
        const element = statusCommentDropDown.current;
        if (element && element.id === id) {
            return element.value;
        }
        return null;
    };
    const handleShowOrderDetails = async (row) => {
        setWorkOrderToView(null)
        await setWorkOrderToView(() => row)
        orderDetailsModalRef.current.showModal();
    };

    const closeModal = () => {
        orderDetailsModalRef.current.close();
    };
    return (
        <React.Fragment>
            <div className="overflow-x-hidden w-full mx-auto  mt-[-1px] text-[14px] font-medium">
                <div className="flex justify-between items-center mt-[10px] uppercase">
                    <h2 className="text-[18px]  font-semibold">Work Orders</h2>
                    <div className='relative mr-1' >
                        <input
                            type='text'
                            placeholder='Search history car ..'
                            value={searchTerm}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            className='w-full h-[24px] px-[18px] py-[18px] text-[14px] font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-[40px]'
                        />

                    </div>

                </div>
                <div className="mt-5 ml-1 mx-auto border rounded-lg mb-10 p-2 sm:px-1 sm:py-1 sm:w-full md:w-full lg:w-full xl:w-full">
                    <DataTable
                        columns={workOrdersTableColumn}
                        data={woForDT}
                        conditionalRowStyles={conditionalRowStyles}
                        striped={false}
                        dense={true}
                        responsive={true}
                        pagination={false}
                        highlightOnHover={true}
                        fixedHeader={false}
                        className="compact stripe"
                        customStyles={myStyles}
                        noDataComponent={
                            <div className="no-data-message text-center py-5 text-gray-500">
                                Preparing Result
                            </div>
                        }
                    />
                </div>
                <CommentModal
                    data={commentObject.sort((a, b) => new Date(b.update_date) - new Date(a.update_date))}
                    work_id={workIdForComment}
                    updateWorkUpdates={updateWorkUpdates}
                />
                <Modal
                    isOpen={isStatusDropDownModalOpen}
                    onRequestClose={() => {
                        if (getValueById("statusUpdateMessageFromDropDown") !== '') {
                            postStatus()
                        }
                    }
                    }
                    contentLabel="POST COMMENT"
                    style={customStylesForCommentModal}
                >
                    <textarea id="statusUpdateMessageFromDropDown" rows="2" ref={statusCommentDropDown}
                              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 my-4"
                              placeholder="Write your comments here..."></textarea>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={postStatus}>SUBMIT
                    </button>
                </Modal>


                {workOrderToView !== null ? (
                    <OrderDetails
                        commonData={commonData}
                        workOrder={workOrderToView}
                        handlePaste={handlePaste}
                        statusCode={statusCode}
                        updateWorkUpdates={updateWorkUpdates}
                        updateArrivalDate={updateArrivalDate}
                        updateInspectedDate={updateInspectedDate}
                        updateCleanDate={updateCleanDate}
                        updateRepairScheduleDate={updateRepairScheduleDate}
                        updateValveTearDownDate={updateValveTearDownDate}
                        updateValveAssemblyDate={updateValveAssemblyDate}
                        updatePaintDate={updatePaintDate}
                        updateExteriorPaintDate={updateExteriorPaintDate}
                        updatePDDate={updatePDDate}
                        updateRepairDate={updateRepairDate}
                        updateFinalDate={updateFinalDate}
                        updateQADate={updateQADate}
                        updatePOD={updatePOD}
                        updateMTI={updateMTI}
                        updateMOWK={updateMOWK}
                        updateMarkAsShipped={updateMarkAsShipped}
                        updateReasonToCome={updateReasonToCome}
                        updateSP={updateSP}
                        updateTQ={updateTQ}
                        updateRE={updateRE}
                        updateEP={updateEP}
                        updateBilling={updateOwnerBilling}
                        updateBillToLessee={updateBillToLessee}
                        createAjob={createAjob}
                        pasteJobs={pasteJobs}
                        updateAJob={updateAJob}
                        deleteJob={deleteJob}
                        handleStorageUpdate={handleStorageUpdate}
                        handIsLockedForTimeClocking={handIsLockedForTimeClocking}
                        updateBillToLesseForAJob={updateBillToLesseForAJob}
                        orderDetailsModalRef={orderDetailsModalRef}
                    />
                ) : null}
                {/*<OrderDetails*/}
                {/*    workOrder={workOrderToView}*/}
                {/*/>*/}
            </div>
        </React.Fragment>
    )
}



export default WorkOrderDataTable