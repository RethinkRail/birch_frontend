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
import {hasRole, replaceItemInArray} from "../utils/CommonHelper";
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
                                updateBillToLesseForAJob,
                                title
                            }) => {
    const orderDetailsModalRef = useRef(null);
    const [searchTermHistory, setSearchTermHistory] = useState('');
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
        // alert(`Search clicked with term: ${searchTermHistory}`);
        searchCar(searchTermHistory.toUpperCase())
        setSearchTermHistory(''); // Clear the search box
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            //alert(`Enter pressed with term: ${searchTermHistory}`);
            searchCar(searchTermHistory)
            setSearchTermHistory(''); // Clear the search box
        }
    };

    const handleChange = (event) => {
        const value = event.target.value.toUpperCase();
        setSearchTermHistory(value);
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


    const [canFinalized, setCanFinalized] = useState(false);

    //for checklist
    const [isDepartmentChecklistModalOpen, setIsDepartmentChecklistModalOpen] = useState(false);
    const [currentChecklist, setCurrentChecklist] = useState([]);
    const [checklistState, setChecklistState] = useState({});
    const [selectedWorkId, setSelectedWorkId] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [oldStatus, setOldStatus] = useState(null);

    useEffect(() => {
        const userToken = localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE);
        if (userToken) {
            setCanFinalized(hasRole( 'ADMIN') || hasRole('FINAL BILLING REVIEW') || hasRole('CUSTOMER SERVICE'));
        }
    }, []);

    useEffect(() => {
        const handleChanges = async () => {
            if (workOrderToView) {
                if (workOrders.length > 0) {
                    const updated = workOrders.find(work => work.id == workOrderToView.id)
                    if (updated) {
                        let config = {
                            method: 'get',
                            maxBodyLength: Infinity,
                            url: process.env.REACT_APP_BIRCH_API_URL + 'get_workorder_by_id?work_id=' + parseInt(workOrderToView.id),
                            headers: {}
                        };

                        await axios.request(config)
                            .then((response) => {
                                setWorkOrderToView(response.data)
                            })
                            .catch((error) => {
                                console.log(error);
                            });

                    } else {
                        setWorkOrderToView(null)
                    }
                }
            }
        }
        handleChanges()
    }, [workOrders])




    useEffect(() => {
        workOrderData=[]
        workOrders.forEach((workOrder, index) => {
            var actual_dif = workOrder.arrival_date == process.env.REACT_APP_DEFAULT_DATE ? 0 : differenceBetweenTwoTimeStamp(new Date().toISOString().slice(0, 19), workOrder.arrival_date)["days"]
            const workOrderObject = {
                'dif': actual_dif,
                'railcar_id': workOrder.railcar_id,
                'last_content': workOrder.railcar.products.name,
                'status': workOrder.workupdates[0]?.status_id,
                'comment': workOrder.workupdates,
                'material_eta': workOrder.material_eta,
                'finalized': workOrder.locked_by,
                'shipped': workOrder.shipped_date,
                'projected_out_date': workOrder.projected_out_date,
                'work_id': workOrder.id,
                'index': index
            }
            workOrderData.push(workOrderObject)
        })
        setWoForDT(workOrderData)
    }, [workOrders])

    useEffect(() => {
        if (workOrderToView && orderDetailsModalRef.current) {
            orderDetailsModalRef.current.showModal();
        }
    }, [workOrderToView]);
    const handleShowOrderDetails = (row) => {
        setWorkOrderToView(row);
    };
    const handleCloseOrderDetails = () => {
        setWorkOrderToView(null);
    };
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
    const handleDropdownChange = (e, workId,status) => {
       setOldStatus(status);
        e.preventDefault()
        const selectedStatusObj = statusCode.find(sc => String(sc.code) === String(status));
        if (selectedStatusObj?.department_id_for_checklist && selectedStatusObj.job_or_revenue_category) {
            // build checklist state
            const checklistItems = selectedStatusObj.job_or_revenue_category.department_checklist || [];
            const initState = {};
            checklistItems.forEach((item, idx) => {
                initState[idx] = false;
            });
            setChecklistState(initState);
            setCurrentChecklist(checklistItems);
            setSelectedWorkId(workId);
            setSelectedStatus(e.target.value);
            setIsDepartmentChecklistModalOpen(true);
        }else {
            openStatusDialog(workId, e.target.value)
        }

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
            name: "DIF",
            selector: row => row.dif,
            sortable: true,
            width: '4%',
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
            width: '8%',
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
            width: "12%",
        },
        {
            name: "STATUS",
            selector: row => row.status,
            width: "20%",
            cell: (row) => (
                <select
                    value={row.status} // controlled select
                    onChange={(e) => handleDropdownChange(e, row.work_id, row.status)}
                    disabled={row.finalized > 0}
                    className={`w-full placeholder-opacity-90 ${row.index % 2 === 0 ? '' : 'bg-[#F7F9FF]'} sm:text-xs md:text-sm`}
                >
                    {statusCode.map((sc) => (
                        <option key={sc.code} value={sc.code}>
                            {sc.code}:{sc.title}
                        </option>
                    ))}
                </select>
            ),
            sortable: true,
        }
        ,
        {
            name: "COMMENT",
            selector: row => row.comment,
            width: "19%",
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
                    onClick={async () => {
                        let config = {
                            method: 'get',
                            maxBodyLength: Infinity,
                            url: process.env.REACT_APP_BIRCH_API_URL + 'get_workorder_by_id?work_id=' + parseInt(row.work_id),
                            headers: {}
                        };

                        await axios.request(config)
                            .then((response) => {
                                console.log(response.data)
                                handleShowOrderDetails(response.data);

                            })
                            .catch((error) => {
                                console.log(error);
                            });


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

    return (
        <React.Fragment>
            <div className="overflow-x-hidden w-full mx-auto  mt-[-1px] text-[14px] font-medium">
                <div className="flex justify-between items-center mt-[10px] uppercase mb-5">
                    <h2 className="text-[18px]  font-semibold">{title}</h2>
                </div>
                {/* Search Bar Above DataTable */}
                <div className="flex justify-between mb-3">
                    {/* Left Search (Work Orders) */}
                    <div className="flex items-center ml-1">
                        <input
                            type="text"
                            placeholder="Search active work orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-[32px] px-[10px] text-[14px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Right Search (History Car) */}
                    <div className="flex items-center">
                        <input
                            type="text"
                            placeholder="Search history car .."
                            value={searchTermHistory}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            className="h-[32px] px-[10px] text-[14px] font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="mt-5 ml-1 mx-auto border rounded-lg mb-10 p-2 sm:px-1 sm:py-1 sm:w-full md:w-full lg:w-full xl:w-full">
                    <DataTable
                        columns={workOrdersTableColumn}
                        data={
                            woForDT.filter(row =>
                                Object.values(row).some(val =>
                                    String(val).toLowerCase().includes(searchTerm.toLowerCase())
                                )
                            )
                        }
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
                           searchTerm ? (
                                <div className="no-data-message text-center py-5 text-gray-500">
                                    No matching results
                                </div>
                            ) : (
                                <div className="no-data-message text-center py-5 text-gray-500">
                                    Loading results...
                                </div>
                            )
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



                <Modal
                    isOpen={isDepartmentChecklistModalOpen}
                    onRequestClose={() => setIsDepartmentChecklistModalOpen(false)}
                    contentLabel="POST COMMENT"
                    style={customStylesForCommentModal}
                >
                    <h2 className="text-lg font-bold mb-3">Department Checklist</h2>

                    {/* Checklist */}
                    {currentChecklist.map((item, idx) => (
                        <div key={idx} className="flex items-center mb-2">
                            <input
                                type="checkbox"
                                checked={checklistState[idx] || false}
                                onChange={() =>
                                    setChecklistState(prev => ({ ...prev, [idx]: !prev[idx] }))
                                }
                                className="mr-2"
                            />
                            <label>{item.checklist}</label>
                        </div>
                    ))}

                    <p>
                        {
                            commonData?.sworn_statement?.statement
                                ? commonData.sworn_statement.statement.replace(
                                    "{NAME}",
                                    JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE) || "{}")?.name || ""
                                )
                                : ""
                        }
                    </p>


                    {/* Buttons */}
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            className="bg-gray-300 text-black font-bold py-2 px-4 rounded"
                            onClick={() => {
                                setWoForDT(prev => {
                                    const newArr = prev.map(w => {
                                        if (w.work_id == selectedWorkId) {
                                            return { ...w, status: oldStatus };
                                        }
                                        return w;
                                    });

                                    return newArr;
                                });
                                setIsDepartmentChecklistModalOpen(false);
                            }}
                        >
                            Cancel
                        </button>

                        <button
                            className={`font-bold py-2 px-4 rounded text-white ${
                                Object.values(checklistState).every(Boolean)
                                    ? "bg-blue-500 hover:bg-blue-700"
                                    : "bg-gray-400 cursor-not-allowed"
                            }`}
                            disabled={!Object.values(checklistState).every(Boolean)}
                            onClick={async () => {
                                //alert("Checklist submitted successfully!");

                                try {
                                    await axios.post(process.env.REACT_APP_BIRCH_API_URL+"post_department_checklist/", {
                                        work_id: selectedWorkId,
                                        status_code: parseInt(selectedStatus),
                                        user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))?.id
                                    });

                                    setIsDepartmentChecklistModalOpen(false);
                                    openStatusDialog(selectedWorkId, selectedStatus);
                                } catch (error) {
                                    console.error("Error submitting checklist:", error);
                                }
                            }}
                        >
                            Submit
                        </button>
                    </div>
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
                        onClose={handleCloseOrderDetails}
                    />
                ) : null}

            </div>
        </React.Fragment>
    )
}



export default WorkOrderDataTable