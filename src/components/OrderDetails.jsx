import React, {useEffect, useRef, useState} from 'react';
import Modal from "react-modal";
import qs from "qs";
import {toast} from "react-toastify";
import CustomDateInput from "./CustomDateInput";
import axios from "axios";
import CustomDateInputFullWidth from "./CustomDateInputFullWidth";
import {addDays} from "flowbite-react/lib/esm/components/Datepicker/helpers";
import {convertSqlToFormattedDate, convertSqlToFormattedDateTime,} from "../utils/DateTimeHelper";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import DatePicker from "react-datepicker";
import {printATask, printBBOM, printBRC, printInvoice} from '../utils/documentPrintHelper';
import JoblistTable from "./JoblistTable";
import PartsTable from "./PartsTable";
import {round2Dec} from "../utils/NumberHelper";
import StorageComponent from "./StorageComponent";
import RailCareTimeLog from "./RailCareTimeLog";
import {printAAR} from "../utils/aarHelper";
import TaskTable from "./TaskTable";
import {hasRole} from "../utils/CommonHelper";
import PartReportTable from "./PartReportTable";

const OrderDetails = ({
                          commonData,
                          workOrder,
                          handlePaste,
                          statusCode,
                          updateWorkUpdates,
                          updateArrivalDate,
                          updateInspectedDate,
                          updateCleanDate,
                          updateRepairScheduleDate,
                          updateValveTearDownDate,
                          updateValveAssemblyDate,
                          updatePaintDate,
                          updateExteriorPaintDate,
                          updatePDDate,
                          updateRepairDate,
                          updateFinalDate,
                          updateQADate,
                          updatePOD,
                          updateMTI,
                          updateMOWK,
                          updateMarkAsShipped,
                          updateReasonToCome,
                          updateSP,
                          updateTQ,
                          updateRE,
                          updateEP,
                          updateBilling,
                          updateBillToLessee,
                          getActiveWorkOrders,
                          handleBillingInformationChanged,
                          createAjob,
                          pasteJobs,
                          updateAJob,
                          deleteJob,
                          handleStorageUpdate,
                          handIsLockedForTimeClocking,
                          updateBillToLesseForAJob,
                          orderDetailsModalRef
                      }) => {
    console.log(workOrder)
    // console.log(workOrder.reason_to_come)
    // console.log(commonData)


    // Method to show update and cancel button when purchase order, invoice number, invoice date, due date changes

    const [ownerPurchaseOrderOriginal, setOwnerPurchaseOrderOriginal] = useState()
    const [ownerInvoiceNumberOriginal, setOwnerInvoiceNumberOriginal] = useState()
    const [ownerInvoiceDateOriginal, setOwnerInvoiceDateOriginal] = useState()
    const [ownerDueDateOriginal, setOwnerDueDateOriginal] = useState()
    const [ownerInvoiceNetDaysOriginal, setOwnerInvoiceNetDaysOriginal] = useState()
    const [showButtonsOwner, setShowButtonsOwner] = useState(false)

    // method to show update and cancel button when for lessee
    const [lesseePurchaseOrderOriginal, setLesseePurchaseOrderOriginal] = useState()
    const [lesseeInvoiceNumberOriginal, setLesseeInvoiceNumberOriginal] = useState()
    const [lesseeInvoiceDateOriginal, setLesseeInvoiceDateOriginal] = useState()
    const [lesseeDueDateOriginal, setLesseeDueDateOriginal] = useState()
    const [lesseeInvoiceNetDaysOriginal, setLesseeInvoiceNetDaysOriginal] = useState()
    const [showButtonsLessee, setShowButtonsLessee] = useState(false)
    const [partReport, setPartReport] = useState([])

    //const [joblist,setJobList] =useState([])


    const containerRef = useRef();


    const [jobs, setJobs] = useState([])
    const statusCommentDropDownInDetails = useRef(null);


    const [reasonToCome, setReasonToCome] = useState(null);

    const [isStatusDropDownModalOpenInDetails, setIsStatusDropDownModalOpenInDetails] = useState(null);

    const [updatedStatusCode, setupdatedStatusCode] = useState(null)
    const [isReasonToComeChanged, setIsReasonToComeChanged] = useState(false)


    const [isBillingInformationChangedForOwner, setIsBillingInformationChangedForOwner] = useState(false)
    const [isBillingInformationChangedForLessee, setIsBillingInformationChangedForLessee] = useState(false)

    const [ownerPurchaseOrder, setOwnerPurchaseOrder] = useState(null)
    const [lesseePurchaseOrder, setLesseePurchaseOrder] = useState(null)
    const [purchaseorderChangedForOwner, setPurchaseOrderChangedForOwner] = useState(false)
    const [purchaseorderChangedForLessee, setPurchaseOrderChangedForLessee] = useState(false)

    const [ownerInvoiceNumber, setOwnerInvoiceNumber] = useState(null)
    const [lesseeInvoiceNumber, setLesseeInvoiceNumber] = useState(null)
    const [invoiceChangedForOwner, setInvoiceChangedForOwner] = useState(false)
    const [invoiceChangedForLessee, setInvoiceChangedForLessee] = useState(false)


    const [ownerInvoiceNetDays, setOwnerInvoiceNetDays] = useState(null)
    const [lesseeInvoiceNetDays, setLesseeInvoiceNetDays] = useState(null)
    const [invoiceNetDaysChangedForOwner, setInvoiceNetDaysChangedForOwner] = useState(false)
    const [invoiceNetDaysChangedForLessee, setInvoiceNetDaysChangedForLessee] = useState(false)


    const [ownerInvoiceDate, setOwnerInvoiceDate] = useState(null)
    const [lesseeInvoiceDate, setLesseeInvoiceDate] = useState(null)
    const [invoiceDateChangedForOwner, setInvoiceDateChangedForOwner] = useState(false)
    const [invoiceDateChangedForLessee, setInvoiceDateChangedForLessee] = useState(false)


    const [mo_wk, setMo_wk] = useState(null);
    const [sp, setSP] = useState(null);
    const [tq, setTQ] = useState(null);
    const [re, setRE] = useState(null);
    const [ep, setEP] = useState(null);
    const [storageInformation,setStorageInformation ]= useState([])

    const [isBilledToLessee, setIsBilledToLessee] = useState(false)



    const checkBillingInformationChangedForOwner = () => {
        console.log("called")
        console.log(purchaseorderChangedForOwner + "purchse order")
        console.log(invoiceChangedForOwner)
        console.log(invoiceNetDaysChangedForOwner)
        console.log(invoiceDateChangedForOwner)
        console.log(purchaseorderChangedForOwner || invoiceChangedForOwner || invoiceNetDaysChangedForOwner || invoiceDateChangedForOwner)
        if (purchaseorderChangedForOwner || invoiceChangedForOwner || invoiceNetDaysChangedForOwner || invoiceDateChangedForOwner) {
            setIsBillingInformationChangedForOwner(true)
        } else {
            setIsBillingInformationChangedForOwner(false)
        }
    }

    const checkBillingInformationChangedForLessee = () => {
        if (purchaseorderChangedForLessee || invoiceChangedForLessee || invoiceNetDaysChangedForLessee || invoiceDateChangedForLessee) {
            setIsBillingInformationChangedForLessee(true)
        } else {
            setIsBillingInformationChangedForLessee(false)
        }
    }


    const reasonToComeRef = useRef(null);
    const mowkRef = useRef(null);
    const spRef = useRef(null);
    const tqRef = useRef(null);
    const reRef = useRef(null);
    const epRef = useRef(null);
    const ownerPurchaseOrderRef = useRef(null);
    const lesseePurchaseOrderRef = useRef(null);
    const ownerInvoiceNumberRef = useRef(null);
    const ownerInvoiceDaterRef = useRef(null);
    const ownerInvoiceNetDaysrRef = useRef(null);
    //const debouncedMOWK = useDebounce(workOrder.mo_wk, 300);

    const [railCarLog,setRailcarLog]=useState([])

    const [totalLaborHours,setTotalLaborHours]= useState()
    const [totalLaborCost,setTotalLaborCost]= useState()
    const [totalMatCost,setTotalMatCost]= useState()


    const calculateJobCosts = (jobs) => {
        let totalLaborCost = 0;
        let totalLaborHours = 0;
        let totalMaterialCost = 0;

        jobs.forEach(job => {

            const laborCost = Number(round2Dec(job.labor_rate)) * Number(round2Dec(job.labor_time)) * Number(round2Dec(job.quantity));
            totalLaborCost += Number(round2Dec(laborCost));

            // Calculate labor hours
            const laborHours = Number(round2Dec(job.labor_time)) * job.quantity;
            totalLaborHours += Number(round2Dec(laborHours));

            // Calculate material cost
            job.jobparts.forEach(part => {
                const purchaseCost = Number(round2Dec(part.purchase_cost)) * part.quantity;
                const markup = Number(round2Dec(purchaseCost)) * Number(round2Dec(part.markup_percent));
                const materialCost = Number(round2Dec(purchaseCost + markup));
                totalMaterialCost += Number(round2Dec(materialCost));
            });
        });
        setTotalLaborHours(totalLaborHours)
        setTotalLaborCost(totalLaborCost)
        setTotalMatCost(totalMaterialCost)

    };

    useEffect(() => {
        if (!workOrder) {
            //console.warn("workOrder is null or undefined");
            return;
        }

        // const element = document.getElementById('car_info');
        // element?.scrollIntoView({ behavior: 'smooth' });
        // window.scrollBy(0, -50);
        //console.log("use effect in orderdetails");
        setReasonToCome(workOrder.reason_to_come ?? "");
        // console.log(workOrder);
        // console.log(workOrder.joblist);
        setJobs(workOrder.joblist ?? []);
        setIsStatusDropDownModalOpenInDetails(false);

        setupdatedStatusCode("");
        setIsReasonToComeChanged(false);

        setIsBillingInformationChangedForOwner(false);
        setIsBillingInformationChangedForLessee(false);

        setOwnerPurchaseOrder(workOrder.purchase_order ?? "");
        setOwnerPurchaseOrderOriginal(workOrder.purchase_order ?? "");
        setLesseePurchaseOrder(workOrder.secondary_owner_info?.purchase_order ?? "");
        setLesseePurchaseOrderOriginal(workOrder.secondary_owner_info?.purchase_order ?? "");
        setPurchaseOrderChangedForOwner(false);
        setPurchaseOrderChangedForLessee(false);

        setOwnerInvoiceNumber(workOrder.invoice_number ?? "");
        setOwnerInvoiceNumberOriginal(workOrder.invoice_number ?? "");
        setLesseeInvoiceNumber(workOrder.secondary_owner_info?.invoice_number ?? "");
        setLesseeInvoiceNumberOriginal(workOrder.secondary_owner_info?.invoice_number ?? "");
        setInvoiceChangedForOwner(false);
        setInvoiceChangedForLessee(false);

        setOwnerInvoiceNetDays(workOrder.invoice_net_days ?? 0);
        setOwnerInvoiceNetDaysOriginal(workOrder.invoice_net_days ?? 0);
        setLesseeInvoiceNetDays(workOrder.secondary_owner_info?.invoice_net_days ?? 0);
        setLesseeInvoiceNetDaysOriginal(workOrder.secondary_owner_info?.invoice_net_days ?? 0);
        setInvoiceNetDaysChangedForOwner(false);
        setInvoiceNetDaysChangedForLessee(false);

//        console.log(workOrder.secondary_owner_info);
        setOwnerInvoiceDate(workOrder.invoice_date ?? null);
        setOwnerInvoiceDateOriginal(workOrder.invoice_date ?? null);

        setOwnerDueDateOriginal(new Date(addDays(workOrder.invoice_date ?? new Date(), workOrder.invoice_net_days ?? 0)));

        const secondaryOwnerInfo = workOrder.secondary_owner_info ?? {};
        setLesseeInvoiceDate(secondaryOwnerInfo.invoice_date ?? process.env.REACT_APP_DEFAULT_DATE);
        setLesseeInvoiceDateOriginal(secondaryOwnerInfo.invoice_date ?? process.env.REACT_APP_DEFAULT_DATE);

        const invDateLessee = secondaryOwnerInfo.invoice_date ?? process.env.REACT_APP_DEFAULT_DATE;
        const invNetDateLessee = secondaryOwnerInfo.invoice_net_days ?? 0;

        setLesseeDueDateOriginal(invDateLessee !== process.env.REACT_APP_DEFAULT_DATE ? new Date(addDays(invDateLessee, invNetDateLessee)) : null);

        setInvoiceDateChangedForOwner(false);
        setInvoiceDateChangedForLessee(false);

//        console.log(lesseeInvoiceDate);
        setMo_wk(workOrder.mo_wk ?? 0);
        setSP(workOrder.sp ?? 0);
        setTQ(workOrder.tq ?? 0);
        setRE(workOrder.re ?? 0);
        setEP(workOrder.ep ?? 0);
        setOwnerInvoiceNumber(workOrder.invoice_number ?? "");
        setOwnerInvoiceNumberOriginal(workOrder.invoice_number ?? "");
        setLesseeInvoiceNumber(secondaryOwnerInfo.invoice_number ?? "");
        setLesseeInvoiceNumberOriginal(secondaryOwnerInfo.invoice_number ?? "");
        setIsBilledToLessee(
            secondaryOwnerInfo && Object.keys(secondaryOwnerInfo).length > 0 ? true : false
        );
        calculateJobCosts(workOrder.joblist ?? []);

        workOrder.joblist?.sort((a, b) => a.line_number - b.line_number);
        getRailCarTimeLog();
        setStorageInformation(workOrder.storage_information ?? {});
        fetchPartReport()
    }, [workOrder]);


    const fetchPartReport = async () => {
        try {
            const response = await axios.get(
                process.env.REACT_APP_BIRCH_API_URL+`get_part_report_for_work_order/?work_order=${workOrder.work_order}`
            );
            setPartReport(response.data);
        } catch (err) {
            console.error("Error fetching part report:", err);
        } finally {

        }
    };

    const getRailCarTimeLog =async () => {
        const response = await axios.get(`${process.env.REACT_APP_BIRCH_API_URL}get_time_log_by_work_id/${workOrder.id}`);
//        console.log(response)
        setRailcarLog(response.data)
    }
    const formatDateToSQL = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    const handleDropdownChangeInDetails = (e, workId) => {
        setupdatedStatusCode(e.target.value)
        setIsStatusDropDownModalOpenInDetails(true)
    }

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

    //const statusTextArea = useRef(null);

    const closeModal = () => {
        if (orderDetailsModalRef.current) {
            orderDetailsModalRef.current.close();
        }
    }
    function scrollToTop() {
        const modalContent = document.getElementById('orderDetailsModal');
        if (modalContent) {
            modalContent.scrollTop = 0; // Scroll to the top
        }
    }
    const postMOWKUpdate = () => {
        updateMOWK(workOrder.id, mo_wk)
    }
    const postSPUpdate = () => {
        updateSP(workOrder.id, sp)
    }
    const postTQUpdate = () => {
        updateTQ(workOrder.id, tq)
    }

    const postREUpdate = () => {
        updateRE(workOrder.id, re)
    }

    const postEPUpdate = () => {
        updateEP(workOrder.id, ep)
    }

    const handleIsBilledToLessee = (e) => {
        const is_checked = e.target.checked
        if (is_checked) {
            updateBillToLessee(workOrder.id, workOrder.railcar.owner_railcar_lessee_idToowner.id, true, workOrder.work_order)
            setIsBilledToLessee(true)
            setJobs(workOrder.joblist)
        } else {
            updateBillToLessee(workOrder.id, workOrder.railcar.owner_railcar_lessee_idToowner.id, false, workOrder.work_order)
            setIsBilledToLessee(false)
            setJobs(workOrder.joblist)
        }
    }

    const deleteWorkOrder = (id,work_order) =>{
        const confirmDelete = window.confirm("Are you sure you want to delete this work order?");

        if (confirmDelete) {
            const requestData = {
                work_order: work_order,
                id: id,
                user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["id"]
            };

            axios.post(process.env.REACT_APP_BIRCH_API_URL + 'delete_workorder/', requestData)
                .then(response => {
                    console.log('Success:', response.data);
                    if (response.status === 200) {
                        closeModal();
                    }
                })
                .catch(error => {
                    console.error('Error:', error.response ? error.response.data : error.message);
                });
        }
    }

    const changeNetDays = (isForOwner, days,) => {
        if (isForOwner) {
            if (days != ownerInvoiceNetDays) {
                console.log(days)
                setOwnerInvoiceNetDays(days)
                // setInvoiceNetDaysChangedForOwner(true)
                checkBillingInformationChangedForOwner()
            }

        } else {
            if (days != lesseeInvoiceNetDays) {
                setLesseeInvoiceNetDays(days)
                setLesseeInvoiceNetDays(days)
                setInvoiceNetDaysChangedForLessee(true)
                //checkBillingInformationChangedForOwner()
            }
        }
    }

    const handleArrivalDate = (newDate) => {
        updateArrivalDate(workOrder.id, newDate)
        newDate == null ? workOrder.arrival_date = process.env.REACT_APP_DEFAULT_DATE : workOrder.arrival_date = new Date(newDate)
    }

    const handleInspectionDate = (newDate) => {
        updateInspectedDate(workOrder.id, newDate)
        newDate == null ? workOrder.inspected_date = process.env.REACT_APP_DEFAULT_DATE : workOrder.inspected_date = new Date(newDate)
    }

    const handleCleanDate = (newDate) => {
        updateCleanDate(workOrder.id, newDate)
        newDate == null ? workOrder.clean_date = process.env.REACT_APP_DEFAULT_DATE : workOrder.clean_date = new Date(newDate)
    }
    const handleRepairScheduleDate = (newDate) => {
        updateRepairScheduleDate(workOrder.id, newDate)
        newDate == null ? workOrder.repair_schedule_date = process.env.REACT_APP_DEFAULT_DATE : workOrder.repair_schedule_date = new Date(newDate)
    }
    const handlePaintDate = (newDate) => {
        updatePaintDate(workOrder.id, newDate)
        newDate == null ? workOrder.paint_date = process.env.REACT_APP_DEFAULT_DATE : workOrder.paint_date = new Date(newDate)
    }

    const handleExteriorPaintDate = (newDate) => {
        updateExteriorPaintDate(workOrder.id, newDate)
        newDate == null ? workOrder.exterior_paint = process.env.REACT_APP_DEFAULT_DATE : workOrder.exterior_paint = new Date(newDate)
    }


    const handlePDDate = (newDate) => {
        updatePDDate(workOrder.id, newDate)
        newDate == null ? workOrder.pd_date = process.env.REACT_APP_DEFAULT_DATE : workOrder.pd_date = new Date(newDate)
    }

    const handleValveTearDownDate = (newDate) => {
        updateValveTearDownDate(workOrder.id, newDate)
        newDate == null ? workOrder.valve_tear_down = process.env.REACT_APP_DEFAULT_DATE : workOrder.valve_tear_down = new Date(newDate)
    }

    const handleValveAssemblyDate = (newDate) => {
        updateValveAssemblyDate(workOrder.id, newDate)
        newDate == null ? workOrder.valve_date = process.env.REACT_APP_DEFAULT_DATE : workOrder.valve_date = new Date(newDate)
    }

    const handleRepairDate = (newDate) => {
        updateRepairDate(workOrder.id, newDate)
        newDate == null ? workOrder.repair_date = process.env.REACT_APP_DEFAULT_DATE : workOrder.repair_date = new Date(newDate)
    }
    const handleFinalDate = (newDate) => {
        updateFinalDate(workOrder.id, newDate)
        newDate == null ? workOrder.final_date = process.env.REACT_APP_DEFAULT_DATE : workOrder.final_date = new Date(newDate)
    }

    const handleQADate = (newDate) => {
        console.log(newDate)
        updateQADate(workOrder.id, newDate)
        newDate == null ? workOrder.qa_date = process.env.REACT_APP_DEFAULT_DATE : workOrder.qa_date = new Date(newDate)
    }

    const handlePOD = (newDate) => {
        console.log(newDate)
        updatePOD(workOrder.id, newDate)
        newDate == null ? workOrder.projected_out_date = process.env.REACT_APP_DEFAULT_DATE : workOrder.projected_out_date = new Date(newDate)
    }

    const handleMTI = (newDate) => {
        updateMTI(workOrder.id, newDate)
        newDate == null ? workOrder.month_to_invoice = process.env.REACT_APP_DEFAULT_DATE : workOrder.month_to_invoice = new Date(newDate)
    }

    const handleMOWK = (event) => {
        setMo_wk(event.target.value)
    }

    const handleSP = (event) => {
        setSP(event.target.value)
    }

    const handleTQ = (event) => {
        setTQ(event.target.value)
    }

    const handleRE = (event) => {
        setRE(event.target.value)
    }

    const handleEP = (event) => {
        setEP(event.target.value)
    }


    //handleShipped
    const handleShipped = (newDate) => {
        updateMarkAsShipped(workOrder.id, newDate)
        newDate == null ? workOrder.shipped_date = process.env.REACT_APP_DEFAULT_DATE : workOrder.shipped_date = new Date(newDate)
    }

    const handleUpdateReasonToCome = () => {
        updateReasonToCome(workOrder.id, reasonToCome)
        setIsReasonToComeChanged(false)
        setReasonToCome(reasonToCome)
    }

    const handleCancelReasonToCome = () => {
        setIsReasonToComeChanged(false)
        setReasonToCome(workOrder.reason_to_come)
    }

    const handleInvoiceClickOwner = () => {
        if (ownerInvoiceNumber == "") {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: process.env.REACT_APP_BIRCH_API_URL + 'get_last_invoice',
                headers: {}
            };

            axios.request(config)
                .then((response) => {
                    setOwnerInvoiceNumber(invoiceGeneratorFromLastInvoce(response.data[0].f0))
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            setOwnerInvoiceNumber(invoiceGeneratorFromLastInvoce(ownerInvoiceNumber))
        }
    }
    //handleInvoiceNumberChangeOwner

    const handleInvoiceClickLessee = () => {
        if (lesseeInvoiceNumber == null || lesseeInvoiceNumber == "") {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: process.env.REACT_APP_BIRCH_API_URL + 'get_last_invoice',
                headers: {}
            };

            axios.request(config)
                .then((response) => {
                    console.log(response.data[0].f0)
                    setLesseeInvoiceNumber(invoiceGeneratorFromLastInvoce(response.data[0].f0))
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            setLesseeInvoiceNumber(invoiceGeneratorFromLastInvoce(lesseeInvoiceNumber))
        }
    }


    const invoiceGeneratorFromLastInvoce = (last_invoice_number) => {
        let lastFour = last_invoice_number.slice(-4)
        return workOrder.yard.invoice_identifier + new Date().getFullYear().toString() + (parseInt(lastFour) + 1).toString().padStart(4, '0')
    }


    const getValueByIdStatusCommentDropDown = (id) => {
        const element = statusCommentDropDownInDetails.current;
        if (element && element.id === id) {
            return element.value;
        }
        return null;
    };

    const getValueByIdReasonToCome = (id) => {
        const element = reasonToComeRef.current;
        if (element && element.id === id) {
            return element.value;
        }
        return null;
    };

    const getValueByIdMOWK = (id) => {
        const element = mowkRef.current;
        console.log(element)
        if (element && element.id === id) {
            setMo_wk(element.value)
            return element.value;
        }
        return null;
    };

    const postStatusFromDetails = () => {
        var comment = getValueByIdStatusCommentDropDown("statusUpdateMessageFromDropDownInDetails");
        if (comment == null || comment.length === 0) {
            return
        }
        let data = qs.stringify({
            'work_id': workOrder.id,
            'user_id': JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id'],
            'status_id': updatedStatusCode.split(":")[0],
            'source': "order_details",
            'comment': comment
        });
        console.log(data)
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
                console.log(response)
                updateWorkUpdates(workOrder.id, response.data, updatedStatusCode.split(":")[1])
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

    function sumOfDayDifferences(storageInformation) {
        console.log("sss")
        console.log(storageInformation)
        const today = new Date();

        const sum = storageInformation.reduce((acc, item) => {
            if (item.is_billed === 0) {
                const startDate = new Date(item.start_date);
                let endDate = item.end_date ? new Date(item.end_date) : today;

                // Calculate the difference in milliseconds
                const diffInMs = endDate - startDate;

                // Convert milliseconds to days
                const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

                return acc + diffInDays;
            }
            return acc;
        }, 0);
        console.log(sum)
        return (sum % 1 > 0.5) ? Math.ceil(sum) : 0;
    }

    const handleReasonToComeChange = (event) => {
        const value = event.target.value.toString()

        if (value.toLowerCase() !== workOrder.reason_to_come.toString().toLowerCase()) {
            console.log("changed")
            setIsReasonToComeChanged(true)
            setReasonToCome(value)
        } else {
            console.log("not changed")
            setIsReasonToComeChanged(false)
            setReasonToCome(workOrder.reason_to_come)
        }
    }


    const handleOwnerPurchaseOrderChange = (event) => {
        const value = event.target.value.toString()
        setOwnerPurchaseOrder(() => value)

        // console.log(value)
        // console.log(workOrder.purchase_order)
        // if (value !==  workOrder.purchase_order.toString().toLowerCase()) {
        //     console.log("Here called")
        //     setTimeout(() => {
        //         setOwnerPurchaseOrder(()=>value)
        //         console.log(ownerPurchaseOrder)
        //         setPurchaseOrderChangedForOwner(() => true)// This will log the updated state value
        //         console.log(purchaseorderChangedForOwner)
        //     }, 100);
        //
        // } else {
        //     console.log("Here called no change")
        //     setTimeout(() => {
        //         setOwnerPurchaseOrder(()=>workOrder.purchase_order)
        //         setPurchaseOrderChangedForOwner(() => false) // This will log the updated state value
        //     }, 100);
        //
        //
        //     console.log(purchaseorderChangedForOwner)
        // }
        checkBillingInformationChangedForOwner()
    }
    const handleLesseePurchaseOrderChange = (event) => {
        const value = event.target.value.toString()
        setLesseePurchaseOrder(() => value)
    }

    const handleInvoiceNumberChangeOwner = (event) => {
        const value = event.target.value.toString().trim()
        setOwnerInvoiceNumber(() => value)
    }

    const handleInvoiceNumberChangeLessee = (event) => {
        const value = event.target.value.toString().trim()
        setLesseeInvoiceNumber(value)
    }

    const handleOwnerInvoiceDateChanged = (value) => {
        console.log(value)
        console.log(value.toLocaleString())
        console.log(toSqlDatetime(value))
        setOwnerInvoiceDate(value)
    }

    function toSqlDatetime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const handleLesseeInvoiceDateChanged = (value) => {
        console.log("lessee invoice date changed")
        setLesseeInvoiceDate(value)
    }


    const handleDueDateChanged = (isFowOwner, date) => {
        console.log("due date is changed")
        const date1 = date;
        const date2 = new Date(isFowOwner ? ownerInvoiceDate : lesseeInvoiceDate);
        const timeDifference = date1.getTime() - date2.getTime();
        const dayDifference = timeDifference / (1000 * 3600 * 24);
        console.log(dayDifference)
        if (isFowOwner) {
            setOwnerInvoiceNetDays(dayDifference)
        } else {
            setLesseeInvoiceNetDays(dayDifference)
        }
    }


    const cancelOwnerBillingInformationChange = () => {
        setOwnerInvoiceDate(convertSqlToFormattedDate(workOrder.invoice_date))
        setOwnerInvoiceNumber(workOrder.invoice_number)
        setOwnerInvoiceNetDays(workOrder.invoice_net_days)
        setOwnerPurchaseOrder(workOrder.purchase_order)
        setIsBillingInformationChangedForOwner(false)
    }

    const updateBillingInformation = async (isForOwner) => {
        console.log(ownerInvoiceDate)
        if (isForOwner) {
            const result =  await updateBilling(true, workOrder.id, ownerPurchaseOrder, ownerInvoiceNumber, ownerInvoiceDate, ownerInvoiceNetDays)
            if(result){
                setOwnerPurchaseOrderOriginal(ownerPurchaseOrder)
                setOwnerInvoiceNumberOriginal(ownerInvoiceNumber)
                setOwnerInvoiceDateOriginal(ownerInvoiceDate)
                setOwnerInvoiceNetDaysOriginal(ownerInvoiceNetDays)
                setShowButtonsOwner(false)
            }
        } else {
            const result = await updateBilling(false, workOrder.id, lesseePurchaseOrder, lesseeInvoiceNumber, lesseeInvoiceDate, lesseeInvoiceNetDays)
            if(result){
                setLesseePurchaseOrder(lesseePurchaseOrder)
                setLesseeInvoiceNumber(lesseeInvoiceNumber)
                setLesseeInvoiceDate(lesseeInvoiceDate)
                setLesseeInvoiceNetDays(lesseeInvoiceNetDays)
                setShowButtonsLessee(false)
            }
        }
    }

    const formatTasks = (tasks) => {
        const taskMap = new Map();
        // Populate hashmap
        tasks.forEach(task => {
            const {task_description, user_routing_matrix_task_assignment_assigneeTouser} = task;
            const {name} = user_routing_matrix_task_assignment_assigneeTouser;

            if (!taskMap.has(task_description)) {
                taskMap.set(task_description, []);
            }
            taskMap.get(task_description).push(name);
        });

        // Generate formatted string
        let result = "";
        taskMap.forEach((users, description) => {
            const userList = users.join('/');
            result += `${description}: ${userList}\n`;
        });

        return result.trim(); // Remove trailing newline
    }

    const updateStorage = async (is_checked) =>{

        workOrder.is_storage = is_checked?1:0
        const result = await handleStorageUpdate(workOrder.id,is_checked)
        if(result!==200){
            workOrder.is_storage = !is_checked?1:0
        }
    }

    const updateLockForTimeClocking = async (is_checked) =>{

        workOrder.locked_for_time_clocking = is_checked?1:0
        const result = await handIsLockedForTimeClocking(workOrder.id,is_checked)
        if(result!==200){
            workOrder.locked_for_time_clocking = !is_checked?1:0
        }
    }

    const [openDialog, setOpenDialog] = useState(false);
    const [docToDownload, setDocToDownload] = useState('');


    const handleListItemClick = (what_to_download) => {

        if (isBilledToLessee) {
            if(what_to_download==='aar'){
                setDocToDownload("aar")
            }else if(what_to_download === 'brc'){
                setDocToDownload("brc")
            }else if(what_to_download==='invoice'){
                setDocToDownload("invoice")
            }
            setOpenDialog(true);
        } else {
            if(what_to_download==='aar'){
                //alert("here")
                printAAR(workOrder, false, 1);
            }else if(what_to_download === 'brc'){
                printBRC(workOrder,1)
            }else if(what_to_download==='invoice'){
                if(workOrder.railcar.owner_railcar_owner_idToowner.is_po == 1){
                    if(workOrder.purchase_order != ''){
                        printInvoice(workOrder,1)
                    }else {
                        alert("Purchase order required")
                    }
                }else {
                    printInvoice(workOrder,1)
                }

            }
        }
    };

    const handleDialogClose = () => {
        window.history.pushState(null, null, window.location.pathname); // Removes the hash by setting the URL to the current path
        setDocToDownload("");
        setOpenDialog(false);
    };



    const handleButtonClick = (option) => {
        console.log(docToDownload)
        if (option === 'owner') {
            if(docToDownload==='aar'){
                const item= {
                    "id": 2767,
                    "railcar_id": "MFCX132275",
                    "work_order": "WO_02625",
                    "arrival_date": "2024-12-09T06:00:00.000Z",
                    "inspected_date": "2024-12-10T06:00:00.000Z",
                    "estimated_date": "1900-01-01T00:00:00.000Z",
                    "approved_date": "1900-01-01T00:00:00.000Z",
                    "clean_date": "2024-12-13T06:00:00.000Z",
                    "repair_schedule_date": "2024-12-18T06:00:00.000Z",
                    "paint_date": "1900-01-01T00:00:00.000Z",
                    "exterior_paint": "1900-01-01T00:00:00.000Z",
                    "repair_date": "2025-03-01T06:00:00.000Z",
                    "valve_date": "1900-01-01T00:00:00.000Z",
                    "valve_tear_down": "1900-01-01T00:00:00.000Z",
                    "final_date": "2025-03-01T06:00:00.000Z",
                    "qa_date": "2025-03-01T06:00:00.000Z",
                    "pd_date": "1900-01-01T00:00:00.000Z",
                    "projected_out_date": "2025-02-27T06:00:00.000Z",
                    "month_to_invoice": "1900-01-01T00:00:00.000Z",
                    "mo_wk": null,
                    "material_eta": "1900-01-01T00:00:00.000Z",
                    "blast_date": "1900-01-01T00:00:00.000Z",
                    "sp": null,
                    "tq": null,
                    "re": null,
                    "ep": null,
                    "invoice_date": "2025-03-07T06:00:00.000Z",
                    "el_index": "U",
                    "is_storage": 0,
                    "is_electrical": 0,
                    "locked_for_time_clocking": 1,
                    "locked_by": 55,
                    "shipped_date": "2025-03-08T06:00:00.000Z",
                    "finalized_date": "2025-03-12T20:20:46.000Z",
                    "finished_date": "1900-01-01T00:00:00.000Z",
                    "invoice_net_days": 30,
                    "invoice_number": "IHS20251366",
                    "purchase_order": "",
                    "reason_to_come": "Qualification",
                    "joblist": [
                        {
                            "id": 43101,
                            "line_number": 1,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "8512",
                                "title": "SWITCHING CHARGES",
                                "time_custom": 3,
                                "time_standard": 3,
                                "job_or_revenue_category": {
                                    "id": 17,
                                    "name": "ADMIN"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "SWITCH IN / OUT FEE ",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "8512",
                                "title": "SWITCHING CHARGES",
                                "time_custom": 3,
                                "time_standard": 3,
                                "job_or_revenue_category": {
                                    "id": 17,
                                    "name": "ADMIN"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 350,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61501,
                                    "part_id": 52722,
                                    "quantity": 1,
                                    "totalcost": 350,
                                    "purchase_cost": 350,
                                    "markup_percent": 0,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 350,
                                        "code": "80-1800022",
                                        "title": "INTERNAL SWITCHING",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": null,
                                        "parts_group": {
                                            "id": 4,
                                            "name": "CLEANING"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": null,
                            "crews": null,
                            "manager_checked_time": null,
                            "user_joblist_manager_checked_byTouser": null,
                            "qa_checked_time": null,
                            "user_joblist_qa_checked_byTouser": null
                        },
                        {
                            "id": 43102,
                            "line_number": 2,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "8518",
                                "title": "INBOUND INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 17,
                                    "name": "ADMIN"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "INBOUND INSPECTION/ESTIMATION-OUTBOUND INSPECTION/PREPARATION-",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "8518",
                                "title": "INBOUND INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 17,
                                    "name": "ADMIN"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 760,
                            "labor_time": 8,
                            "labor_rate": 95,
                            "material_cost": 3.92,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61502,
                                    "part_id": 52150,
                                    "quantity": 3,
                                    "totalcost": 3.9168,
                                    "purchase_cost": 1.02,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": null,
                                    "parts": {
                                        "price": 1.02,
                                        "code": "18-5920008",
                                        "title": "TAMPER SEAL. CABLE MCLP180 2K 12IN W/LOGO  RED",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 759,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 18,
                                            "name": "VALVE"
                                        }
                                    }
                                }
                            ],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 2417
                                }
                            ],
                            "crew_checked_time": null,
                            "crews": null,
                            "manager_checked_time": null,
                            "user_joblist_manager_checked_byTouser": null,
                            "qa_checked_time": null,
                            "user_joblist_qa_checked_byTouser": null
                        },
                        {
                            "id": 43103,
                            "line_number": 3,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "HOLD POINT - CONFIRM ALL NECESSARY INBOUND / COMMODITY PHOTOS HAVE BEEN CAPTURED",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2024-12-13T20:31:55.000Z",
                            "crews": {
                                "id": 43,
                                "name": "RANDY JOHNSON",
                                "certificate": ""
                            },
                            "manager_checked_time": "2024-12-13T20:36:02.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 50,
                                "name": "Manny Montes"
                            },
                            "qa_checked_time": "2025-03-01T22:25:12.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43104,
                            "line_number": 4,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "8008",
                                "title": "Steam Cleaning",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 13,
                                    "name": "CLEAN"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "METHANOL - BASE CLEANING",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "8008",
                                "title": "Steam Cleaning",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 13,
                                    "name": "CLEAN"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 1330,
                            "labor_time": 14,
                            "labor_rate": 95,
                            "material_cost": 1430,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61503,
                                    "part_id": 54213,
                                    "quantity": 1,
                                    "totalcost": 1430,
                                    "purchase_cost": 1430,
                                    "markup_percent": 0,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 1430,
                                        "code": "67-56-1-B",
                                        "title": "METHANOL BASE CLEANING",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": null,
                                        "parts_group": {
                                            "id": 4,
                                            "name": "CLEANING"
                                        }
                                    }
                                }
                            ],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 14295
                                },
                                {
                                    "logged_time_in_seconds": 17389
                                }
                            ],
                            "crew_checked_time": "2024-12-13T20:31:58.000Z",
                            "crews": {
                                "id": 43,
                                "name": "RANDY JOHNSON",
                                "certificate": ""
                            },
                            "manager_checked_time": "2024-12-13T20:36:05.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 50,
                                "name": "Manny Montes"
                            },
                            "qa_checked_time": "2025-03-01T22:25:01.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43105,
                            "line_number": 5,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "8017",
                                "title": "Liquid Heel Disposal",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 13,
                                    "name": "CLEAN"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "ADDTIONAL DISPOSAL TO BE DETERMINED\t",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "8017",
                                "title": "Liquid Heel Disposal",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 13,
                                    "name": "CLEAN"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2024-12-13T20:32:02.000Z",
                            "crews": {
                                "id": 43,
                                "name": "RANDY JOHNSON",
                                "certificate": ""
                            },
                            "manager_checked_time": "2024-12-13T20:36:07.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 50,
                                "name": "Manny Montes"
                            },
                            "qa_checked_time": "2025-03-01T22:25:02.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43106,
                            "line_number": 6,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9805",
                                "title": "AIR TEST OF TANK AND VALVES (LOW PRESSURE)",
                                "time_custom": 2,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "PERFORM PRELIMINARY LEAK TEST OF TANK AND VALVES",
                            "whymadecode": {
                                "code": "25",
                                "title": "Owner's request"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9805",
                                "title": "AIR TEST OF TANK AND VALVES (LOW PRESSURE)",
                                "time_custom": 2,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 285,
                            "labor_time": 3,
                            "labor_rate": 95,
                            "material_cost": 8.67,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61505,
                                    "part_id": 52313,
                                    "quantity": 0.25,
                                    "totalcost": 8.6688,
                                    "purchase_cost": 27.09,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 27.09,
                                        "code": "80-1800005",
                                        "title": "LEAK DETECTION SOLUTION",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 7,
                                            "name": "GAL"
                                        },
                                        "qb_parts": null,
                                        "parts_group": {
                                            "id": 18,
                                            "name": "VALVE"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": "2025-02-28T16:09:41.000Z",
                            "crews": {
                                "id": 102,
                                "name": "THOMAS PAUL",
                                "certificate": "NDT LT, PT"
                            },
                            "manager_checked_time": "2025-02-28T17:43:28.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:25:03.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43107,
                            "line_number": 7,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "4728",
                                "title": "SAFETY VALVE RETEST",
                                "time_custom": 4,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 356,
                                "code": "QM",
                                "title": "SAFETY VALVE"
                            },
                            "job_description": "REMOVE AND PRELIMINARY BENCH TEST SAFETY VALVE ",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "4728",
                                "title": "SAFETY VALVE RETEST",
                                "time_custom": 4,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 356,
                                "code": "QM",
                                "title": "SAFETY VALVE"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 190,
                            "labor_time": 2,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2025-02-28T16:10:38.000Z",
                            "crews": {
                                "id": 122,
                                "name": "SETH TAYLOR",
                                "certificate": "NDT LT"
                            },
                            "manager_checked_time": "2025-02-28T17:43:30.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:25:04.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43108,
                            "line_number": 8,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "4450",
                                "title": "LABOR FREIGHT CAR",
                                "time_custom": 1,
                                "time_standard": 1,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 384,
                                "code": "RR",
                                "title": "TANK SHELL"
                            },
                            "job_description": "HOLD POINT- TAKE INTERIOR PHOTOS AFTER CLEANING VERIFICATION",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "4450",
                                "title": "LABOR FREIGHT CAR",
                                "time_custom": 1,
                                "time_standard": 1,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 384,
                                "code": "RR",
                                "title": "TANK SHELL"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2024-12-13T20:32:09.000Z",
                            "crews": {
                                "id": 43,
                                "name": "RANDY JOHNSON",
                                "certificate": ""
                            },
                            "manager_checked_time": "2024-12-13T20:36:13.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 50,
                                "name": "Manny Montes"
                            },
                            "qa_checked_time": "2025-03-01T22:25:06.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43109,
                            "line_number": 9,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "hold point - INSPECT TANK INTERIOR",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2024-12-13T20:32:12.000Z",
                            "crews": {
                                "id": 43,
                                "name": "RANDY JOHNSON",
                                "certificate": ""
                            },
                            "manager_checked_time": "2024-12-13T20:36:15.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 50,
                                "name": "Manny Montes"
                            },
                            "qa_checked_time": "2025-03-01T22:25:07.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43110,
                            "line_number": 10,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "HOLD POINT - CONFIRM CAPTURE OF INTERIOR CLEAN PHOTOS",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2024-12-13T20:32:15.000Z",
                            "crews": {
                                "id": 43,
                                "name": "RANDY JOHNSON",
                                "certificate": ""
                            },
                            "manager_checked_time": "2024-12-13T20:36:17.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 50,
                                "name": "Manny Montes"
                            },
                            "qa_checked_time": "2025-03-01T22:25:08.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43111,
                            "line_number": 11,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "4450",
                                "title": "LABOR FREIGHT CAR",
                                "time_custom": 1,
                                "time_standard": 1,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 384,
                                "code": "RR",
                                "title": "TANK SHELL"
                            },
                            "job_description": "INTERIOR CORROSION INSPECTION",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "4450",
                                "title": "LABOR FREIGHT CAR",
                                "time_custom": 1,
                                "time_standard": 1,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 384,
                                "code": "RR",
                                "title": "TANK SHELL"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 95,
                            "labor_time": 1,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2024-12-16T12:48:02.000Z",
                            "crews": {
                                "id": 124,
                                "name": "JORDAN TESTON",
                                "certificate": "WELDER JAT; NDT VT"
                            },
                            "manager_checked_time": "2024-12-16T12:48:06.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 6,
                                "name": "Clayton Drake"
                            },
                            "qa_checked_time": "2025-03-01T22:25:10.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43112,
                            "line_number": 12,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "4404",
                                "title": "BOLT, COMMON STANDARD",
                                "time_custom": 0.3,
                                "time_standard": 0.3,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 329,
                                "code": "PH",
                                "title": "LONGITUDINAL RUNNING BOARD"
                            },
                            "job_description": "renew top running board bolts / nuts",
                            "whymadecode": {
                                "code": "18",
                                "title": "Loose"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "4404",
                                "title": "BOLT, COMMON STANDARD",
                                "time_custom": 0.3,
                                "time_standard": 0.3,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 329,
                                "code": "PH",
                                "title": "LONGITUDINAL RUNNING BOARD"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 61.75,
                            "labor_time": 0.65,
                            "labor_rate": 95,
                            "material_cost": 2.93,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61506,
                                    "part_id": 39381,
                                    "quantity": 1,
                                    "totalcost": 0.7808,
                                    "purchase_cost": 0.61,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 0.61,
                                        "code": "02-1060023",
                                        "title": "BOLT. HEX HEAD. 1/2IN13X21/4IN. GR5",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 7691,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 2,
                                            "name": "BOLT"
                                        }
                                    }
                                },
                                {
                                    "id": 61507,
                                    "part_id": 42857,
                                    "quantity": 2,
                                    "totalcost": 0.3584,
                                    "purchase_cost": 0.14,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 0.14,
                                        "code": "16-4320015",
                                        "title": "FLAT WASHER. 1/2IN GRADE 5 ZINC",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 2689,
                                            "on_po": 5000
                                        },
                                        "parts_group": {
                                            "id": 16,
                                            "name": "SECUREMENT"
                                        }
                                    }
                                },
                                {
                                    "id": 61508,
                                    "part_id": 42931,
                                    "quantity": 1,
                                    "totalcost": 1.792,
                                    "purchase_cost": 1.4,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 1.4,
                                        "code": "16-4340022",
                                        "title": "NUT. 1/2IN13 PD HOPPER",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 820,
                                            "on_po": 1000
                                        },
                                        "parts_group": {
                                            "id": 16,
                                            "name": "SECUREMENT"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": "2024-12-16T20:00:04.000Z",
                            "crews": {
                                "id": 31,
                                "name": "RONALD NEWMAN",
                                "certificate": "Welder RGN; NDT VT"
                            },
                            "manager_checked_time": "2024-12-16T12:48:12.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 6,
                                "name": "Clayton Drake"
                            },
                            "qa_checked_time": "2025-03-01T22:24:44.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43113,
                            "line_number": 13,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9164",
                                "title": "PRESSURE PLATE, GENERAL PURPOSE CAR",
                                "time_custom": 0,
                                "time_standard": 0.5,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 2,
                                "code": "02",
                                "title": "release from service"
                            },
                            "job_description": "REMOVE AND REAPPLY FITTINGS PLATE - RENEW GASKET - MATERIAL ONLY",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9164",
                                "title": "PRESSURE PLATE, GENERAL PURPOSE CAR",
                                "time_custom": 0,
                                "time_standard": 0.5,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 2,
                                "code": "02",
                                "title": "release from service"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 334.07,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61509,
                                    "part_id": 48430,
                                    "quantity": 1,
                                    "totalcost": 334.0672,
                                    "purchase_cost": 260.99,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 260.99,
                                        "code": "18-5133479",
                                        "title": "GASKET TEADIT 1570E. EAGLE 1/8INX243/4INX223/4IN. TEADIT 1570E",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 33,
                                            "on_po": 1
                                        },
                                        "parts_group": {
                                            "id": 18,
                                            "name": "VALVE"
                                        }
                                    }
                                }
                            ],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 1329
                                }
                            ],
                            "crew_checked_time": "2025-02-28T00:37:02.000Z",
                            "crews": {
                                "id": 159,
                                "name": "JUSTIN FITZGERALD",
                                "certificate": ""
                            },
                            "manager_checked_time": "2025-02-28T14:18:55.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 30,
                                "name": "Joe Nelson"
                            },
                            "qa_checked_time": "2025-03-01T22:24:46.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43114,
                            "line_number": 14,
                            "locationcode": {
                                "code": "B",
                                "title": "B end"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "4458",
                                "title": "LABOR, JACK CAR",
                                "time_custom": 3,
                                "time_standard": 0.829,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "RAISE AND LOWER CAR",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "4458",
                                "title": "LABOR, JACK CAR",
                                "time_custom": 3,
                                "time_standard": 0.829,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 5.34,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 76722,
                                    "part_id": 42829,
                                    "quantity": 2,
                                    "totalcost": 2.3296,
                                    "purchase_cost": 0.91,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 0.94,
                                        "code": "16-4300001",
                                        "title": "WEDGE COTTER PIN. 5/16INX3IN",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 267,
                                            "on_po": 1000
                                        },
                                        "parts_group": {
                                            "id": 16,
                                            "name": "SECUREMENT"
                                        }
                                    }
                                },
                                {
                                    "id": 61511,
                                    "part_id": 43473,
                                    "quantity": 1,
                                    "totalcost": 3.008,
                                    "purchase_cost": 2.35,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": null,
                                    "parts": {
                                        "price": 2.35,
                                        "code": "17-4450001",
                                        "title": "LUBE DISC. CENTER PLATE MOLYBDENUM DISULPHIDE",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 237,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 17,
                                            "name": "TRUCK"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": "2024-12-17T22:10:07.000Z",
                            "crews": {
                                "id": 167,
                                "name": "WESLEY CUNNINGHAM",
                                "certificate": ""
                            },
                            "manager_checked_time": "2024-12-17T12:48:15.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 6,
                                "name": "Clayton Drake"
                            },
                            "qa_checked_time": "2025-03-01T22:24:47.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43115,
                            "line_number": 15,
                            "locationcode": {
                                "code": "A",
                                "title": "A end"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "4458",
                                "title": "LABOR, JACK CAR",
                                "time_custom": 3,
                                "time_standard": 0.829,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "RAISE AND LOWER CAR",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "4458",
                                "title": "LABOR, JACK CAR",
                                "time_custom": 3,
                                "time_standard": 0.829,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 4.17,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 76721,
                                    "part_id": 42829,
                                    "quantity": 1,
                                    "totalcost": 1.1648,
                                    "purchase_cost": 0.91,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 0.94,
                                        "code": "16-4300001",
                                        "title": "WEDGE COTTER PIN. 5/16INX3IN",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 267,
                                            "on_po": 1000
                                        },
                                        "parts_group": {
                                            "id": 16,
                                            "name": "SECUREMENT"
                                        }
                                    }
                                },
                                {
                                    "id": 61513,
                                    "part_id": 43473,
                                    "quantity": 1,
                                    "totalcost": 3.008,
                                    "purchase_cost": 2.35,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": null,
                                    "parts": {
                                        "price": 2.35,
                                        "code": "17-4450001",
                                        "title": "LUBE DISC. CENTER PLATE MOLYBDENUM DISULPHIDE",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 237,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 17,
                                            "name": "TRUCK"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": "2024-12-17T22:10:09.000Z",
                            "crews": {
                                "id": 167,
                                "name": "WESLEY CUNNINGHAM",
                                "certificate": ""
                            },
                            "manager_checked_time": "2024-12-17T12:48:18.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 6,
                                "name": "Clayton Drake"
                            },
                            "qa_checked_time": "2025-03-01T22:24:49.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43116,
                            "line_number": 16,
                            "locationcode": {
                                "code": "A",
                                "title": "A end"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9820",
                                "title": "TANK CAR QUALIFICATION- JACKETED, INSULATED, ",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "PERFORM HM216 TANK QUALIFICATION - A END",
                            "whymadecode": {
                                "code": "25",
                                "title": "Owner's request"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9820",
                                "title": "TANK CAR QUALIFICATION- JACKETED, INSULATED, ",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 1330,
                            "labor_time": 14,
                            "labor_rate": 95,
                            "material_cost": 73.04,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61514,
                                    "part_id": 40751,
                                    "quantity": 18,
                                    "totalcost": 73.0368,
                                    "purchase_cost": 3.17,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": null,
                                    "parts": {
                                        "price": 3.17,
                                        "code": "06-2350050",
                                        "title": "DECAL. TANK QUALIFICATION. COVERUP STRIP",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 13840,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 5,
                                            "name": "COATING"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": "2024-12-16T20:00:15.000Z",
                            "crews": {
                                "id": 31,
                                "name": "RONALD NEWMAN",
                                "certificate": "Welder RGN; NDT VT"
                            },
                            "manager_checked_time": "2024-12-17T12:48:22.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 6,
                                "name": "Clayton Drake"
                            },
                            "qa_checked_time": "2025-03-01T22:24:50.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43117,
                            "line_number": 17,
                            "locationcode": {
                                "code": "B",
                                "title": "B end"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9820",
                                "title": "TANK CAR QUALIFICATION- JACKETED, INSULATED, ",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "PERFORM HM216 TANK QUALIFICATION - B END",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9820",
                                "title": "TANK CAR QUALIFICATION- JACKETED, INSULATED, ",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 1330,
                            "labor_time": 14,
                            "labor_rate": 95,
                            "material_cost": 73.04,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61515,
                                    "part_id": 40751,
                                    "quantity": 18,
                                    "totalcost": 73.0368,
                                    "purchase_cost": 3.17,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": null,
                                    "parts": {
                                        "price": 3.17,
                                        "code": "06-2350050",
                                        "title": "DECAL. TANK QUALIFICATION. COVERUP STRIP",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 13840,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 5,
                                            "name": "COATING"
                                        }
                                    }
                                }
                            ],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 10380
                                }
                            ],
                            "crew_checked_time": "2024-12-16T20:00:19.000Z",
                            "crews": {
                                "id": 31,
                                "name": "RONALD NEWMAN",
                                "certificate": "Welder RGN; NDT VT"
                            },
                            "manager_checked_time": "2024-12-17T12:48:26.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 6,
                                "name": "Clayton Drake"
                            },
                            "qa_checked_time": "2025-03-01T22:24:51.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43118,
                            "line_number": 18,
                            "locationcode": {
                                "code": "A",
                                "title": "A end"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "PERFORM STRUCTURAL INTEGRITY INSPECTION - BURN AND CLEAN WELDS TO BE VISUALLY INSPECTED A-END",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 30584
                                }
                            ],
                            "crew_checked_time": "2024-12-16T20:00:30.000Z",
                            "crews": {
                                "id": 31,
                                "name": "RONALD NEWMAN",
                                "certificate": "Welder RGN; NDT VT"
                            },
                            "manager_checked_time": "2024-12-17T12:48:30.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 6,
                                "name": "Clayton Drake"
                            },
                            "qa_checked_time": "2025-03-01T22:24:53.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43119,
                            "line_number": 19,
                            "locationcode": {
                                "code": "B",
                                "title": "B end"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "PERFORM STRUCTURAL INTEGRITY INSPECTION - BURN AND CLEAN WELDS TO BE VISUALLY INSPECTED B-END",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 12402
                                }
                            ],
                            "crew_checked_time": "2024-12-16T20:00:32.000Z",
                            "crews": {
                                "id": 31,
                                "name": "RONALD NEWMAN",
                                "certificate": "Welder RGN; NDT VT"
                            },
                            "manager_checked_time": "2024-11-17T12:48:37.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 6,
                                "name": "Clayton Drake"
                            },
                            "qa_checked_time": "2025-03-01T22:24:54.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43120,
                            "line_number": 20,
                            "locationcode": {
                                "code": "B",
                                "title": "B end"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 497,
                                "code": "ZF",
                                "title": "UNDEFINED CAR BODY PARTS"
                            },
                            "job_description": "INSPECT LOOSE BOLTS / CRACKS AT HEADSHIELD B-END - PER SOW",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 497,
                                "code": "ZF",
                                "title": "UNDEFINED CAR BODY PARTS"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 47.5,
                            "labor_time": 0.5,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2024-12-16T20:03:15.000Z",
                            "crews": {
                                "id": 31,
                                "name": "RONALD NEWMAN",
                                "certificate": "Welder RGN; NDT VT"
                            },
                            "manager_checked_time": "2024-12-16T12:51:14.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 6,
                                "name": "Clayton Drake"
                            },
                            "qa_checked_time": "2025-03-01T22:24:56.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43121,
                            "line_number": 21,
                            "locationcode": {
                                "code": "A",
                                "title": "A end"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 497,
                                "code": "ZF",
                                "title": "UNDEFINED CAR BODY PARTS"
                            },
                            "job_description": "INSPECT LOOSE BOLTS / CRACKS AT HEADSHIELD A-END - PER SOW",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 497,
                                "code": "ZF",
                                "title": "UNDEFINED CAR BODY PARTS"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 47.5,
                            "labor_time": 0.5,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2024-12-16T20:03:23.000Z",
                            "crews": {
                                "id": 31,
                                "name": "RONALD NEWMAN",
                                "certificate": "Welder RGN; NDT VT"
                            },
                            "manager_checked_time": "2024-12-16T12:51:17.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 6,
                                "name": "Clayton Drake"
                            },
                            "qa_checked_time": "2025-03-01T22:24:57.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43122,
                            "line_number": 22,
                            "locationcode": {
                                "code": "B",
                                "title": "B end"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "4099",
                                "title": "MISCELLANIOUS - SUPERSTRUCTURE, INCLIDING CAR",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 171,
                                "code": "GT",
                                "title": "DRAFT SILL"
                            },
                            "job_description": "INSPECT WELDS ON DRAFT SILL REAR DOUBLER PADS- B END",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "4099",
                                "title": "MISCELLANIOUS - SUPERSTRUCTURE, INCLIDING CAR",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 171,
                                "code": "GT",
                                "title": "DRAFT SILL"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2024-12-17T22:10:16.000Z",
                            "crews": {
                                "id": 167,
                                "name": "WESLEY CUNNINGHAM",
                                "certificate": ""
                            },
                            "manager_checked_time": "2024-12-17T12:51:20.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 6,
                                "name": "Clayton Drake"
                            },
                            "qa_checked_time": "2025-03-01T22:24:58.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43123,
                            "line_number": 23,
                            "locationcode": {
                                "code": "A",
                                "title": "A end"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "4099",
                                "title": "MISCELLANIOUS - SUPERSTRUCTURE, INCLIDING CAR",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 171,
                                "code": "GT",
                                "title": "DRAFT SILL"
                            },
                            "job_description": "INSPECT WELDS ON DRAFT SILL REAR DOUBLER PADS- A END",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "4099",
                                "title": "MISCELLANIOUS - SUPERSTRUCTURE, INCLIDING CAR",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 171,
                                "code": "GT",
                                "title": "DRAFT SILL"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2024-12-17T22:10:18.000Z",
                            "crews": {
                                "id": 167,
                                "name": "WESLEY CUNNINGHAM",
                                "certificate": ""
                            },
                            "manager_checked_time": "2024-12-17T12:51:24.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 6,
                                "name": "Clayton Drake"
                            },
                            "qa_checked_time": "2025-03-01T22:24:29.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43159,
                            "line_number": 24,
                            "locationcode": {
                                "code": "B",
                                "title": "B end"
                            },
                            "quantity": 3,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "4800",
                                "title": "TACK OR FILLET WELD",
                                "time_custom": 0.05,
                                "time_standard": 0.05,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 194,
                                "code": "HS",
                                "title": "COUPLER CARRIER"
                            },
                            "job_description": "weld to repair coupler carrier wear plate",
                            "whymadecode": {
                                "code": "41",
                                "title": "Cracked"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "4800",
                                "title": "TACK OR FILLET WELD",
                                "time_custom": 0.05,
                                "time_standard": 0.05,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 194,
                                "code": "HS",
                                "title": "COUPLER CARRIER"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 14.25,
                            "labor_time": 0.05,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2024-12-17T22:10:21.000Z",
                            "crews": {
                                "id": 167,
                                "name": "WESLEY CUNNINGHAM",
                                "certificate": ""
                            },
                            "manager_checked_time": "2024-12-17T12:51:27.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 6,
                                "name": "Clayton Drake"
                            },
                            "qa_checked_time": "2025-03-01T22:24:31.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43124,
                            "line_number": 25,
                            "locationcode": {
                                "code": "A",
                                "title": "A end"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "4455",
                                "title": "RULE 88 B.2 INSPECTION",
                                "time_custom": 1,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "PERFORM RULE 88 B.2 INSPECTION A-END",
                            "whymadecode": {
                                "code": "25",
                                "title": "Owner's request"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "4455",
                                "title": "RULE 88 B.2 INSPECTION",
                                "time_custom": 1,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 5683
                                }
                            ],
                            "crew_checked_time": "2024-12-17T22:10:25.000Z",
                            "crews": {
                                "id": 167,
                                "name": "WESLEY CUNNINGHAM",
                                "certificate": ""
                            },
                            "manager_checked_time": "2024-12-17T12:51:31.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 6,
                                "name": "Clayton Drake"
                            },
                            "qa_checked_time": "2025-03-01T22:24:33.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43125,
                            "line_number": 26,
                            "locationcode": {
                                "code": "B",
                                "title": "B end"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "4455",
                                "title": "RULE 88 B.2 INSPECTION",
                                "time_custom": 1,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "PERFORM RULE 88 B.2 INSPECTION B-END",
                            "whymadecode": {
                                "code": "25",
                                "title": "Owner's request"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "4455",
                                "title": "RULE 88 B.2 INSPECTION",
                                "time_custom": 1,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 3518
                                }
                            ],
                            "crew_checked_time": "2024-12-17T22:10:30.000Z",
                            "crews": {
                                "id": 167,
                                "name": "WESLEY CUNNINGHAM",
                                "certificate": ""
                            },
                            "manager_checked_time": "2024-12-17T12:51:35.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 6,
                                "name": "Clayton Drake"
                            },
                            "qa_checked_time": "2025-03-01T22:24:34.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43126,
                            "line_number": 27,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "HOLD POINT - CONFIRM RULE 88 DOCUMENTS HAVE BEEN COMPLETED AND SIGNED",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2025-01-08T12:47:04.000Z",
                            "crews": {
                                "id": 124,
                                "name": "JORDAN TESTON",
                                "certificate": "WELDER JAT; NDT VT"
                            },
                            "manager_checked_time": "2024-12-17T12:51:39.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 6,
                                "name": "Clayton Drake"
                            },
                            "qa_checked_time": "2025-03-01T22:24:36.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43127,
                            "line_number": 28,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "HOLD POINT - CONFIRM ALL NDT DOCUMENTS HAVE BEEN COMPLETED / SIGNED",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2024-12-18T12:51:48.000Z",
                            "crews": {
                                "id": 124,
                                "name": "JORDAN TESTON",
                                "certificate": "WELDER JAT; NDT VT"
                            },
                            "manager_checked_time": "2024-12-18T12:51:57.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 6,
                                "name": "Clayton Drake"
                            },
                            "qa_checked_time": "2025-03-01T22:24:37.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43128,
                            "line_number": 29,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9818",
                                "title": "ULTRASONIC TESTING- THICKNESS",
                                "time_custom": 4,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 384,
                                "code": "RR",
                                "title": "TANK SHELL"
                            },
                            "job_description": "UT SHEAR WAVE INSPECTION - ASI -",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9818",
                                "title": "ULTRASONIC TESTING- THICKNESS",
                                "time_custom": 4,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 384,
                                "code": "RR",
                                "title": "TANK SHELL"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 380,
                            "labor_time": 4,
                            "labor_rate": 95,
                            "material_cost": 426.8,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61516,
                                    "part_id": 52349,
                                    "quantity": 1,
                                    "totalcost": 426.8,
                                    "purchase_cost": 388,
                                    "markup_percent": 0.1,
                                    "availability": 1,
                                    "additional_info": null,
                                    "parts": {
                                        "price": 1,
                                        "code": "80-18000006",
                                        "title": "SUBCONTRACTED MATERIAL AND LABOR",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": null,
                                        "parts_group": {
                                            "id": 4,
                                            "name": "CLEANING"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": "2024-12-18T12:51:54.000Z",
                            "crews": {
                                "id": 124,
                                "name": "JORDAN TESTON",
                                "certificate": "WELDER JAT; NDT VT"
                            },
                            "manager_checked_time": "2024-12-18T12:52:01.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 6,
                                "name": "Clayton Drake"
                            },
                            "qa_checked_time": "2025-03-01T22:24:38.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 49072,
                            "line_number": 30,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "INSPECT BOV FLANGE & SUMP WELD PER GREENBRIER PROCEDURE WA-0063A",
                            "whymadecode": {
                                "code": "25",
                                "title": "Owner's request"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 190,
                            "labor_time": 2,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2025-01-08T12:47:15.000Z",
                            "crews": {
                                "id": 124,
                                "name": "JORDAN TESTON",
                                "certificate": "WELDER JAT; NDT VT"
                            },
                            "manager_checked_time": "2024-12-18T12:52:04.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 6,
                                "name": "Clayton Drake"
                            },
                            "qa_checked_time": "2025-03-01T22:24:40.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43130,
                            "line_number": 31,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9821",
                                "title": "HM201 SERVICE EQUIPMENT INSPECTION AND TEST",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "HM201 SERVICE EQUIPMENT INSPECTION AND TEST",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9821",
                                "title": "HM201 SERVICE EQUIPMENT INSPECTION AND TEST",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 4560,
                            "labor_time": 48,
                            "labor_rate": 95,
                            "material_cost": 170.94,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61518,
                                    "part_id": 52313,
                                    "quantity": 0.5,
                                    "totalcost": 17.3376,
                                    "purchase_cost": 27.09,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 27.09,
                                        "code": "80-1800005",
                                        "title": "LEAK DETECTION SOLUTION",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 7,
                                            "name": "GAL"
                                        },
                                        "qb_parts": null,
                                        "parts_group": {
                                            "id": 18,
                                            "name": "VALVE"
                                        }
                                    }
                                },
                                {
                                    "id": 61519,
                                    "part_id": 52506,
                                    "quantity": 1,
                                    "totalcost": 153.6,
                                    "purchase_cost": 120,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": " ",
                                    "parts": {
                                        "price": 0,
                                        "code": "80-2000001",
                                        "title": "MISCELLANEOUS MATERIAL",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": null,
                                        "parts_group": {
                                            "id": 1,
                                            "name": "BODY"
                                        }
                                    }
                                }
                            ],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 9926
                                },
                                {
                                    "logged_time_in_seconds": 6579
                                },
                                {
                                    "logged_time_in_seconds": 7470
                                },
                                {
                                    "logged_time_in_seconds": 5074
                                },
                                {
                                    "logged_time_in_seconds": 930
                                },
                                {
                                    "logged_time_in_seconds": 10294
                                },
                                {
                                    "logged_time_in_seconds": 12315
                                },
                                {
                                    "logged_time_in_seconds": 10242
                                },
                                {
                                    "logged_time_in_seconds": 89
                                },
                                {
                                    "logged_time_in_seconds": 3499
                                }
                            ],
                            "crew_checked_time": "2025-02-28T16:10:48.000Z",
                            "crews": {
                                "id": 122,
                                "name": "SETH TAYLOR",
                                "certificate": "NDT LT"
                            },
                            "manager_checked_time": "2025-02-28T17:44:13.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:24:41.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43131,
                            "line_number": 32,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9782",
                                "title": "Gasket, Manway -- General Purpose Case",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 2,
                                "code": "02",
                                "title": "release from service"
                            },
                            "job_description": "RENEW MANWAY GASKET - ",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9782",
                                "title": "Gasket, Manway -- General Purpose Case",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 2,
                                "code": "02",
                                "title": "release from service"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 120.82,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61520,
                                    "part_id": 48059,
                                    "quantity": 1,
                                    "totalcost": 120.8192,
                                    "purchase_cost": 94.39,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 94.39,
                                        "code": "18-5133108",
                                        "title": "GASKET RC510. EAGLE 1/8IN X 21 5/8IN X 19 1/2IN. RC510",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 43,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 18,
                                            "name": "VALVE"
                                        }
                                    }
                                }
                            ],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 3609
                                }
                            ],
                            "crew_checked_time": "2025-02-28T00:37:18.000Z",
                            "crews": {
                                "id": 100,
                                "name": "JACOB RAYMAN",
                                "certificate": ""
                            },
                            "manager_checked_time": "2025-02-28T17:44:09.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:24:12.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43133,
                            "line_number": 33,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "GAUGE AND INSPECT MANWAY EYEBOLTS",
                            "whymadecode": {
                                "code": "25",
                                "title": "Owner's request"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 850
                                }
                            ],
                            "crew_checked_time": "2025-02-28T00:37:29.000Z",
                            "crews": {
                                "id": 159,
                                "name": "JUSTIN FITZGERALD",
                                "certificate": ""
                            },
                            "manager_checked_time": "2025-02-28T17:44:06.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:24:14.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43134,
                            "line_number": 34,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9222",
                                "title": "OUTLET VALVE, BALL TYPE",
                                "time_custom": 4,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 542,
                                "code": "05",
                                "title": "EXTERIOR, STAINLESS STEEL, 6 INCH"
                            },
                            "job_description": "REMOVE BOTTOM OUTLET VALVE",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9222",
                                "title": "OUTLET VALVE, BALL TYPE",
                                "time_custom": 4,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 542,
                                "code": "05",
                                "title": "EXTERIOR, STAINLESS STEEL, 6 INCH"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2024-12-18T17:31:28.000Z",
                            "crews": {
                                "id": 81,
                                "name": "KENDRICK HOPKINS",
                                "certificate": ""
                            },
                            "manager_checked_time": "2025-02-28T17:43:57.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:24:15.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43132,
                            "line_number": 35,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9222",
                                "title": "OUTLET VALVE, BALL TYPE",
                                "time_custom": 4,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 542,
                                "code": "05",
                                "title": "EXTERIOR, STAINLESS STEEL, 6 INCH"
                            },
                            "job_description": "REBUILD BOTTOM OUTLET VALVE",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9222",
                                "title": "OUTLET VALVE, BALL TYPE",
                                "time_custom": 4,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 542,
                                "code": "05",
                                "title": "EXTERIOR, STAINLESS STEEL, 6 INCH"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 453.25,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61521,
                                    "part_id": 49766,
                                    "quantity": 1,
                                    "totalcost": 453.248,
                                    "purchase_cost": 354.1,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": null,
                                    "parts": {
                                        "price": 354.1,
                                        "code": "18-5290138",
                                        "title": "KIT. JAMESBURY 4IN 9RET/9REL. RKR53XT. BOV",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 106,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 18,
                                            "name": "VALVE"
                                        }
                                    }
                                }
                            ],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 1041
                                },
                                {
                                    "logged_time_in_seconds": 8473
                                }
                            ],
                            "crew_checked_time": "2025-02-28T16:10:53.000Z",
                            "crews": {
                                "id": 122,
                                "name": "SETH TAYLOR",
                                "certificate": "NDT LT"
                            },
                            "manager_checked_time": "2025-02-28T17:43:53.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:24:16.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43136,
                            "line_number": 36,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9222",
                                "title": "OUTLET VALVE, BALL TYPE",
                                "time_custom": 4,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 524,
                                "code": "05",
                                "title": "EXTERIOR, STAINLESS STEEL, 6 INCH"
                            },
                            "job_description": "REAPPLY BOV AND NOZZLE - RENEW GASKETS -",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9222",
                                "title": "OUTLET VALVE, BALL TYPE",
                                "time_custom": 4,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 524,
                                "code": "05",
                                "title": "EXTERIOR, STAINLESS STEEL, 6 INCH"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 71.51,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61523,
                                    "part_id": 48492,
                                    "quantity": 1,
                                    "totalcost": 31.9872,
                                    "purchase_cost": 24.99,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 24.99,
                                        "code": "18-5133541",
                                        "title": "GASKET TEADIT 1570E. EAGLE 1/8INX83/8INX63/8IN. TEADIT 1570E",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 33,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 18,
                                            "name": "VALVE"
                                        }
                                    }
                                },
                                {
                                    "id": 61524,
                                    "part_id": 48546,
                                    "quantity": 1,
                                    "totalcost": 31.9872,
                                    "purchase_cost": 24.99,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 24.99,
                                        "code": "18-5133595",
                                        "title": "GASKET TEADIT 1570E. EAGLE 1/8INX81/2INX71/2IN. TEADIT 1570E",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 45,
                                            "on_po": 1
                                        },
                                        "parts_group": {
                                            "id": 18,
                                            "name": "VALVE"
                                        }
                                    }
                                },
                                {
                                    "id": 69374,
                                    "part_id": 55702,
                                    "quantity": 1,
                                    "totalcost": 7.5392,
                                    "purchase_cost": 5.89,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 5.89,
                                        "code": "18-5130374",
                                        "title": "GASKET BUNAN. EAGLE 1/8inX53/8inX31/2in. BUNA NITRILE",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 30,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 18,
                                            "name": "VALVE"
                                        }
                                    }
                                }
                            ],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 3609
                                }
                            ],
                            "crew_checked_time": "2025-02-28T00:37:40.000Z",
                            "crews": {
                                "id": 100,
                                "name": "JACOB RAYMAN",
                                "certificate": ""
                            },
                            "manager_checked_time": "2025-02-28T17:43:50.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:24:19.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43135,
                            "line_number": 37,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "8",
                                "title": "REMOVE, REPAIR AND REPLACE SAME PART",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9480",
                                "title": "SAFETY VALVE",
                                "time_custom": 1,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 512,
                                "code": "02",
                                "title": "EIGHT BOLT, 10-1/2 INCH BOLT CIRCLE"
                            },
                            "job_description": "REMOVE SAFETY VALVE - ",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9480",
                                "title": "SAFETY VALVE",
                                "time_custom": 1,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 512,
                                "code": "02",
                                "title": "EIGHT BOLT, 10-1/2 INCH BOLT CIRCLE"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2024-12-18T17:31:46.000Z",
                            "crews": {
                                "id": 81,
                                "name": "KENDRICK HOPKINS",
                                "certificate": ""
                            },
                            "manager_checked_time": "2025-02-28T17:43:45.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:24:21.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43137,
                            "line_number": 38,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9486",
                                "title": "SAFETY VALVE REPAIR WORK (OTHER THAN RETEST)",
                                "time_custom": 2,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 2,
                                "code": "02",
                                "title": "release from service"
                            },
                            "job_description": "REBUILD AND BENCH TEST SAFETY VALVE-BODY CONDEMNED-sent to kelso for rebuild. Fees included in subcontractor fees",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9486",
                                "title": "SAFETY VALVE REPAIR WORK (OTHER THAN RETEST)",
                                "time_custom": 2,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 2,
                                "code": "02",
                                "title": "release from service"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 796.21,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61525,
                                    "part_id": 49810,
                                    "quantity": 1,
                                    "totalcost": 107.712,
                                    "purchase_cost": 84.15,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": null,
                                    "parts": {
                                        "price": 84.15,
                                        "code": "18-5290182",
                                        "title": "KIT. KELSO JS75/S SV. VSPHA030E2200. VITON VGFS",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 37,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 18,
                                            "name": "VALVE"
                                        }
                                    }
                                },
                                {
                                    "id": 76799,
                                    "part_id": 52349,
                                    "quantity": 1,
                                    "totalcost": 688.4992,
                                    "purchase_cost": 537.89,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 1,
                                        "code": "80-18000006",
                                        "title": "SUBCONTRACTED MATERIAL AND LABOR",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": null,
                                        "parts_group": {
                                            "id": 4,
                                            "name": "CLEANING"
                                        }
                                    }
                                }
                            ],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 9238
                                }
                            ],
                            "crew_checked_time": "2025-02-28T16:10:57.000Z",
                            "crews": {
                                "id": 122,
                                "name": "SETH TAYLOR",
                                "certificate": "NDT LT"
                            },
                            "manager_checked_time": "2025-02-28T17:43:42.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:24:22.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43138,
                            "line_number": 39,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "8",
                                "title": "REMOVE, REPAIR AND REPLACE SAME PART",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9480",
                                "title": "SAFETY VALVE",
                                "time_custom": 1,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 512,
                                "code": "02",
                                "title": "EIGHT BOLT, 10-1/2 INCH BOLT CIRCLE"
                            },
                            "job_description": "REAPPLY SAFETY VALVE - RENEW GASKET - ",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9480",
                                "title": "SAFETY VALVE",
                                "time_custom": 1,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 512,
                                "code": "02",
                                "title": "EIGHT BOLT, 10-1/2 INCH BOLT CIRCLE"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 41.97,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61526,
                                    "part_id": 48501,
                                    "quantity": 1,
                                    "totalcost": 41.9712,
                                    "purchase_cost": 32.79,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 32.79,
                                        "code": "18-5133550",
                                        "title": "GASKET TEADIT 1570E. EAGLE 1/8INX95/8INX8IN. TEADIT 1570E",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 33,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 18,
                                            "name": "VALVE"
                                        }
                                    }
                                }
                            ],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 8633
                                }
                            ],
                            "crew_checked_time": "2025-02-28T00:36:47.000Z",
                            "crews": {
                                "id": 100,
                                "name": "JACOB RAYMAN",
                                "certificate": ""
                            },
                            "manager_checked_time": "2025-02-28T17:43:39.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:24:24.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43139,
                            "line_number": 40,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 3,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9100",
                                "title": "SIPHON PIPE VALVE, BALL TYPE",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 3,
                                "code": "03",
                                "title": "Account other repairs or lining"
                            },
                            "job_description": "REMOVE LIQUID VALVE - 3\" BALL VALVE",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9100",
                                "title": "SIPHON PIPE VALVE, BALL TYPE",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 3,
                                "code": "03",
                                "title": "Account other repairs or lining"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2024-12-18T17:31:53.000Z",
                            "crews": {
                                "id": 81,
                                "name": "KENDRICK HOPKINS",
                                "certificate": ""
                            },
                            "manager_checked_time": "2025-02-28T17:44:58.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:24:26.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43140,
                            "line_number": 41,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 3,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9042",
                                "title": "AIR INLET VALVE, FLANGE TYPE",
                                "time_custom": 0.9,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 1,
                                "code": "01",
                                "title": "change of service"
                            },
                            "job_description": "REMOVE AIR INLET VALVE - 2\" BALL VALVE",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9042",
                                "title": "AIR INLET VALVE, FLANGE TYPE",
                                "time_custom": 0.9,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 1,
                                "code": "01",
                                "title": "change of service"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2024-12-18T17:31:56.000Z",
                            "crews": {
                                "id": 81,
                                "name": "KENDRICK HOPKINS",
                                "certificate": ""
                            },
                            "manager_checked_time": "2025-02-28T17:44:55.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:24:02.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43142,
                            "line_number": 42,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "9",
                                "title": "REMOVE AND REPLACE SAME PART",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9135",
                                "title": "VACUUM RELIEF VALVE - TANK CAR",
                                "time_custom": 0.5,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "REMOVE VACUUM RELIEF VALVE ",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9135",
                                "title": "VACUUM RELIEF VALVE - TANK CAR",
                                "time_custom": 0.5,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2024-12-18T17:32:07.000Z",
                            "crews": {
                                "id": 81,
                                "name": "KENDRICK HOPKINS",
                                "certificate": ""
                            },
                            "manager_checked_time": "2025-02-28T17:44:52.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:24:03.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43141,
                            "line_number": 43,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9057",
                                "title": "REPAIR KIT, AIR INLET VALVE",
                                "time_custom": 1.5,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 2,
                                "code": "02",
                                "title": "release from service"
                            },
                            "job_description": "REBUILD AND REAPPLY 2\" BALL VALVE - ",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9057",
                                "title": "REPAIR KIT, AIR INLET VALVE",
                                "time_custom": 1.5,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 2,
                                "code": "02",
                                "title": "release from service"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 164.01,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61527,
                                    "part_id": 48531,
                                    "quantity": 2,
                                    "totalcost": 29.952,
                                    "purchase_cost": 11.7,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 11.7,
                                        "code": "18-5133580",
                                        "title": "GASKET TEADIT 1570E. EAGLE 1/8INX41/8INX21/2IN. TEADIT 1570E",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 71,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 18,
                                            "name": "VALVE"
                                        }
                                    }
                                },
                                {
                                    "id": 61528,
                                    "part_id": 49631,
                                    "quantity": 1,
                                    "totalcost": 134.0544,
                                    "purchase_cost": 104.73,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": null,
                                    "parts": {
                                        "price": 146.97,
                                        "code": "18-5290003",
                                        "title": "KIT. APOLLO 2IN 87A/88A208/388 SERIES. CA87A02824SP1. GRAPHITE STEM PACKING/TFM SEATS AND STEM BEARING",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 94,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 18,
                                            "name": "VALVE"
                                        }
                                    }
                                }
                            ],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 18
                                }
                            ],
                            "crew_checked_time": "2025-01-04T21:25:30.000Z",
                            "crews": {
                                "id": 160,
                                "name": "ERIC BREAUX",
                                "certificate": "NDT LT, PT"
                            },
                            "manager_checked_time": "2025-02-28T17:44:48.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:24:05.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43143,
                            "line_number": 44,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9100",
                                "title": "SIPHON PIPE VALVE, BALL TYPE",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 3,
                                "code": "03",
                                "title": "Account other repairs or lining"
                            },
                            "job_description": "REBUILD AND REAPPLY 3\" BALL VALVE -",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9100",
                                "title": "SIPHON PIPE VALVE, BALL TYPE",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 3,
                                "code": "03",
                                "title": "Account other repairs or lining"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 272.81,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61529,
                                    "part_id": 48473,
                                    "quantity": 2,
                                    "totalcost": 31.2064,
                                    "purchase_cost": 12.19,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 12.19,
                                        "code": "18-5133522",
                                        "title": "GASKET TEADIT 1570E. EAGLE 1/8INX53/8INX4IN. TEADIT 1570E",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 68,
                                            "on_po": 1
                                        },
                                        "parts_group": {
                                            "id": 18,
                                            "name": "VALVE"
                                        }
                                    }
                                },
                                {
                                    "id": 61530,
                                    "part_id": 49634,
                                    "quantity": 1,
                                    "totalcost": 241.6,
                                    "purchase_cost": 188.75,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": null,
                                    "parts": {
                                        "price": 188.75,
                                        "code": "18-5290006",
                                        "title": "KIT. APOLLO 3IN 87A/88A200/380 SERIES. CA87A02024SP1. GRAPHITE STEM PACKING/TFM SEATS AND STEM BEARING",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 74,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 18,
                                            "name": "VALVE"
                                        }
                                    }
                                }
                            ],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 8439
                                }
                            ],
                            "crew_checked_time": "2025-01-04T21:25:04.000Z",
                            "crews": {
                                "id": 160,
                                "name": "ERIC BREAUX",
                                "certificate": "NDT LT, PT"
                            },
                            "manager_checked_time": "2025-02-28T17:44:42.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:24:07.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43144,
                            "line_number": 45,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9135",
                                "title": "VACUUM RELIEF VALVE - TANK CAR",
                                "time_custom": 0.5,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "REBUILD VACUUM RELIEF VALVE - ",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9135",
                                "title": "VACUUM RELIEF VALVE - TANK CAR",
                                "time_custom": 0.5,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 45.11,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61531,
                                    "part_id": 49845,
                                    "quantity": 1,
                                    "totalcost": 45.1072,
                                    "purchase_cost": 35.24,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 41.39,
                                        "code": "18-5290217",
                                        "title": "KIT. MCKENZIE 21/2in VRV. VITON GFS. VSPIG010E2200.",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 48,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 18,
                                            "name": "VALVE"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": "2025-02-28T16:11:01.000Z",
                            "crews": {
                                "id": 122,
                                "name": "SETH TAYLOR",
                                "certificate": "NDT LT"
                            },
                            "manager_checked_time": "2025-02-28T17:44:39.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:24:08.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43145,
                            "line_number": 46,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9135",
                                "title": "VACUUM RELIEF VALVE - TANK CAR",
                                "time_custom": 0.5,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "REAPPLY VACUUM RELIEF VALVE ",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9135",
                                "title": "VACUUM RELIEF VALVE - TANK CAR",
                                "time_custom": 0.5,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 11.44,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61532,
                                    "part_id": 48442,
                                    "quantity": 1,
                                    "totalcost": 11.4432,
                                    "purchase_cost": 8.94,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 8.94,
                                        "code": "18-5133491",
                                        "title": "GASKET TEADIT 1570E. EAGLE 1/8INX33/8INX21/8IN. TEADIT 1570E",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 33,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 18,
                                            "name": "VALVE"
                                        }
                                    }
                                }
                            ],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 3062
                                },
                                {
                                    "logged_time_in_seconds": 1750
                                }
                            ],
                            "crew_checked_time": "2025-02-28T00:37:54.000Z",
                            "crews": {
                                "id": 159,
                                "name": "JUSTIN FITZGERALD",
                                "certificate": ""
                            },
                            "manager_checked_time": "2025-02-28T17:44:36.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:24:09.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43146,
                            "line_number": 47,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9048",
                                "title": "COVER, BLIND FLANGE",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 3,
                                "code": "03",
                                "title": "Account other repairs or lining"
                            },
                            "job_description": "R&R BLIND FLANGES - RENEW GASKETS- 3 EACH",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9048",
                                "title": "COVER, BLIND FLANGE",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 3,
                                "code": "03",
                                "title": "Account other repairs or lining"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 27.23,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61533,
                                    "part_id": 48328,
                                    "quantity": 1,
                                    "totalcost": 9.0752,
                                    "purchase_cost": 7.09,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 7.09,
                                        "code": "18-5133377",
                                        "title": "GASKET TEADIT 1570. EAGLE 1/8INX21/4INX11/2IN. TEADIT 1570",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 33,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 18,
                                            "name": "VALVE"
                                        }
                                    }
                                },
                                {
                                    "id": 61534,
                                    "part_id": 48409,
                                    "quantity": 1,
                                    "totalcost": 9.0752,
                                    "purchase_cost": 7.09,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 7.09,
                                        "code": "18-5133458",
                                        "title": "GASKET TEADIT 1570E. EAGLE 1/8inX21/4inX7/8in. TEADIT 1570E",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 33,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 18,
                                            "name": "VALVE"
                                        }
                                    }
                                },
                                {
                                    "id": 61535,
                                    "part_id": 48410,
                                    "quantity": 1,
                                    "totalcost": 9.0752,
                                    "purchase_cost": 7.09,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 7.09,
                                        "code": "18-5133459",
                                        "title": "GASKET TEADIT 1570E. EAGLE 1/8INX25/8INX11/2IN TEADIT 1570E",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 32,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 18,
                                            "name": "VALVE"
                                        }
                                    }
                                }
                            ],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 5820
                                }
                            ],
                            "crew_checked_time": "2025-02-28T00:37:59.000Z",
                            "crews": {
                                "id": 159,
                                "name": "JUSTIN FITZGERALD",
                                "certificate": ""
                            },
                            "manager_checked_time": "2025-02-28T17:44:32.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:23:48.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43185,
                            "line_number": 48,
                            "locationcode": {
                                "code": "1",
                                "title": "1"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9126",
                                "title": "CAP, WITH CHAIN SIPHON PIPE VALVE",
                                "time_custom": 0.5,
                                "time_standard": 0.5,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 3,
                                "code": "03",
                                "title": "Account other repairs or lining"
                            },
                            "job_description": "REPLACE 3\" QUICK CONNECT GASKET",
                            "whymadecode": {
                                "code": "03",
                                "title": "Missing"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9126",
                                "title": "CAP, WITH CHAIN SIPHON PIPE VALVE",
                                "time_custom": 0.5,
                                "time_standard": 0.5,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 3,
                                "code": "03",
                                "title": "Account other repairs or lining"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 71.17,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61751,
                                    "part_id": 55650,
                                    "quantity": 1,
                                    "totalcost": 71.168,
                                    "purchase_cost": 55.6,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 27.69,
                                        "code": "11-3280016",
                                        "title": "GASKET. 3in ALUMINUM DUST CAP. Black Viton GF-600S",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 29,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 11,
                                            "name": "GATE"
                                        }
                                    }
                                }
                            ],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 3604
                                }
                            ],
                            "crew_checked_time": "2025-02-28T00:38:05.000Z",
                            "crews": {
                                "id": 159,
                                "name": "JUSTIN FITZGERALD",
                                "certificate": ""
                            },
                            "manager_checked_time": "2025-02-28T17:44:24.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:23:49.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43186,
                            "line_number": 49,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9067",
                                "title": "FITTING, AIR INLET",
                                "time_custom": 0.5,
                                "time_standard": 1,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 550,
                                "code": "02",
                                "title": "2 INCH STEEL"
                            },
                            "job_description": "REPLACE 2\" QUICK CONNECT GASKET",
                            "whymadecode": {
                                "code": "03",
                                "title": "Missing"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9067",
                                "title": "FITTING, AIR INLET",
                                "time_custom": 0.5,
                                "time_standard": 1,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 550,
                                "code": "02",
                                "title": "2 INCH STEEL"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 46.08,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61807,
                                    "part_id": 55651,
                                    "quantity": 1,
                                    "totalcost": 46.08,
                                    "purchase_cost": 36,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 22.08,
                                        "code": "11-3280005",
                                        "title": "GASKET. 2in ALUMINUM DUST CAP. BLACK VITON GF-600S",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 29,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 11,
                                            "name": "GATE"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": "2025-02-28T00:38:11.000Z",
                            "crews": {
                                "id": 100,
                                "name": "JACOB RAYMAN",
                                "certificate": ""
                            },
                            "manager_checked_time": "2025-02-28T17:44:21.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:23:50.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43147,
                            "line_number": 50,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9786",
                                "title": "Eye Bolt, Manway -- Car with Seal Slot",
                                "time_custom": 0.5,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "HOLD POINT-  INSPECT SAFETY EYEBOLT COLLARS AND ADJUST IF NEEDED",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9786",
                                "title": "Eye Bolt, Manway -- Car with Seal Slot",
                                "time_custom": 0.5,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2025-02-28T00:38:15.000Z",
                            "crews": {
                                "id": 100,
                                "name": "JACOB RAYMAN",
                                "certificate": ""
                            },
                            "manager_checked_time": "2025-02-28T17:45:19.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:23:52.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43148,
                            "line_number": 51,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9805",
                                "title": "AIR TEST OF TANK AND VALVES (LOW PRESSURE)",
                                "time_custom": 2,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "PERFORM FINAL AIR TEST OF TANK AND VALVES ",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9805",
                                "title": "AIR TEST OF TANK AND VALVES (LOW PRESSURE)",
                                "time_custom": 2,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 14,
                                    "name": "VALVE"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 285,
                            "labor_time": 3,
                            "labor_rate": 95,
                            "material_cost": 8.67,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61536,
                                    "part_id": 52313,
                                    "quantity": 0.25,
                                    "totalcost": 8.6688,
                                    "purchase_cost": 27.09,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 27.09,
                                        "code": "80-1800005",
                                        "title": "LEAK DETECTION SOLUTION",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 7,
                                            "name": "GAL"
                                        },
                                        "qb_parts": null,
                                        "parts_group": {
                                            "id": 18,
                                            "name": "VALVE"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": "2025-02-28T16:10:08.000Z",
                            "crews": {
                                "id": 102,
                                "name": "THOMAS PAUL",
                                "certificate": "NDT LT, PT"
                            },
                            "manager_checked_time": "2025-02-28T17:45:15.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:23:53.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43149,
                            "line_number": 52,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "4602",
                                "title": "PAINT, ALKYD OR LATEX",
                                "time_custom": 0.3,
                                "time_standard": 0.014,
                                "job_or_revenue_category": {
                                    "id": 15,
                                    "name": "PAINT"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 249,
                                "code": "KZ",
                                "title": "DOME HEAD"
                            },
                            "job_description": "CLEAN AND TOUCH UP DOME VALVE PLATE BEFORE REAPPLYING VALVES ",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "4602",
                                "title": "PAINT, ALKYD OR LATEX",
                                "time_custom": 0.3,
                                "time_standard": 0.014,
                                "job_or_revenue_category": {
                                    "id": 15,
                                    "name": "PAINT"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 249,
                                "code": "KZ",
                                "title": "DOME HEAD"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 95,
                            "labor_time": 1,
                            "labor_rate": 95,
                            "material_cost": 69.12,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61537,
                                    "part_id": 53862,
                                    "quantity": 1,
                                    "totalcost": 69.12,
                                    "purchase_cost": 54,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 54,
                                        "code": "06-2370108",
                                        "title": "EXTERIOR. DTM PAINT ANY COLOR",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 1,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 1,
                                            "name": "BODY"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": "2025-02-28T00:38:18.000Z",
                            "crews": {
                                "id": 100,
                                "name": "JACOB RAYMAN",
                                "certificate": ""
                            },
                            "manager_checked_time": "2025-02-28T17:45:11.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:23:54.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43150,
                            "line_number": 53,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "HOLD POINT - CONFIRM VALVE PAPERWORK IS COMPLETED AND SIGNED - BENCH TESTS - LEAK TESTS",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2025-02-28T16:12:03.000Z",
                            "crews": {
                                "id": 104,
                                "name": "DENNIS ROBERTS",
                                "certificate": "NDT LT"
                            },
                            "manager_checked_time": "2025-02-28T17:45:08.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 58,
                                "name": "Jimmy Paul"
                            },
                            "qa_checked_time": "2025-03-01T22:23:57.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43152,
                            "line_number": 54,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "8003",
                                "title": "White Metal Blast Cleaning",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 15,
                                    "name": "PAINT"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "INTERIOR BLAST WHITE METAL TANK - BOTTOM OF PRESSURE PLATE - PIPES - ",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "8003",
                                "title": "White Metal Blast Cleaning",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 15,
                                    "name": "PAINT"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 4085,
                            "labor_time": 43,
                            "labor_rate": 95,
                            "material_cost": 2102.4,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61539,
                                    "part_id": 40896,
                                    "quantity": 750,
                                    "totalcost": 2102.4,
                                    "purchase_cost": 2.19,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 2.19,
                                        "code": "06-2380008",
                                        "title": "GRIT. RAIL X HYPER HX30 SPONGE MEDIA",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 6,
                                            "name": "LBS"
                                        },
                                        "qb_parts": {
                                            "on_hand": 38139.96,
                                            "on_po": 8800
                                        },
                                        "parts_group": {
                                            "id": 5,
                                            "name": "COATING"
                                        }
                                    }
                                }
                            ],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 11459
                                },
                                {
                                    "logged_time_in_seconds": 26804
                                },
                                {
                                    "logged_time_in_seconds": 23344
                                },
                                {
                                    "logged_time_in_seconds": 21553
                                },
                                {
                                    "logged_time_in_seconds": 30158
                                },
                                {
                                    "logged_time_in_seconds": 27848
                                },
                                {
                                    "logged_time_in_seconds": 18794
                                },
                                {
                                    "logged_time_in_seconds": 18678
                                },
                                {
                                    "logged_time_in_seconds": 18734
                                }
                            ],
                            "crew_checked_time": "2025-02-27T14:24:34.000Z",
                            "crews": {
                                "id": 20,
                                "name": "CHARLIE JACKSON",
                                "certificate": "QCA, QCI"
                            },
                            "manager_checked_time": "2025-02-28T14:24:38.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 47,
                                "name": "Jody Keeley"
                            },
                            "qa_checked_time": "2025-03-01T22:23:59.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43153,
                            "line_number": 55,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "9818",
                                "title": "ULTRASONIC TESTING- THICKNESS",
                                "time_custom": 4,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 384,
                                "code": "RR",
                                "title": "TANK SHELL"
                            },
                            "job_description": "UT THICKNESS AFTER BLAST",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "9818",
                                "title": "ULTRASONIC TESTING- THICKNESS",
                                "time_custom": 4,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 384,
                                "code": "RR",
                                "title": "TANK SHELL"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 950,
                            "labor_time": 10,
                            "labor_rate": 95,
                            "material_cost": 440,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61540,
                                    "part_id": 52349,
                                    "quantity": 1,
                                    "totalcost": 440,
                                    "purchase_cost": 400,
                                    "markup_percent": 0.1,
                                    "availability": 1,
                                    "additional_info": null,
                                    "parts": {
                                        "price": 1,
                                        "code": "80-18000006",
                                        "title": "SUBCONTRACTED MATERIAL AND LABOR",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": null,
                                        "parts_group": {
                                            "id": 4,
                                            "name": "CLEANING"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": "2025-02-28T14:23:55.000Z",
                            "crews": {
                                "id": 143,
                                "name": "ROBERT GIBSON JR",
                                "certificate": "CTA, QCI"
                            },
                            "manager_checked_time": "2025-02-28T14:24:41.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 47,
                                "name": "Jody Keeley"
                            },
                            "qa_checked_time": "2025-03-01T22:23:38.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43154,
                            "line_number": 56,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "8015",
                                "title": "Internal Wipe Down",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 13,
                                    "name": "CLEAN"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "APPLY MINERAL OIL AFTER BLAST",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "8015",
                                "title": "Internal Wipe Down",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 13,
                                    "name": "CLEAN"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 570,
                            "labor_time": 6,
                            "labor_rate": 95,
                            "material_cost": 92.74,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 63208,
                                    "part_id": 40695,
                                    "quantity": 3,
                                    "totalcost": 92.736,
                                    "purchase_cost": 24.15,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 24.15,
                                        "code": "05-2330004",
                                        "title": "MINERAL OIL KOSHER CRYSTAL PLUS CP70FG",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 7,
                                            "name": "GAL"
                                        },
                                        "qb_parts": {
                                            "on_hand": 13,
                                            "on_po": 55
                                        },
                                        "parts_group": {
                                            "id": 4,
                                            "name": "CLEANING"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": "2025-02-28T14:23:08.000Z",
                            "crews": {
                                "id": 143,
                                "name": "ROBERT GIBSON JR",
                                "certificate": "CTA, QCI"
                            },
                            "manager_checked_time": "2025-02-28T14:24:43.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 47,
                                "name": "Jody Keeley"
                            },
                            "qa_checked_time": "2025-03-01T22:23:39.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43156,
                            "line_number": 57,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "8050",
                                "title": "PAINT, DTM, EPOXY",
                                "time_custom": 1,
                                "time_standard": 1,
                                "job_or_revenue_category": {
                                    "id": 15,
                                    "name": "PAINT"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "SQUARE OFF AND TOUCH UP EXTERIOR REPAIRS",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "8050",
                                "title": "PAINT, DTM, EPOXY",
                                "time_custom": 1,
                                "time_standard": 1,
                                "job_or_revenue_category": {
                                    "id": 15,
                                    "name": "PAINT"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 760,
                            "labor_time": 8,
                            "labor_rate": 95,
                            "material_cost": 69.12,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61543,
                                    "part_id": 53862,
                                    "quantity": 1,
                                    "totalcost": 69.12,
                                    "purchase_cost": 54,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 54,
                                        "code": "06-2370108",
                                        "title": "EXTERIOR. DTM PAINT ANY COLOR",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 1,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 1,
                                            "name": "BODY"
                                        }
                                    }
                                }
                            ],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 6460
                                },
                                {
                                    "logged_time_in_seconds": 2436
                                },
                                {
                                    "logged_time_in_seconds": 20869
                                }
                            ],
                            "crew_checked_time": "2025-03-01T16:53:27.000Z",
                            "crews": {
                                "id": 127,
                                "name": "JARRETT WHEELER",
                                "certificate": ""
                            },
                            "manager_checked_time": "2025-03-01T16:56:26.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 47,
                                "name": "Jody Keeley"
                            },
                            "qa_checked_time": "2025-03-01T22:23:40.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43160,
                            "line_number": 58,
                            "locationcode": {
                                "code": "B",
                                "title": "B end"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "1628",
                                "title": "AIR BRAKE HOSE AAR APPROVED, TRAINLINE HOSE",
                                "time_custom": 0.5,
                                "time_standard": 0.145,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "renew trainline hose",
                            "whymadecode": {
                                "code": "21",
                                "title": "Overdate/overage"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "1628",
                                "title": "AIR BRAKE HOSE AAR APPROVED, TRAINLINE HOSE",
                                "time_custom": 0.5,
                                "time_standard": 0.145,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 47.5,
                            "labor_time": 0.5,
                            "labor_rate": 95,
                            "material_cost": 54.02,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61545,
                                    "part_id": 40273,
                                    "quantity": 1,
                                    "totalcost": 54.016,
                                    "purchase_cost": 42.2,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 42.2,
                                        "code": "03-1770009",
                                        "title": "HOSE. 13/8IN. STANDARD TRAINLINE END AIR BRAKE. 263/4INOAL. STRATO S6012422CW",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 45,
                                            "on_po": 200
                                        },
                                        "parts_group": {
                                            "id": 3,
                                            "name": "BRAKE"
                                        }
                                    }
                                }
                            ],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 1093
                                }
                            ],
                            "crew_checked_time": "2024-12-16T15:06:12.000Z",
                            "crews": {
                                "id": 33,
                                "name": "RAYMOND WISE",
                                "certificate": "WELDER RW; ABT CERT"
                            },
                            "manager_checked_time": "2024-12-18T12:52:18.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 6,
                                "name": "Clayton Drake"
                            },
                            "qa_checked_time": "2025-03-01T22:23:42.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43157,
                            "line_number": 59,
                            "locationcode": {
                                "code": "R",
                                "title": "Right"
                            },
                            "quantity": 4,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "5500",
                                "title": "REFLECTIVE SHEETING",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 384,
                                "code": "RR",
                                "title": "TANK SHELL"
                            },
                            "job_description": "renew damaged reflective sheeting",
                            "whymadecode": {
                                "code": "49",
                                "title": "Reflective sheeting lacking FRA 224 stamp, da"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "5500",
                                "title": "REFLECTIVE SHEETING",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 384,
                                "code": "RR",
                                "title": "TANK SHELL"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 15.2,
                            "labor_time": 0.04,
                            "labor_rate": 95,
                            "material_cost": 13.59,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61544,
                                    "part_id": 40770,
                                    "quantity": 6,
                                    "totalcost": 13.5936,
                                    "purchase_cost": 1.77,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 1.77,
                                        "code": "06-2360001",
                                        "title": "DELINEATOR. TAPE YELLOW. 18IN KISSCUT. FRA224. PURCHASED IN ROLLS/STOCKED IN EA ",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 155,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 5,
                                            "name": "COATING"
                                        }
                                    }
                                }
                            ],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 1318
                                },
                                {
                                    "logged_time_in_seconds": 36
                                }
                            ],
                            "crew_checked_time": "2024-12-16T18:35:38.000Z",
                            "crews": {
                                "id": 33,
                                "name": "RAYMOND WISE",
                                "certificate": "WELDER RW; ABT CERT"
                            },
                            "manager_checked_time": "2024-12-18T12:52:21.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 6,
                                "name": "Clayton Drake"
                            },
                            "qa_checked_time": "2025-03-01T22:23:43.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 52012,
                            "line_number": 60,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "8040",
                                "title": "APPLY DECALS (OTHER THAN RULE 80)",
                                "time_custom": 0.25,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 15,
                                    "name": "PAINT"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 384,
                                "code": "RR",
                                "title": "TANK SHELL"
                            },
                            "job_description": "renew bottom operating valve decal",
                            "whymadecode": {
                                "code": "03",
                                "title": "Missing"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "8040",
                                "title": "APPLY DECALS (OTHER THAN RULE 80)",
                                "time_custom": 0.25,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 15,
                                    "name": "PAINT"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 384,
                                "code": "RR",
                                "title": "TANK SHELL"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 23.75,
                            "labor_time": 0.25,
                            "labor_rate": 95,
                            "material_cost": 40.47,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 69324,
                                    "part_id": 40708,
                                    "quantity": 1,
                                    "totalcost": 40.4736,
                                    "purchase_cost": 31.62,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 31.62,
                                        "code": "06-2350007",
                                        "title": "DECAL. BOV OPERATING DECAL. 9RET/9REL. TRQBOVDECAL",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 8,
                                            "name": "YDS"
                                        },
                                        "qb_parts": {
                                            "on_hand": 110,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 5,
                                            "name": "COATING"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": "2025-02-28T14:23:14.000Z",
                            "crews": {
                                "id": 143,
                                "name": "ROBERT GIBSON JR",
                                "certificate": "CTA, QCI"
                            },
                            "manager_checked_time": "2025-02-28T14:25:10.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 47,
                                "name": "Jody Keeley"
                            },
                            "qa_checked_time": "2025-03-01T22:23:45.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 52013,
                            "line_number": 61,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "8041",
                                "title": "STENCILING (OTHER THAN RULE 80)",
                                "time_custom": 1,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 15,
                                    "name": "PAINT"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "HOLD POINT - UPDATE QUALIFICATION DECALS",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "8041",
                                "title": "STENCILING (OTHER THAN RULE 80)",
                                "time_custom": 1,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 15,
                                    "name": "PAINT"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 22.16,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 76819,
                                    "part_id": 40718,
                                    "quantity": 1,
                                    "totalcost": 22.1568,
                                    "purchase_cost": 17.31,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 17.31,
                                        "code": "06-2350017",
                                        "title": "DECAL. CANUTEC/CHEMTREC INTERNATIONAL. 3 PHONE NUMBERS. MCA50RR",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 35,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 5,
                                            "name": "COATING"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": "2025-02-28T14:23:46.000Z",
                            "crews": {
                                "id": 143,
                                "name": "ROBERT GIBSON JR",
                                "certificate": "CTA, QCI"
                            },
                            "manager_checked_time": "2025-02-28T14:25:13.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 47,
                                "name": "Jody Keeley"
                            },
                            "qa_checked_time": "2025-03-01T22:23:27.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43161,
                            "line_number": 62,
                            "locationcode": {
                                "code": "A",
                                "title": "A end"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "1628",
                                "title": "AIR BRAKE HOSE AAR APPROVED, TRAINLINE HOSE",
                                "time_custom": 0.5,
                                "time_standard": 0.145,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "renew trainline hose",
                            "whymadecode": {
                                "code": "21",
                                "title": "Overdate/overage"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "1628",
                                "title": "AIR BRAKE HOSE AAR APPROVED, TRAINLINE HOSE",
                                "time_custom": 0.5,
                                "time_standard": 0.145,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 47.5,
                            "labor_time": 0.5,
                            "labor_rate": 95,
                            "material_cost": 54.02,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61546,
                                    "part_id": 40273,
                                    "quantity": 1,
                                    "totalcost": 54.016,
                                    "purchase_cost": 42.2,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 42.2,
                                        "code": "03-1770009",
                                        "title": "HOSE. 13/8IN. STANDARD TRAINLINE END AIR BRAKE. 263/4INOAL. STRATO S6012422CW",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 45,
                                            "on_po": 200
                                        },
                                        "parts_group": {
                                            "id": 3,
                                            "name": "BRAKE"
                                        }
                                    }
                                }
                            ],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 2845
                                }
                            ],
                            "crew_checked_time": "2024-12-16T15:53:41.000Z",
                            "crews": {
                                "id": 33,
                                "name": "RAYMOND WISE",
                                "certificate": "WELDER RW; ABT CERT"
                            },
                            "manager_checked_time": "2024-12-18T12:52:25.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 6,
                                "name": "Clayton Drake"
                            },
                            "qa_checked_time": "2025-03-01T22:23:29.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43155,
                            "line_number": 63,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "7",
                                "title": "PERIODIC OR SERVICE ATTENTION",
                                "description": "Includes the following:. a. Vacant. b. Single car testing of air brakes. c. Cleaning of brake cylinder, B-1 Quick Service Valves. d. Lubrication. e. Servicing mechanical refrigeration units. f. Vacant. g. All wheels applied"
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "1144",
                                "title": "4 PORT SINGLE CAR AIR BRAKE TEST USING AN",
                                "time_custom": 1.5,
                                "time_standard": 0.973,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "SINGLE CAR AIR BRAKE TEST ",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "1144",
                                "title": "4 PORT SINGLE CAR AIR BRAKE TEST USING AN",
                                "time_custom": 1.5,
                                "time_standard": 0.973,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 380,
                            "labor_time": 4,
                            "labor_rate": 95,
                            "material_cost": 1.28,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 61542,
                                    "part_id": 40220,
                                    "quantity": 2,
                                    "totalcost": 1.28,
                                    "purchase_cost": 0.5,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": null,
                                    "parts": {
                                        "price": 0.5,
                                        "code": "03-1710019",
                                        "title": "GASKET. TRAINLINE HOSE. WABCO 563952",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 44,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 3,
                                            "name": "BRAKE"
                                        }
                                    }
                                }
                            ],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 2132
                                }
                            ],
                            "crew_checked_time": "2024-12-16T16:41:49.000Z",
                            "crews": {
                                "id": 33,
                                "name": "RAYMOND WISE",
                                "certificate": "WELDER RW; ABT CERT"
                            },
                            "manager_checked_time": "2024-12-18T12:52:31.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 6,
                                "name": "Clayton Drake"
                            },
                            "qa_checked_time": "2025-03-01T22:23:30.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 43158,
                            "line_number": 64,
                            "locationcode": {
                                "code": "C",
                                "title": "Center"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "0",
                                "title": "LABOR ATTENTION",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": null,
                            "job_description": "ADDITIONAL LABOR AND MATERIAL ",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "8520",
                                "title": "PERODIC INSPECTION",
                                "time_custom": 3,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": null,
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [
                                {
                                    "logged_time_in_seconds": 704
                                },
                                {
                                    "logged_time_in_seconds": 4623
                                },
                                {
                                    "logged_time_in_seconds": 3398
                                },
                                {
                                    "logged_time_in_seconds": 3269
                                },
                                {
                                    "logged_time_in_seconds": 13394
                                }
                            ],
                            "crew_checked_time": "2025-03-01T16:53:38.000Z",
                            "crews": {
                                "id": 127,
                                "name": "JARRETT WHEELER",
                                "certificate": ""
                            },
                            "manager_checked_time": "2025-03-01T17:58:23.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 72,
                                "name": "Jordan Teston"
                            },
                            "qa_checked_time": "2025-03-01T22:23:32.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 60556,
                            "line_number": 65,
                            "locationcode": {
                                "code": "A",
                                "title": "A end"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "1165",
                                "title": "AIR HOSE SUPPORT COMPLETE -- NON-METALLIC",
                                "time_custom": 0.25,
                                "time_standard": 0.25,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 14,
                                "code": "AD",
                                "title": "AIR BRAKE HOSE"
                            },
                            "job_description": "AIR HOSE SUPPORT COMPLETE -- NON-METALLIC",
                            "whymadecode": {
                                "code": "02",
                                "title": "Broken"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "1165",
                                "title": "AIR HOSE SUPPORT COMPLETE -- NON-METALLIC",
                                "time_custom": 0.25,
                                "time_standard": 0.25,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 14,
                                "code": "AD",
                                "title": "AIR BRAKE HOSE"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 23.75,
                            "labor_time": 0.25,
                            "labor_rate": 95,
                            "material_cost": 9.92,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 76718,
                                    "part_id": 40621,
                                    "quantity": 1,
                                    "totalcost": 9.92,
                                    "purchase_cost": 7.75,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 7.75,
                                        "code": "03-2100040",
                                        "title": "SUPPORT. TRAINLINE HOSE HANGER. STRAP. NYAB 778117",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 187,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 3,
                                            "name": "BRAKE"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": "2025-03-01T18:45:38.000Z",
                            "crews": {
                                "id": 30,
                                "name": "LANCE NAQUIN",
                                "certificate": "WELDER LN; NDT VT, MT, PT"
                            },
                            "manager_checked_time": "2025-03-01T18:47:08.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 72,
                                "name": "Jordan Teston"
                            },
                            "qa_checked_time": "2025-03-01T22:23:33.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 60557,
                            "line_number": 66,
                            "locationcode": {
                                "code": "BR",
                                "title": "B Right"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "3940",
                                "title": "TRUCK STABILIZING SPRING",
                                "time_custom": 0.2,
                                "time_standard": 0.465,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 123,
                                "code": "EP",
                                "title": "FRICTION CASTING SPRING"
                            },
                            "job_description": "TRUCK STABILIZING SPRING",
                            "whymadecode": {
                                "code": "02",
                                "title": "Broken"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "3940",
                                "title": "TRUCK STABILIZING SPRING",
                                "time_custom": 0.2,
                                "time_standard": 0.465,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 123,
                                "code": "EP",
                                "title": "FRICTION CASTING SPRING"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 19,
                            "labor_time": 0.2,
                            "labor_rate": 95,
                            "material_cost": 27.52,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 76719,
                                    "part_id": 43558,
                                    "quantity": 1,
                                    "totalcost": 27.52,
                                    "purchase_cost": 21.5,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 21.5,
                                        "code": "17-4550009",
                                        "title": "SPRING. B354 INNER. BARBER STABILIZER",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 7,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 17,
                                            "name": "TRUCK"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": "2025-03-01T18:45:40.000Z",
                            "crews": {
                                "id": 30,
                                "name": "LANCE NAQUIN",
                                "certificate": "WELDER LN; NDT VT, MT, PT"
                            },
                            "manager_checked_time": "2025-03-01T18:47:06.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 72,
                                "name": "Jordan Teston"
                            },
                            "qa_checked_time": "2025-03-01T22:23:35.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 60558,
                            "line_number": 67,
                            "locationcode": {
                                "code": "L3",
                                "title": "Left Line 3"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "2869",
                                "title": "WABTEC/SCT - GROUNDING STRAP REPLACEMENT",
                                "time_custom": 0.5,
                                "time_standard": 0.5,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 128,
                                "code": "EY",
                                "title": "ROLLER BEARING ADAPTER"
                            },
                            "job_description": "REPLACEMENT OF WABTEC/SCT GROUNDING STRAP",
                            "whymadecode": {
                                "code": "02",
                                "title": "Broken"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "2869",
                                "title": "WABTEC/SCT - GROUNDING STRAP REPLACEMENT",
                                "time_custom": 0.5,
                                "time_standard": 0.5,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 128,
                                "code": "EY",
                                "title": "ROLLER BEARING ADAPTER"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 47.5,
                            "labor_time": 0.5,
                            "labor_rate": 95,
                            "material_cost": 19.2,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 76720,
                                    "part_id": 43470,
                                    "quantity": 1,
                                    "totalcost": 19.2,
                                    "purchase_cost": 15,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 15,
                                        "code": "17-4430001",
                                        "title": "GROUNDING WIRE. ROLLER BEARING ADAPTER",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 50,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 17,
                                            "name": "TRUCK"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": "2025-03-01T18:45:41.000Z",
                            "crews": {
                                "id": 30,
                                "name": "LANCE NAQUIN",
                                "certificate": "WELDER LN; NDT VT, MT, PT"
                            },
                            "manager_checked_time": "2025-03-01T18:47:04.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 72,
                                "name": "Jordan Teston"
                            },
                            "qa_checked_time": "2025-03-01T22:23:21.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 60562,
                            "line_number": 68,
                            "locationcode": {
                                "code": "A",
                                "title": "A end"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "9",
                                "title": "REMOVE AND REPLACE SAME PART",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "4474",
                                "title": "R&R COUPLER BODY,E TYPE",
                                "time_custom": 2,
                                "time_standard": 0.565,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 193,
                                "code": "HR",
                                "title": "COUPLER BODY"
                            },
                            "job_description": "R&R COUPLER CARRIER",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "4474",
                                "title": "R&R COUPLER BODY,E TYPE",
                                "time_custom": 2,
                                "time_standard": 0.565,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 193,
                                "code": "HR",
                                "title": "COUPLER BODY"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 190,
                            "labor_time": 2,
                            "labor_rate": 95,
                            "material_cost": 39.04,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 76815,
                                    "part_id": 41153,
                                    "quantity": 1,
                                    "totalcost": 39.04,
                                    "purchase_cost": 30.5,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 30.5,
                                        "code": "07-2480012",
                                        "title": "COUPLER CARRIER WP. MANGANESE DROP IN. COMET 100761  1",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 40,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 7,
                                            "name": "COUPLER"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": "2025-03-01T18:45:43.000Z",
                            "crews": {
                                "id": 30,
                                "name": "LANCE NAQUIN",
                                "certificate": "WELDER LN; NDT VT, MT, PT"
                            },
                            "manager_checked_time": "2025-03-01T18:47:03.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 72,
                                "name": "Jordan Teston"
                            },
                            "qa_checked_time": "2025-03-01T22:23:22.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 60563,
                            "line_number": 69,
                            "locationcode": {
                                "code": "AR",
                                "title": "A Right"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "3940",
                                "title": "TRUCK STABILIZING SPRING",
                                "time_custom": 0.2,
                                "time_standard": 0.465,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 123,
                                "code": "EP",
                                "title": "FRICTION CASTING SPRING"
                            },
                            "job_description": "TRUCK STABILIZING SPRING",
                            "whymadecode": {
                                "code": "02",
                                "title": "Broken"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "3940",
                                "title": "TRUCK STABILIZING SPRING",
                                "time_custom": 0.2,
                                "time_standard": 0.465,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 123,
                                "code": "EP",
                                "title": "FRICTION CASTING SPRING"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 19,
                            "labor_time": 0.2,
                            "labor_rate": 95,
                            "material_cost": 27.52,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 76726,
                                    "part_id": 43558,
                                    "quantity": 1,
                                    "totalcost": 27.52,
                                    "purchase_cost": 21.5,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 21.5,
                                        "code": "17-4550009",
                                        "title": "SPRING. B354 INNER. BARBER STABILIZER",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 7,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 17,
                                            "name": "TRUCK"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": "2025-03-01T18:45:46.000Z",
                            "crews": {
                                "id": 30,
                                "name": "LANCE NAQUIN",
                                "certificate": "WELDER LN; NDT VT, MT, PT"
                            },
                            "manager_checked_time": "2025-03-01T18:47:02.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 72,
                                "name": "Jordan Teston"
                            },
                            "qa_checked_time": "2025-03-01T22:23:24.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 60564,
                            "line_number": 70,
                            "locationcode": {
                                "code": "B",
                                "title": "B end"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "4404",
                                "title": "BOLT, COMMON STANDARD",
                                "time_custom": 0.3,
                                "time_standard": 0.3,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 57,
                                "code": "BW",
                                "title": "HAND BRAKE"
                            },
                            "job_description": "RENEW HAND BRAKE FASTENERS",
                            "whymadecode": {
                                "code": "18",
                                "title": "Loose"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "4404",
                                "title": "BOLT, COMMON STANDARD",
                                "time_custom": 0.3,
                                "time_standard": 0.3,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 57,
                                "code": "BW",
                                "title": "HAND BRAKE"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 28.5,
                            "labor_time": 0.3,
                            "labor_rate": 95,
                            "material_cost": 4.07,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 76727,
                                    "part_id": 39381,
                                    "quantity": 1,
                                    "totalcost": 0.7808,
                                    "purchase_cost": 0.61,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 0.61,
                                        "code": "02-1060023",
                                        "title": "BOLT. HEX HEAD. 1/2IN13X21/4IN. GR5",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 7691,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 2,
                                            "name": "BOLT"
                                        }
                                    }
                                },
                                {
                                    "id": 76729,
                                    "part_id": 42857,
                                    "quantity": 2,
                                    "totalcost": 0.3584,
                                    "purchase_cost": 0.14,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 0.14,
                                        "code": "16-4320015",
                                        "title": "FLAT WASHER. 1/2IN GRADE 5 ZINC",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 2689,
                                            "on_po": 5000
                                        },
                                        "parts_group": {
                                            "id": 16,
                                            "name": "SECUREMENT"
                                        }
                                    }
                                },
                                {
                                    "id": 76728,
                                    "part_id": 44381,
                                    "quantity": 1,
                                    "totalcost": 2.9312,
                                    "purchase_cost": 2.29,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 2.29,
                                        "code": "18-4980003",
                                        "title": "DISC LOCKNUT. 1/2IN13. HEX. ",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 3339,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 18,
                                            "name": "VALVE"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": "2025-03-01T18:45:50.000Z",
                            "crews": {
                                "id": 30,
                                "name": "LANCE NAQUIN",
                                "certificate": "WELDER LN; NDT VT, MT, PT"
                            },
                            "manager_checked_time": "2025-03-01T18:47:00.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 72,
                                "name": "Jordan Teston"
                            },
                            "qa_checked_time": "2025-03-01T22:23:25.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 60566,
                            "line_number": 71,
                            "locationcode": {
                                "code": "L4",
                                "title": "Left Line 4"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "7",
                                "title": "PERIODIC OR SERVICE ATTENTION",
                                "description": "Includes the following:. a. Vacant. b. Single car testing of air brakes. c. Cleaning of brake cylinder, B-1 Quick Service Valves. d. Lubrication. e. Servicing mechanical refrigeration units. f. Vacant. g. All wheels applied"
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "3081",
                                "title": "WHEEL, 36 INCH 2W HT-CP",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 142,
                                "code": "FN",
                                "title": "WHEEL"
                            },
                            "job_description": "WHEEL, 36 INCH 2W HT-CP 0317SWC2100 1121GKC2500",
                            "whymadecode": {
                                "code": "11",
                                "title": "Removed in good condition, account of associa"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "3081",
                                "title": "WHEEL, 36 INCH 2W HT-CP",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 142,
                                "code": "FN",
                                "title": "WHEEL"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2025-03-01T17:46:07.000Z",
                            "crews": {
                                "id": 124,
                                "name": "JORDAN TESTON",
                                "certificate": "WELDER JAT; NDT VT"
                            },
                            "manager_checked_time": "2025-03-01T17:57:54.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 72,
                                "name": "Jordan Teston"
                            },
                            "qa_checked_time": "2025-03-01T22:23:19.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 60567,
                            "line_number": 72,
                            "locationcode": {
                                "code": "R4",
                                "title": "Right Line 4"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "7",
                                "title": "PERIODIC OR SERVICE ATTENTION",
                                "description": "Includes the following:. a. Vacant. b. Single car testing of air brakes. c. Cleaning of brake cylinder, B-1 Quick Service Valves. d. Lubrication. e. Servicing mechanical refrigeration units. f. Vacant. g. All wheels applied"
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "3081",
                                "title": "WHEEL, 36 INCH 2W HT-CP",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 142,
                                "code": "FN",
                                "title": "WHEEL"
                            },
                            "job_description": "WHEEL, 36 INCH 2W HT-CP 0417SWC2100 1121GKC2600",
                            "whymadecode": {
                                "code": "11",
                                "title": "Removed in good condition, account of associa"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "3081",
                                "title": "WHEEL, 36 INCH 2W HT-CP",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 142,
                                "code": "FN",
                                "title": "WHEEL"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2025-03-01T17:46:06.000Z",
                            "crews": {
                                "id": 124,
                                "name": "JORDAN TESTON",
                                "certificate": "WELDER JAT; NDT VT"
                            },
                            "manager_checked_time": "2025-03-01T17:57:55.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 72,
                                "name": "Jordan Teston"
                            },
                            "qa_checked_time": "2025-03-01T22:23:17.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 60568,
                            "line_number": 73,
                            "locationcode": {
                                "code": "L4",
                                "title": "Left Line 4"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "3",
                                "title": "TEST RECONDITIONED OR RECERTIFIED MATERIAL AP",
                                "description": " "
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "2867",
                                "title": "BEARING 6.5 X 9 B5",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 129,
                                "code": "EZ",
                                "title": "ROLLER BEARING ASSEMBLY"
                            },
                            "job_description": "BEARING 6.5 X 9 B5",
                            "whymadecode": {
                                "code": "50",
                                "title": "Roller bearing overheated."
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "2867",
                                "title": "BEARING 6.5 X 9 B5",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 129,
                                "code": "EZ",
                                "title": "ROLLER BEARING ASSEMBLY"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2025-03-01T17:46:04.000Z",
                            "crews": {
                                "id": 124,
                                "name": "JORDAN TESTON",
                                "certificate": "WELDER JAT; NDT VT"
                            },
                            "manager_checked_time": "2025-03-01T17:57:56.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 72,
                                "name": "Jordan Teston"
                            },
                            "qa_checked_time": "2025-03-01T22:23:15.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 60569,
                            "line_number": 74,
                            "locationcode": {
                                "code": "R4",
                                "title": "Right Line 4"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "3",
                                "title": "TEST RECONDITIONED OR RECERTIFIED MATERIAL AP",
                                "description": " "
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "2867",
                                "title": "BEARING 6.5 X 9 B5",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 129,
                                "code": "EZ",
                                "title": "ROLLER BEARING ASSEMBLY"
                            },
                            "job_description": "BEARING 6.5 X 9 B5",
                            "whymadecode": {
                                "code": "11",
                                "title": "Removed in good condition, account of associa"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "2867",
                                "title": "BEARING 6.5 X 9 B5",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 129,
                                "code": "EZ",
                                "title": "ROLLER BEARING ASSEMBLY"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2025-03-01T17:46:03.000Z",
                            "crews": {
                                "id": 124,
                                "name": "JORDAN TESTON",
                                "certificate": "WELDER JAT; NDT VT"
                            },
                            "manager_checked_time": "2025-03-01T17:57:58.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 72,
                                "name": "Jordan Teston"
                            },
                            "qa_checked_time": "2025-03-01T22:23:13.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 60570,
                            "line_number": 75,
                            "locationcode": {
                                "code": "4",
                                "title": "4"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "3",
                                "title": "TEST RECONDITIONED OR RECERTIFIED MATERIAL AP",
                                "description": " "
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "3280",
                                "title": "AXLE-RWS 6.5 X 9 IN JOURNAL",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 109,
                                "code": "DZ",
                                "title": "AXLE"
                            },
                            "job_description": "AXLE-RWS 6.5 X 9 IN JOURNAL",
                            "whymadecode": {
                                "code": "11",
                                "title": "Removed in good condition, account of associa"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "3280",
                                "title": "AXLE-RWS 6.5 X 9 IN JOURNAL",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 109,
                                "code": "DZ",
                                "title": "AXLE"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2025-03-01T17:45:42.000Z",
                            "crews": {
                                "id": 124,
                                "name": "JORDAN TESTON",
                                "certificate": "WELDER JAT; NDT VT"
                            },
                            "manager_checked_time": "2025-03-01T17:58:00.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 72,
                                "name": "Jordan Teston"
                            },
                            "qa_checked_time": "2025-03-01T22:23:11.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 60571,
                            "line_number": 76,
                            "locationcode": {
                                "code": "4",
                                "title": "4"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "B",
                                "title": "WHEEL SET WITH RECONDITIONED ROLLER BEARINGS ",
                                "description": "WHEEL SET WITH RECONDITIONED ROLLER BEARINGS AND  RECONDITIONED/SECONDHAND AXLE"
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "3342",
                                "title": "TURNED WHEEL SET, 36 INCH, 6 1/2X9 AXLE",
                                "time_custom": 1.6,
                                "time_standard": 0.837,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 142,
                                "code": "FN",
                                "title": "WHEEL"
                            },
                            "job_description": "TURNED WHEEL SET, 36 INCH, 6 1/2X9 AXLE CID#SPSX3220079145",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "3342",
                                "title": "TURNED WHEEL SET, 36 INCH, 6 1/2X9 AXLE",
                                "time_custom": 1.6,
                                "time_standard": 0.837,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 142,
                                "code": "FN",
                                "title": "WHEEL"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 152,
                            "labor_time": 1.6,
                            "labor_rate": 95,
                            "material_cost": 1459.2,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 76734,
                                    "part_id": 43670,
                                    "quantity": 1,
                                    "totalcost": 1459.2,
                                    "purchase_cost": 1140,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 1140,
                                        "code": "17-4600003",
                                        "title": "WHEEL SET. 61/2INX9IN. RCD WHEELS/BEARINGS. 100 TON AXLE. EXCHANGE",
                                        "part_condition": 3,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 19,
                                            "on_po": 9
                                        },
                                        "parts_group": {
                                            "id": 17,
                                            "name": "TRUCK"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": "2025-03-01T17:45:39.000Z",
                            "crews": {
                                "id": 124,
                                "name": "JORDAN TESTON",
                                "certificate": "WELDER JAT; NDT VT"
                            },
                            "manager_checked_time": "2025-03-01T17:58:01.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 72,
                                "name": "Jordan Teston"
                            },
                            "qa_checked_time": "2025-03-01T22:23:09.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 60574,
                            "line_number": 77,
                            "locationcode": {
                                "code": "L3",
                                "title": "Left Line 3"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "7",
                                "title": "PERIODIC OR SERVICE ATTENTION",
                                "description": "Includes the following:. a. Vacant. b. Single car testing of air brakes. c. Cleaning of brake cylinder, B-1 Quick Service Valves. d. Lubrication. e. Servicing mechanical refrigeration units. f. Vacant. g. All wheels applied"
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "3081",
                                "title": "WHEEL, 36 INCH 2W HT-CP",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 142,
                                "code": "FN",
                                "title": "WHEEL"
                            },
                            "job_description": "WHEEL, 36 INCH 2W HT-CP 0217GIC1900 1121GKC2400",
                            "whymadecode": {
                                "code": "11",
                                "title": "Removed in good condition, account of associa"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "3081",
                                "title": "WHEEL, 36 INCH 2W HT-CP",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 142,
                                "code": "FN",
                                "title": "WHEEL"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2025-03-01T17:45:38.000Z",
                            "crews": {
                                "id": 124,
                                "name": "JORDAN TESTON",
                                "certificate": "WELDER JAT; NDT VT"
                            },
                            "manager_checked_time": "2025-03-01T17:58:03.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 72,
                                "name": "Jordan Teston"
                            },
                            "qa_checked_time": "2025-03-01T22:23:08.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 60575,
                            "line_number": 78,
                            "locationcode": {
                                "code": "R3",
                                "title": "Right Line 3"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "7",
                                "title": "PERIODIC OR SERVICE ATTENTION",
                                "description": "Includes the following:. a. Vacant. b. Single car testing of air brakes. c. Cleaning of brake cylinder, B-1 Quick Service Valves. d. Lubrication. e. Servicing mechanical refrigeration units. f. Vacant. g. All wheels applied"
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "3081",
                                "title": "WHEEL, 36 INCH 2W HT-CP",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 142,
                                "code": "FN",
                                "title": "WHEEL"
                            },
                            "job_description": "WHEEL, 36 INCH 2W HT-CP 0217GIC2000 1121GKC2400",
                            "whymadecode": {
                                "code": "11",
                                "title": "Removed in good condition, account of associa"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "3081",
                                "title": "WHEEL, 36 INCH 2W HT-CP",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 142,
                                "code": "FN",
                                "title": "WHEEL"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2025-03-01T17:45:36.000Z",
                            "crews": {
                                "id": 124,
                                "name": "JORDAN TESTON",
                                "certificate": "WELDER JAT; NDT VT"
                            },
                            "manager_checked_time": "2025-03-01T17:58:04.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 72,
                                "name": "Jordan Teston"
                            },
                            "qa_checked_time": "2025-03-01T22:23:06.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 60576,
                            "line_number": 79,
                            "locationcode": {
                                "code": "R3",
                                "title": "Right Line 3"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "3",
                                "title": "TEST RECONDITIONED OR RECERTIFIED MATERIAL AP",
                                "description": " "
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "2867",
                                "title": "BEARING 6.5 X 9 B5",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 129,
                                "code": "EZ",
                                "title": "ROLLER BEARING ASSEMBLY"
                            },
                            "job_description": "BEARING 6.5 X 9 B5",
                            "whymadecode": {
                                "code": "50",
                                "title": "Roller bearing overheated."
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "2867",
                                "title": "BEARING 6.5 X 9 B5",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 129,
                                "code": "EZ",
                                "title": "ROLLER BEARING ASSEMBLY"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2025-03-01T17:45:35.000Z",
                            "crews": {
                                "id": 124,
                                "name": "JORDAN TESTON",
                                "certificate": "WELDER JAT; NDT VT"
                            },
                            "manager_checked_time": "2025-03-01T17:58:06.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 72,
                                "name": "Jordan Teston"
                            },
                            "qa_checked_time": "2025-03-01T22:23:05.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 60577,
                            "line_number": 80,
                            "locationcode": {
                                "code": "L3",
                                "title": "Left Line 3"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "3",
                                "title": "TEST RECONDITIONED OR RECERTIFIED MATERIAL AP",
                                "description": " "
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "2867",
                                "title": "BEARING 6.5 X 9 B5",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 129,
                                "code": "EZ",
                                "title": "ROLLER BEARING ASSEMBLY"
                            },
                            "job_description": "BEARING 6.5 X 9 B5",
                            "whymadecode": {
                                "code": "11",
                                "title": "Removed in good condition, account of associa"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "2867",
                                "title": "BEARING 6.5 X 9 B5",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 8,
                                    "name": "INDIRECT-LABOR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 129,
                                "code": "EZ",
                                "title": "ROLLER BEARING ASSEMBLY"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2025-03-01T17:45:33.000Z",
                            "crews": {
                                "id": 124,
                                "name": "JORDAN TESTON",
                                "certificate": "WELDER JAT; NDT VT"
                            },
                            "manager_checked_time": "2025-03-01T17:58:08.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 72,
                                "name": "Jordan Teston"
                            },
                            "qa_checked_time": "2025-03-01T22:23:03.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 60578,
                            "line_number": 81,
                            "locationcode": {
                                "code": "3",
                                "title": "3"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "3",
                                "title": "TEST RECONDITIONED OR RECERTIFIED MATERIAL AP",
                                "description": " "
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "3280",
                                "title": "AXLE-RWS 6.5 X 9 IN JOURNAL",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 109,
                                "code": "DZ",
                                "title": "AXLE"
                            },
                            "job_description": "AXLE-RWS 6.5 X 9 IN JOURNAL",
                            "whymadecode": {
                                "code": "11",
                                "title": "Removed in good condition, account of associa"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "3280",
                                "title": "AXLE-RWS 6.5 X 9 IN JOURNAL",
                                "time_custom": 0,
                                "time_standard": 0,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 109,
                                "code": "DZ",
                                "title": "AXLE"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 0,
                            "labor_time": 0,
                            "labor_rate": 95,
                            "material_cost": 0,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [],
                            "time_log": [],
                            "crew_checked_time": "2025-03-01T17:45:32.000Z",
                            "crews": {
                                "id": 124,
                                "name": "JORDAN TESTON",
                                "certificate": "WELDER JAT; NDT VT"
                            },
                            "manager_checked_time": "2025-03-01T17:58:12.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 72,
                                "name": "Jordan Teston"
                            },
                            "qa_checked_time": "2025-03-01T22:23:01.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 60579,
                            "line_number": 82,
                            "locationcode": {
                                "code": "3",
                                "title": "3"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "B",
                                "title": "WHEEL SET WITH RECONDITIONED ROLLER BEARINGS ",
                                "description": "WHEEL SET WITH RECONDITIONED ROLLER BEARINGS AND  RECONDITIONED/SECONDHAND AXLE"
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "3342",
                                "title": "TURNED WHEEL SET, 36 INCH, 6 1/2X9 AXLE",
                                "time_custom": 1.6,
                                "time_standard": 0.837,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 142,
                                "code": "FN",
                                "title": "WHEEL"
                            },
                            "job_description": "TURNED WHEEL SET, 36 INCH, 6 1/2X9 AXLE CID#SPSX3220076436",
                            "whymadecode": {
                                "code": "09",
                                "title": "Account repairs"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "3342",
                                "title": "TURNED WHEEL SET, 36 INCH, 6 1/2X9 AXLE",
                                "time_custom": 1.6,
                                "time_standard": 0.837,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 142,
                                "code": "FN",
                                "title": "WHEEL"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 152,
                            "labor_time": 1.6,
                            "labor_rate": 95,
                            "material_cost": 1459.2,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 76736,
                                    "part_id": 43670,
                                    "quantity": 1,
                                    "totalcost": 1459.2,
                                    "purchase_cost": 1140,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 1140,
                                        "code": "17-4600003",
                                        "title": "WHEEL SET. 61/2INX9IN. RCD WHEELS/BEARINGS. 100 TON AXLE. EXCHANGE",
                                        "part_condition": 3,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 19,
                                            "on_po": 9
                                        },
                                        "parts_group": {
                                            "id": 17,
                                            "name": "TRUCK"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": "2025-03-01T17:45:30.000Z",
                            "crews": {
                                "id": 124,
                                "name": "JORDAN TESTON",
                                "certificate": "WELDER JAT; NDT VT"
                            },
                            "manager_checked_time": "2025-03-01T17:58:13.000Z",
                            "user_joblist_manager_checked_byTouser": {
                                "id": 72,
                                "name": "Jordan Teston"
                            },
                            "qa_checked_time": "2025-03-01T22:23:00.000Z",
                            "user_joblist_qa_checked_byTouser": {
                                "id": 37,
                                "name": "Robert Willett"
                            }
                        },
                        {
                            "id": 60664,
                            "line_number": 83,
                            "locationcode": {
                                "code": "A",
                                "title": "A end"
                            },
                            "quantity": 2,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "4400",
                                "title": "COTTER OR SPLIT KEY",
                                "time_custom": 0.2,
                                "time_standard": 0.2,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 198,
                                "code": "HW",
                                "title": "COUPLER DRAFT KEY"
                            },
                            "job_description": "RENEW COTTER PIN ",
                            "whymadecode": {
                                "code": "10",
                                "title": "Damaged in removal"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "4400",
                                "title": "COTTER OR SPLIT KEY",
                                "time_custom": 0.2,
                                "time_standard": 0.2,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 198,
                                "code": "HW",
                                "title": "COUPLER DRAFT KEY"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 38,
                            "labor_time": 0.2,
                            "labor_rate": 95,
                            "material_cost": 2.33,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 76818,
                                    "part_id": 42829,
                                    "quantity": 2,
                                    "totalcost": 2.3296,
                                    "purchase_cost": 0.91,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 0.94,
                                        "code": "16-4300001",
                                        "title": "WEDGE COTTER PIN. 5/16INX3IN",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 267,
                                            "on_po": 1000
                                        },
                                        "parts_group": {
                                            "id": 16,
                                            "name": "SECUREMENT"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": null,
                            "crews": null,
                            "manager_checked_time": null,
                            "user_joblist_manager_checked_byTouser": null,
                            "qa_checked_time": null,
                            "user_joblist_qa_checked_byTouser": null
                        },
                        {
                            "id": 60668,
                            "line_number": 84,
                            "locationcode": {
                                "code": "A",
                                "title": "A end"
                            },
                            "quantity": 1,
                            "conditioncode": {
                                "code": "1",
                                "title": "NEW MATERIAL APPLIED",
                                "description": null
                            },
                            "jobcode_joblist_job_code_appliedTojobcode": {
                                "code": "4414",
                                "title": "BOLT, HIGH TENSILE, 3/4 INCH DIAMETER OR ",
                                "time_custom": 0.3,
                                "time_standard": 0.3,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_applied_idToqualifiercode": {
                                "id": 211,
                                "code": "JK",
                                "title": "DRAFT GEAR"
                            },
                            "job_description": "RENEW DRAFT GEAR FASTENERS",
                            "whymadecode": {
                                "code": "18",
                                "title": "Loose"
                            },
                            "jobcode_joblist_job_code_removedTojobcode": {
                                "code": "4414",
                                "title": "BOLT, HIGH TENSILE, 3/4 INCH DIAMETER OR ",
                                "time_custom": 0.3,
                                "time_standard": 0.3,
                                "job_or_revenue_category": {
                                    "id": 16,
                                    "name": "REPAIR"
                                }
                            },
                            "qualifiercode_joblist_qualifier_removed_idToqualifiercode": {
                                "id": 211,
                                "code": "JK",
                                "title": "DRAFT GEAR"
                            },
                            "responsibilitycode": {
                                "code": 1,
                                "title": "Owner"
                            },
                            "labor_cost": 28.5,
                            "labor_time": 0.3,
                            "labor_rate": 95,
                            "material_cost": 32.79,
                            "state": 0,
                            "secondary_bill_to_id": null,
                            "jobparts": [
                                {
                                    "id": 76822,
                                    "part_id": 39268,
                                    "quantity": 6,
                                    "totalcost": 27.8784,
                                    "purchase_cost": 3.63,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 4.13,
                                        "code": "02-1040060",
                                        "title": "BOLT. HEAVY HEX HEAD. 3/4IN10X3IN. CS GR8. ",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 168,
                                            "on_po": 50
                                        },
                                        "parts_group": {
                                            "id": 2,
                                            "name": "BOLT"
                                        }
                                    }
                                },
                                {
                                    "id": 76823,
                                    "part_id": 41332,
                                    "quantity": 6,
                                    "totalcost": 4.9152,
                                    "purchase_cost": 0.64,
                                    "markup_percent": 0.28,
                                    "availability": 1,
                                    "additional_info": "",
                                    "parts": {
                                        "price": 0.64,
                                        "code": "10-2890003",
                                        "title": "LOCKNUT. 3/4IN10 NYLON LOCKNUT G8",
                                        "part_condition": 1,
                                        "parts_unit": {
                                            "id": 1,
                                            "name": "EA"
                                        },
                                        "qb_parts": {
                                            "on_hand": 323,
                                            "on_po": 0
                                        },
                                        "parts_group": {
                                            "id": 10,
                                            "name": "FASTENER"
                                        }
                                    }
                                }
                            ],
                            "time_log": [],
                            "crew_checked_time": null,
                            "crews": null,
                            "manager_checked_time": null,
                            "user_joblist_manager_checked_byTouser": null,
                            "qa_checked_time": null,
                            "user_joblist_qa_checked_byTouser": null
                        }
                    ],
                    "time_log": [
                        {
                            "job_id": 43104,
                            "logged_time_in_seconds": 14295
                        },
                        {
                            "job_id": 43104,
                            "logged_time_in_seconds": 17389
                        },
                        {
                            "job_id": 43118,
                            "logged_time_in_seconds": 30584
                        },
                        {
                            "job_id": 43119,
                            "logged_time_in_seconds": 12402
                        },
                        {
                            "job_id": 43160,
                            "logged_time_in_seconds": 1093
                        },
                        {
                            "job_id": 43161,
                            "logged_time_in_seconds": 2845
                        },
                        {
                            "job_id": 43155,
                            "logged_time_in_seconds": 2132
                        },
                        {
                            "job_id": 43157,
                            "logged_time_in_seconds": 1318
                        },
                        {
                            "job_id": 43157,
                            "logged_time_in_seconds": 36
                        },
                        {
                            "job_id": 43158,
                            "logged_time_in_seconds": 704
                        },
                        {
                            "job_id": 43124,
                            "logged_time_in_seconds": 5683
                        },
                        {
                            "job_id": 43125,
                            "logged_time_in_seconds": 3518
                        },
                        {
                            "job_id": 43158,
                            "logged_time_in_seconds": 4623
                        },
                        {
                            "job_id": 43130,
                            "logged_time_in_seconds": 9926
                        },
                        {
                            "job_id": 43130,
                            "logged_time_in_seconds": 6579
                        },
                        {
                            "job_id": 43158,
                            "logged_time_in_seconds": 3398
                        },
                        {
                            "job_id": 43130,
                            "logged_time_in_seconds": 7470
                        },
                        {
                            "job_id": 43137,
                            "logged_time_in_seconds": 9238
                        },
                        {
                            "job_id": 43132,
                            "logged_time_in_seconds": 1041
                        },
                        {
                            "job_id": 43132,
                            "logged_time_in_seconds": 8473
                        },
                        {
                            "job_id": 43143,
                            "logged_time_in_seconds": 8439
                        },
                        {
                            "job_id": 43130,
                            "logged_time_in_seconds": 5074
                        },
                        {
                            "job_id": 43141,
                            "logged_time_in_seconds": 18
                        },
                        {
                            "job_id": 43117,
                            "logged_time_in_seconds": 10380
                        },
                        {
                            "job_id": 43152,
                            "logged_time_in_seconds": 11459
                        },
                        {
                            "job_id": 43156,
                            "logged_time_in_seconds": 6460
                        },
                        {
                            "job_id": 43156,
                            "logged_time_in_seconds": 2436
                        },
                        {
                            "job_id": 43152,
                            "logged_time_in_seconds": 26804
                        },
                        {
                            "job_id": 43152,
                            "logged_time_in_seconds": 23344
                        },
                        {
                            "job_id": 43152,
                            "logged_time_in_seconds": 21553
                        },
                        {
                            "job_id": 43152,
                            "logged_time_in_seconds": 30158
                        },
                        {
                            "job_id": 43152,
                            "logged_time_in_seconds": 27848
                        },
                        {
                            "job_id": 43152,
                            "logged_time_in_seconds": 18794
                        },
                        {
                            "job_id": 43152,
                            "logged_time_in_seconds": 18678
                        },
                        {
                            "job_id": 43152,
                            "logged_time_in_seconds": 18734
                        },
                        {
                            "job_id": 43130,
                            "logged_time_in_seconds": 930
                        },
                        {
                            "job_id": 43156,
                            "logged_time_in_seconds": 20869
                        },
                        {
                            "job_id": 43130,
                            "logged_time_in_seconds": 10294
                        },
                        {
                            "job_id": 43130,
                            "logged_time_in_seconds": 12315
                        },
                        {
                            "job_id": 43138,
                            "logged_time_in_seconds": 8633
                        },
                        {
                            "job_id": 43145,
                            "logged_time_in_seconds": 3062
                        },
                        {
                            "job_id": 43146,
                            "logged_time_in_seconds": 5820
                        },
                        {
                            "job_id": 43130,
                            "logged_time_in_seconds": 10242
                        },
                        {
                            "job_id": 43113,
                            "logged_time_in_seconds": 1329
                        },
                        {
                            "job_id": 43131,
                            "logged_time_in_seconds": 3609
                        },
                        {
                            "job_id": 43133,
                            "logged_time_in_seconds": 850
                        },
                        {
                            "job_id": 43136,
                            "logged_time_in_seconds": 3609
                        },
                        {
                            "job_id": 43145,
                            "logged_time_in_seconds": 1750
                        },
                        {
                            "job_id": 43185,
                            "logged_time_in_seconds": 3604
                        },
                        {
                            "job_id": 43130,
                            "logged_time_in_seconds": 89
                        },
                        {
                            "job_id": 43130,
                            "logged_time_in_seconds": 3499
                        },
                        {
                            "job_id": 43158,
                            "logged_time_in_seconds": 3269
                        },
                        {
                            "job_id": 43158,
                            "logged_time_in_seconds": 13394
                        },
                        {
                            "job_id": 43102,
                            "logged_time_in_seconds": 2417
                        }
                    ],
                    "yard": {
                        "name": "IRON HORSE RAIL SERVICES",
                        "id": 1,
                        "splc": "684441",
                        "abbreviation": "IHSB",
                        "detail_source": "SH",
                        "facility_type": "CS",
                        "billing_address": "BENEFICIARY ACCOUNT NAME:IRON HORSE RAIL SERVICES LLC\rBANK ACCOUNT NUMBER:932156901\rROUTING NUMBER:111000614",
                        "invoice_identifier": "IHS",
                        "tracks": [
                            {
                                "id": 1,
                                "name": "R1"
                            },
                            {
                                "id": 2,
                                "name": "RIP"
                            },
                            {
                                "id": 3,
                                "name": "RC"
                            }
                        ]
                    },
                    "railcar": {
                        "products": {
                            "name": "METHANOL"
                        },
                        "owner_railcar_owner_idToowner": {
                            "id": 18,
                            "name": "WELLS FARGO RAIL",
                            "labor_rate": 95,
                            "markup_percent": 0.28,
                            "abbreviation": "FURX",
                            "billing_address": null,
                            "address_line1": "9377 W Higgins Rd",
                            "address_line2": "Ste 600",
                            "city": "Rosemont",
                            "state": "IL",
                            "country": "US",
                            "zip_code": "60018",
                            "contact_name": "Attn: Jeff Cysz",
                            "contact_number": "847-384-4403",
                            "contact_email": "Jeff.Cysz@wellsfargo.com",
                            "is_active": 1,
                            "is_po": 2
                        },
                        "owner_railcar_lessee_idToowner": {
                            "id": 18,
                            "name": "WELLS FARGO RAIL",
                            "labor_rate": 95,
                            "markup_percent": 0.28,
                            "abbreviation": "FURX",
                            "billing_address": null,
                            "address_line1": "9377 W Higgins Rd",
                            "address_line2": "Ste 600",
                            "city": "Rosemont",
                            "state": "IL",
                            "country": "US",
                            "zip_code": "60018",
                            "contact_name": "Attn: Jeff Cysz",
                            "contact_number": "847-384-4403",
                            "contact_email": "Jeff.Cysz@wellsfargo.com",
                            "is_active": 1,
                            "is_po": 2
                        },
                        "railcartype": {
                            "name": "TANK",
                            "short_name": "T"
                        }
                    },
                    "workupdates": [
                        {
                            "status_id": 799,
                            "update_date": "2025-03-21T13:28:53.000Z",
                            "comment": "car invoiced but issue with 500-byte in portal. wokring with mithun to fix",
                            "user": {
                                "name": "Mallory Cross",
                                "id": 16
                            },
                            "statuscode": {
                                "title": "CUSTOMER SERVICE FINAL REVIEW"
                            }
                        },
                        {
                            "status_id": 799,
                            "update_date": "2025-03-07T21:23:19.000Z",
                            "comment": "Invoiced. - Christy Hebert",
                            "user": {
                                "name": "Christy Hebert",
                                "id": 55
                            },
                            "statuscode": {
                                "title": "CUSTOMER SERVICE FINAL REVIEW"
                            }
                        },
                        {
                            "status_id": 799,
                            "update_date": "2025-03-02T15:03:50.000Z",
                            "comment": "accounting approved final\n",
                            "user": {
                                "name": "Morgan Birdwell",
                                "id": 5
                            },
                            "statuscode": {
                                "title": "CUSTOMER SERVICE FINAL REVIEW"
                            }
                        },
                        {
                            "status_id": 776,
                            "update_date": "2025-03-02T11:23:49.000Z",
                            "comment": "Final sent for further review 3/2/25",
                            "user": {
                                "name": "Steve Martin",
                                "id": 1
                            },
                            "statuscode": {
                                "title": "WAITING FINAL ACCOUNTING APPROVAL "
                            }
                        },
                        {
                            "status_id": 775,
                            "update_date": "2025-03-01T22:52:21.000Z",
                            "comment": "ADVANCING FOR WILLETT - FINAL ESTIMATE COMPLETE",
                            "user": {
                                "name": "Richard Selman",
                                "id": 17
                            },
                            "statuscode": {
                                "title": "WAITING FINAL MANAGER APPROVAL POST QA"
                            }
                        },
                        {
                            "status_id": 675,
                            "update_date": "2025-03-01T21:50:42.000Z",
                            "comment": "TO QA\n",
                            "user": {
                                "name": "Amber Wright",
                                "id": 67
                            },
                            "statuscode": {
                                "title": "OUTBOUND INSPECTION (AFTER ALL OPERATIONS ARE"
                            }
                        },
                        {
                            "status_id": 700,
                            "update_date": "2025-03-01T21:28:56.000Z",
                            "comment": "TO QA",
                            "user": {
                                "name": "Joe Nelson",
                                "id": 30
                            },
                            "statuscode": {
                                "title": "UNDER QA"
                            }
                        },
                        {
                            "status_id": 675,
                            "update_date": "2025-03-01T21:28:38.000Z",
                            "comment": "TO QA",
                            "user": {
                                "name": "Joe Nelson",
                                "id": 30
                            },
                            "statuscode": {
                                "title": "OUTBOUND INSPECTION (AFTER ALL OPERATIONS ARE"
                            }
                        },
                        {
                            "status_id": 650,
                            "update_date": "2025-03-01T21:28:25.000Z",
                            "comment": "TO QA",
                            "user": {
                                "name": "Joe Nelson",
                                "id": 30
                            },
                            "statuscode": {
                                "title": "OPERATIONS PRE-FINAL"
                            }
                        },
                        {
                            "status_id": 650,
                            "update_date": "2025-03-01T16:47:24.000Z",
                            "comment": "Amber",
                            "user": {
                                "name": "Joe Nelson",
                                "id": 30
                            },
                            "statuscode": {
                                "title": "OPERATIONS PRE-FINAL"
                            }
                        },
                        {
                            "status_id": 385,
                            "update_date": "2025-02-27T12:54:03.000Z",
                            "comment": "UTT & assy",
                            "user": {
                                "name": "Jody Keeley",
                                "id": 47
                            },
                            "statuscode": {
                                "title": "WAITING VALVE ASSEMBLY"
                            }
                        },
                        {
                            "status_id": 425,
                            "update_date": "2025-02-26T20:20:16.000Z",
                            "comment": "assy 2/27",
                            "user": {
                                "name": "Jody Keeley",
                                "id": 47
                            },
                            "statuscode": {
                                "title": "UNDER INTERIOR BLAST"
                            }
                        },
                        {
                            "status_id": 425,
                            "update_date": "2025-02-25T13:37:26.000Z",
                            "comment": "assy 2/26",
                            "user": {
                                "name": "Jody Keeley",
                                "id": 47
                            },
                            "statuscode": {
                                "title": "UNDER INTERIOR BLAST"
                            }
                        },
                        {
                            "status_id": 415,
                            "update_date": "2025-01-09T11:52:45.000Z",
                            "comment": "1/9 NEEDS INTERIOR BLAST AND VALVE WORK",
                            "user": {
                                "name": "Clayton Drake",
                                "id": 6
                            },
                            "statuscode": {
                                "title": "WAITING INTERIOR BLAST"
                            }
                        },
                        {
                            "status_id": 375,
                            "update_date": "2024-12-23T21:48:20.000Z",
                            "comment": "under valve rebuild 12/18",
                            "user": {
                                "name": "Mallory Cross",
                                "id": 16
                            },
                            "statuscode": {
                                "title": "UNDER VALVE REBUILD"
                            }
                        },
                        {
                            "status_id": 188,
                            "update_date": "2024-12-23T21:47:46.000Z",
                            "comment": "initial estimate approved",
                            "user": {
                                "name": "Mallory Cross",
                                "id": 16
                            },
                            "statuscode": {
                                "title": "OPERATIONS"
                            }
                        },
                        {
                            "status_id": 375,
                            "update_date": "2024-12-18T20:53:57.000Z",
                            "comment": "12.18.24",
                            "user": {
                                "name": "Jimmy Paul",
                                "id": 58
                            },
                            "statuscode": {
                                "title": "UNDER VALVE REBUILD"
                            }
                        },
                        {
                            "status_id": 299,
                            "update_date": "2024-12-16T13:27:38.000Z",
                            "comment": "CAR IS CLEANE AND READY FOR VALVE TD ",
                            "user": {
                                "name": "Manny Montes",
                                "id": 50
                            },
                            "statuscode": {
                                "title": "WAITING VALVE TEARDOWN"
                            }
                        },
                        {
                            "status_id": 299,
                            "update_date": "2024-12-13T20:37:14.000Z",
                            "comment": "CAR IS CLEAN AND READY FOR VALVE TD ",
                            "user": {
                                "name": "Manny Montes",
                                "id": 50
                            },
                            "statuscode": {
                                "title": "WAITING VALVE TEARDOWN"
                            }
                        },
                        {
                            "status_id": 225,
                            "update_date": "2024-12-13T15:04:02.000Z",
                            "comment": "UNDER CLEANING ",
                            "user": {
                                "name": "Manny Montes",
                                "id": 50
                            },
                            "statuscode": {
                                "title": "UNDER CLEANING"
                            }
                        },
                        {
                            "status_id": 170,
                            "update_date": "2024-12-12T16:07:33.000Z",
                            "comment": "Approved by Accounting. - Christy Hebert",
                            "user": {
                                "name": "Christy Hebert",
                                "id": 55
                            },
                            "statuscode": {
                                "title": "CUSTOMER SERVICE HANDLING"
                            }
                        },
                        {
                            "status_id": 156,
                            "update_date": "2024-12-12T13:52:36.000Z",
                            "comment": "Inital sent for further review 12/12/24",
                            "user": {
                                "name": "Steve Martin",
                                "id": 1
                            },
                            "statuscode": {
                                "title": "UNDER INITIAL ACCOUNTING REVIEW"
                            }
                        },
                        {
                            "status_id": 155,
                            "update_date": "2024-12-11T16:58:47.000Z",
                            "comment": "12/11/24 Initial Estimate Sent",
                            "user": {
                                "name": "Charles Hanna",
                                "id": 54
                            },
                            "statuscode": {
                                "title": "UNDER INITIAL MANAGER REVIEW"
                            }
                        },
                        {
                            "status_id": 150,
                            "update_date": "2024-12-10T14:08:09.000Z",
                            "comment": "paperwork in car file",
                            "user": {
                                "name": "Mallory Cross",
                                "id": 16
                            },
                            "statuscode": {
                                "title": "WAITING INSPECTION (PHYSICAL)"
                            }
                        },
                        {
                            "status_id": 125,
                            "update_date": "2024-12-09T14:33:52.000Z",
                            "comment": "CAR ARRIVED 12/9/2024 - qualification, blast, and nitrogen pad",
                            "user": {
                                "name": "April Sanches",
                                "id": 8
                            },
                            "statuscode": {
                                "title": "BINDER REVIEW"
                            }
                        },
                        {
                            "status_id": 100,
                            "update_date": "2024-11-11T17:11:15.000Z",
                            "comment": "CREATED BY April Sanches",
                            "user": {
                                "name": "April Sanches",
                                "id": 8
                            },
                            "statuscode": {
                                "title": "ENROUTE"
                            }
                        }
                    ],
                    "routingmatrix": {
                        "name": "IHT 2024 NEW",
                        "id": 11
                    },
                    "routing_matrix_task_assignment": [],
                    "storage_information": [],
                    "secondary_owner_info": null
                }
                //printAAR(workOrder, false, 2);
                printAAR(item, false, 2);
            }else if(docToDownload==='brc'){
                printBRC(workOrder,2)
            }else if(docToDownload==='invoice'){
                if(workOrder.railcar.owner_railcar_owner_idToowner.is_po == 1){
                    if(workOrder.purchase_order != ''){
                        printInvoice(workOrder,2)
                    }else {
                        alert("Purchase order required")
                    }
                }else {
                    printInvoice(workOrder,2)
                }
            }
        } else if (option === 'lessee') {
            if(docToDownload==='aar'){
                printAAR(workOrder, false, 3);
            }else if(docToDownload==='brc'){
                printBRC(workOrder,3)
            }else if(docToDownload==='invoice'){
                if(workOrder.railcar.owner_railcar_lessee_idToowner.is_po == 1){
                    if(workOrder.secondary_owner_info.purchase_order != ''){
                        printInvoice(workOrder,3)
                    }else {
                        alert("Purchase order required")
                    }
                }else {
                    printInvoice(workOrder,3)
                }
            }
        } else if (option === 'combined') {
            if(docToDownload==='aar'){
                printAAR(workOrder, false, 1);
            }else if(docToDownload==='brc'){
                printBRC(workOrder,1)
            }else if(docToDownload==='invoice'){
                if(workOrder.railcar.owner_railcar_owner_idToowner.is_po == 1){
                    if(workOrder.purchase_order != ''){
                        printInvoice(workOrder,1)
                    }else {
                        alert("Purchase order required")
                    }
                }else {
                    printInvoice(workOrder,1)
                }
            }
        }
        handleDialogClose();
    };

    // This is for the...
    useEffect(() => {
        const handleCheckForButtonsOwner = () => {
            if (ownerPurchaseOrder !== ownerPurchaseOrderOriginal || ownerInvoiceNumber !== ownerInvoiceNumberOriginal || ownerInvoiceDate !== ownerInvoiceDateOriginal || String(addDays(ownerInvoiceDate, ownerInvoiceNetDays)) !== String(ownerDueDateOriginal)) {
                console.log("Show buttons will be set to true")
                ownerPurchaseOrder !== ownerPurchaseOrderOriginal ? console.log(`owner purchase order failed`) : console.log(`owner purchase order pass`)
                ownerInvoiceNumber !== ownerInvoiceNumberOriginal ? console.log(`owner invoice number failed`) : console.log(`owner invoice number pass`)
                ownerInvoiceDate !== ownerInvoiceDateOriginal ? console.log(`owner invoice date failed`) : console.log(`owner invoice date pass`)
                console.log(addDays(ownerInvoiceDate, ownerInvoiceNetDays), "changed")
                console.log(ownerDueDateOriginal, "original")
                new Date(addDays(ownerInvoiceDate, ownerInvoiceNetDays)) !== ownerDueDateOriginal ? console.log(`owner due date failed`) : console.log(`owner due date pass`)
                setShowButtonsOwner(true)
            } else {
                setShowButtonsOwner(false)
            }
        }
        handleCheckForButtonsOwner()
    }, [ownerInvoiceDate, ownerInvoiceNetDays, ownerPurchaseOrder, ownerInvoiceNumber])

    useEffect(() => {
        const handleCheckForButtonsLessee = () => {
            let calc = lesseeInvoiceDate !== process.env.REACT_APP_DEFAULT_DATE ? new Date(addDays(lesseeInvoiceDate, lesseeInvoiceNetDays)) : null
            if (lesseePurchaseOrder !== lesseePurchaseOrderOriginal || lesseeInvoiceNumber !== lesseeInvoiceNumberOriginal || lesseeInvoiceDate !== lesseeInvoiceDateOriginal || (calc !== null && String(calc) !== String(lesseeDueDateOriginal))) {
                console.log("Show buttons will be set to true")
                lesseePurchaseOrder !== lesseePurchaseOrderOriginal ? console.log(`lessee purchase order failed`) : console.log(`lessee purchase order pass`)
                lesseeInvoiceNumber !== lesseeInvoiceNumberOriginal ? console.log(`lessee invoice number failed`) : console.log(`lessee invoice number pass`)
                lesseeInvoiceDate !== lesseeInvoiceDateOriginal ? console.log(`lessee invoice date failed`) : console.log(`lessee invoice date pass`)
                console.log(addDays(lesseeInvoiceDate, lesseeInvoiceNetDays), "changed")
                console.log(lesseeDueDateOriginal, "original")
                calc !== lesseeDueDateOriginal ? console.log(`lessee due date failed`) : console.log(`lessee due date pass`)
                setShowButtonsLessee(true)
            } else {
                setShowButtonsLessee(false)
            }
        }
        handleCheckForButtonsLessee()
    }, [lesseeInvoiceDate, lesseeInvoiceNetDays, lesseePurchaseOrder, lesseeInvoiceNumber])

    const handleCancel = () => {
        setOwnerPurchaseOrder(ownerPurchaseOrderOriginal)
        setOwnerInvoiceNumber(ownerInvoiceNumberOriginal)
        setOwnerInvoiceDate(ownerInvoiceDateOriginal)
        setOwnerInvoiceNetDays(ownerInvoiceNetDaysOriginal)
    }

    const handleLesseeCancel = () => {
        setLesseePurchaseOrder(lesseePurchaseOrderOriginal)
        setLesseeInvoiceNumber(lesseeInvoiceNumberOriginal)
        setLesseeInvoiceDate(lesseeInvoiceDateOriginal)
        setLesseeInvoiceNetDays(lesseeInvoiceNetDaysOriginal)
    }

    return (
        <div>
            {workOrder!=null &&
                <dialog id="orderDetailsModal"  ref={orderDetailsModalRef} className="modal rounded-md h-full ">
                    <div className="w-full bg-white">
                        <div className="bg-white h-[60px] w-full pb-5 rounded-md overflow-auto">
                            <div className="w-full fixed bg-[#DCE5FF] px-6 py-[18px] text-lg font-semibold">
                                <div className="flex items-center justify-between">
                                    <span className="float-left">{workOrder?.railcar_id != null ? workOrder.railcar_id : ""}</span>
                                    <div className=" float-left">
                                        <ul className="flex space-x-6">
                                            <li>
                                                <a
                                                    onClick={() => {
                                                        const element = document.getElementById('car_info');
                                                        element?.scrollIntoView({ behavior: 'smooth' });
                                                        window.scrollBy(0, -50); // Adjust scroll by 50px after scrolling into view
                                                    }}
                                                    className="text-base font-bold hover:text-blue-500 cursor-pointer"
                                                >
                                                    Car Information
                                                </a>
                                            </li>
                                            <li>
                                                <a
                                                    onClick={() => {
                                                        const element = document.getElementById('job_list');
                                                        element?.scrollIntoView({ behavior: 'smooth' });
                                                        window.scrollBy(0, -50);
                                                    }}
                                                    className="text-base font-bold hover:text-blue-500 cursor-pointer"
                                                >
                                                    Job List
                                                </a>
                                            </li>
                                            <li>
                                                <a
                                                    onClick={() => {
                                                        const element = document.getElementById('part_list');
                                                        element?.scrollIntoView({ behavior: 'smooth' });
                                                        window.scrollBy(0, -50);
                                                    }}
                                                    className="text-base font-bold hover:text-blue-500 cursor-pointer"
                                                >
                                                    Part List
                                                </a>
                                            </li>
                                            <li>
                                                <a
                                                    onClick={() => {
                                                        const element = document.getElementById('railcar_log');
                                                        element?.scrollIntoView({ behavior: 'smooth' });
                                                        window.scrollBy(0, -50);
                                                    }}
                                                    className="text-base font-bold hover:text-blue-500 cursor-pointer"
                                                >
                                                    Railcar Time Log
                                                </a>
                                            </li>
                                            <li>
                                                <a
                                                    onClick={() => {
                                                        const element = document.getElementById('order_information');
                                                        element?.scrollIntoView({ behavior: 'smooth' });
                                                        window.scrollBy(0, -50);
                                                    }}
                                                    className="text-base font-bold hover:text-blue-500 cursor-pointer"
                                                >
                                                    Order Information
                                                </a>
                                            </li>
                                            <li>
                                                <a
                                                    onClick={() => {
                                                        const element = document.getElementById('billing_information');
                                                        element?.scrollIntoView({ behavior: 'smooth' });
                                                        window.scrollBy(0, -50);
                                                    }}
                                                    className="text-base font-bold hover:text-blue-500 cursor-pointer"
                                                >
                                                    Billing Information
                                                </a>
                                            </li>
                                            <li>
                                                <a
                                                    onClick={() => {
                                                        const element = document.getElementById('storage_information');
                                                        element?.scrollIntoView({ behavior: 'smooth' });
                                                        window.scrollBy(0, -50);
                                                    }}
                                                    className="text-base font-bold hover:text-blue-500 cursor-pointer"
                                                >
                                                    Storage Information
                                                </a>
                                            </li>
                                        </ul>

                                    </div>
                                    <form method="dialog">
                                        <button className="" onClick={closeModal}>
                                            <svg
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M18 6L6 18M6 6L18 18"
                                                    stroke="#464646"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="w-full flex justify-center lg:hidden">
                            <ul tabIndex={0} className="menu menu-horizontal  bg-base-200 rounded-box mt-4">
                                <li className='flex h-fit text-[10px] p-0' onClick={()=>handleListItemClick('brc')}>
                                    <span className="p-1">
                                        <svg width="10" height="10" viewBox="0 0 20 20" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M11.6668 9.16663H6.66683M8.3335 12.5H6.66683M13.3335 5.83329H6.66683M16.6668 5.66663V14.3333C16.6668 15.7334 16.6668 16.4335 16.3943 16.9683C16.1547 17.4387 15.7722 17.8211 15.3018 18.0608C14.767 18.3333 14.067 18.3333 12.6668 18.3333H7.3335C5.93336 18.3333 5.2333 18.3333 4.69852 18.0608C4.22811 17.8211 3.84566 17.4387 3.60598 16.9683C3.3335 16.4335 3.3335 15.7334 3.3335 14.3333V5.66663C3.3335 4.26649 3.3335 3.56643 3.60598 3.03165C3.84566 2.56124 4.22811 2.17879 4.69852 1.93911C5.2333 1.66663 5.93336 1.66663 7.3335 1.66663H12.6668C14.067 1.66663 14.767 1.66663 15.3018 1.93911C15.7722 2.17879 16.1547 2.56124 16.3943 3.03165C16.6668 3.56643 16.6668 4.26649 16.6668 5.66663Z"
                                                stroke="#23393D" strokeWidth="1.3" strokeLinecap="round"
                                                strokeLinejoin="round"/>
                                        </svg>
                                        BRC
                                    </span>
                                </li>
                                <li className='flex h-fit text-[10px] p-0'  onClick={()=>handleListItemClick('aar')}>
                                    <span className="p-1">
                                        <svg width="10" height="10" viewBox="0 0 20 20" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M14.1665 14.1667L18.3332 10L14.1665 5.83333M5.83317 5.83333L1.6665 10L5.83317 14.1667M11.6665 2.5L8.33317 17.5"
                                                stroke="#23393D" strokeWidth="1.3" strokeLinecap="round"
                                                strokeLinejoin="round"/>
                                        </svg>
                                        ARR-500B
                                    </span>
                                </li>
                                <li className='flex h-fit text-[10px] p-0'  onClick={()=>printBBOM(workOrder)}>
                                    <span className="p-1">
                                        <svg width="10" height="10" viewBox="0 0 20 20" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M14.1665 14.1667L18.3332 10L14.1665 5.83333M5.83317 5.83333L1.6665 10L5.83317 14.1667M11.6665 2.5L8.33317 17.5"
                                                stroke="#23393D" strokeWidth="1.3" strokeLinecap="round"
                                                strokeLinejoin="round"/>
                                        </svg>
                                        BBOM
                                    </span>
                                </li>
                                <li className='flex h-fit text-[10px] p-0' onClick={()=>handleListItemClick('invoice')}>
                                    <span className="p-1">
                                        <svg width="10" height="10" viewBox="0 0 20 20" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M11.6668 9.16663H6.66683M8.3335 12.5H6.66683M13.3335 5.83329H6.66683M16.6668 5.66663V14.3333C16.6668 15.7334 16.6668 16.4335 16.3943 16.9683C16.1547 17.4387 15.7722 17.8211 15.3018 18.0608C14.767 18.3333 14.067 18.3333 12.6668 18.3333H7.3335C5.93336 18.3333 5.2333 18.3333 4.69852 18.0608C4.22811 17.8211 3.84566 17.4387 3.60598 16.9683C3.3335 16.4335 3.3335 15.7334 3.3335 14.3333V5.66663C3.3335 4.26649 3.3335 3.56643 3.60598 3.03165C3.84566 2.56124 4.22811 2.17879 4.69852 1.93911C5.2333 1.66663 5.93336 1.66663 7.3335 1.66663H12.6668C14.067 1.66663 14.767 1.66663 15.3018 1.93911C15.7722 2.17879 16.1547 2.56124 16.3943 3.03165C16.6668 3.56643 16.6668 4.26649 16.6668 5.66663Z"
                                                stroke="#23393D" strokeWidth="1.3" strokeLinecap="round"
                                                strokeLinejoin="round"/>
                                        </svg>
                                        Invoice
                                    </span>
                                </li>
                                <li className='flex h-fit text-[10px] p-0' onClick={()=>printATask(workOrder)}>
                                    <span className="p-1">
                                        <svg width="10" height="10" viewBox="0 0 20 20" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M17.5 9.99996L7.5 9.99996M17.5 4.99996L7.5 4.99996M17.5 15L7.5 15M4.16667 9.99996C4.16667 10.4602 3.79357 10.8333 3.33333 10.8333C2.8731 10.8333 2.5 10.4602 2.5 9.99996C2.5 9.53972 2.8731 9.16663 3.33333 9.16663C3.79357 9.16663 4.16667 9.53972 4.16667 9.99996ZM4.16667 4.99996C4.16667 5.4602 3.79357 5.83329 3.33333 5.83329C2.8731 5.83329 2.5 5.4602 2.5 4.99996C2.5 4.53972 2.8731 4.16663 3.33333 4.16663C3.79357 4.16663 4.16667 4.53972 4.16667 4.99996ZM4.16667 15C4.16667 15.4602 3.79357 15.8333 3.33333 15.8333C2.8731 15.8333 2.5 15.4602 2.5 15C2.5 14.5397 2.8731 14.1666 3.33333 14.1666C3.79357 14.1666 4.16667 14.5397 4.16667 15Z"
                                                stroke="#23393D" strokeWidth="1.3" strokeLinecap="round"
                                                strokeLinejoin="round"/>
                                        </svg>
                                        Work Order
                                    </span>
                                </li>

                                <li
                                    className={`flex h-fit text-[10px] p-0 ${workOrder.locked_by>0 || workOrder?.joblist.length > 0 ? 'opacity-50' : 'cursor-pointer'}`}
                                    style={{ pointerEvents: workOrder?.joblist.length > 0 ? 'none' : 'auto' } } onClick={()=>deleteWorkOrder(workOrder.id,workOrder.work_order)}
                                >
                                  <span className="p-1">
                                    <svg width="10" height="10" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path
                                          d="M17.5 9.99996L7.5 9.99996M17.5 4.99996L7.5 4.99996M17.5 15L7.5 15M4.16667 9.99996C4.16667 10.4602 3.79357 10.8333 3.33333 10.8333C2.8731 10.8333 2.5 10.4602 2.5 9.99996C2.5 9.53972 2.8731 9.16663 3.33333 9.16663C3.79357 9.16663 4.16667 9.53972 4.16667 9.99996ZM4.16667 4.99996C4.16667 5.4602 3.79357 5.83329 3.33333 5.83329C2.8731 5.83329 2.5 5.4602 2.5 4.99996C2.5 4.53972 2.8731 4.16663 3.33333 4.16663C3.79357 4.16663 4.16667 4.53972 4.16667 4.99996ZM4.16667 15C4.16667 15.4602 3.79357 15.8333 3.33333 15.8333C2.8731 15.8333 2.5 15.4602 2.5 15C2.5 14.5397 2.8731 14.1666 3.33333 14.1666C3.79357 14.1666 4.16667 14.5397 4.16667 15Z"
                                          stroke="#23393D" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
                                      />
                                    </svg>
                                    DELETE
                                  </span>
                                </li>


                            </ul>
                            <Dialog
                                open={openDialog}
                                onClose={handleDialogClose}
                                container={() => document.querySelector('#orderDetailsModal')} // Ensure it appears within the correct component
                                style={{ zIndex: 1300 }} // Ensure it has a proper zIndex
                            >
                                <DialogTitle>Select from the  Options</DialogTitle>
                                <DialogActions>
                                    <Button onClick={() => handleButtonClick('owner')} color="primary">
                                        For Owner
                                    </Button>
                                    <Button onClick={() => handleButtonClick('lessee')} color="primary">
                                        For Lessee
                                    </Button>
                                    <Button onClick={() => handleButtonClick('combined')} color="primary">
                                        Combined
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </div>

                        <div className="bg-[#F7F9FF] w-full py-10 px-24  max-h-[100vh]  rounded overflow-auto mb-5">
                            {/*Side menu*/}
                            <div className="absolute top-1/3 right-4 hidden lg:block">
                                <ul tabIndex={0} className="dropdown-content z-[1] menu  shadow bg-white p-0">
                                    <li className='flex h-fit text-[10px] p-0' onClick={()=>handleListItemClick('brc')}>
                                    <span className="p-1">
                                        <svg width="10" height="10" viewBox="0 0 20 20" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M11.6668 9.16663H6.66683M8.3335 12.5H6.66683M13.3335 5.83329H6.66683M16.6668 5.66663V14.3333C16.6668 15.7334 16.6668 16.4335 16.3943 16.9683C16.1547 17.4387 15.7722 17.8211 15.3018 18.0608C14.767 18.3333 14.067 18.3333 12.6668 18.3333H7.3335C5.93336 18.3333 5.2333 18.3333 4.69852 18.0608C4.22811 17.8211 3.84566 17.4387 3.60598 16.9683C3.3335 16.4335 3.3335 15.7334 3.3335 14.3333V5.66663C3.3335 4.26649 3.3335 3.56643 3.60598 3.03165C3.84566 2.56124 4.22811 2.17879 4.69852 1.93911C5.2333 1.66663 5.93336 1.66663 7.3335 1.66663H12.6668C14.067 1.66663 14.767 1.66663 15.3018 1.93911C15.7722 2.17879 16.1547 2.56124 16.3943 3.03165C16.6668 3.56643 16.6668 4.26649 16.6668 5.66663Z"
                                                stroke="#23393D" strokeWidth="1.3" strokeLinecap="round"
                                                strokeLinejoin="round"/>
                                        </svg>
                                        BRC
                                    </span>
                                    </li>
                                    <li className='flex h-fit text-[10px] p-0'  onClick={()=>handleListItemClick('aar')}>
                                    <span className="p-1">
                                        <svg width="10" height="10" viewBox="0 0 20 20" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M14.1665 14.1667L18.3332 10L14.1665 5.83333M5.83317 5.83333L1.6665 10L5.83317 14.1667M11.6665 2.5L8.33317 17.5"
                                                stroke="#23393D" strokeWidth="1.3" strokeLinecap="round"
                                                strokeLinejoin="round"/>
                                        </svg>
                                        ARR-500B
                                    </span>
                                    </li>
                                    <li className='flex h-fit text-[10px] p-0'  onClick={()=>printBBOM(workOrder)}>
                                    <span className="p-1">
                                        <svg width="10" height="10" viewBox="0 0 20 20" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M14.1665 14.1667L18.3332 10L14.1665 5.83333M5.83317 5.83333L1.6665 10L5.83317 14.1667M11.6665 2.5L8.33317 17.5"
                                                stroke="#23393D" strokeWidth="1.3" strokeLinecap="round"
                                                strokeLinejoin="round"/>
                                        </svg>
                                        BBOM
                                    </span>
                                    </li>
                                    <li className='flex h-fit text-[10px] p-0' onClick={()=>handleListItemClick('invoice')}>
                                    <span className="p-1">
                                        <svg width="10" height="10" viewBox="0 0 20 20" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M11.6668 9.16663H6.66683M8.3335 12.5H6.66683M13.3335 5.83329H6.66683M16.6668 5.66663V14.3333C16.6668 15.7334 16.6668 16.4335 16.3943 16.9683C16.1547 17.4387 15.7722 17.8211 15.3018 18.0608C14.767 18.3333 14.067 18.3333 12.6668 18.3333H7.3335C5.93336 18.3333 5.2333 18.3333 4.69852 18.0608C4.22811 17.8211 3.84566 17.4387 3.60598 16.9683C3.3335 16.4335 3.3335 15.7334 3.3335 14.3333V5.66663C3.3335 4.26649 3.3335 3.56643 3.60598 3.03165C3.84566 2.56124 4.22811 2.17879 4.69852 1.93911C5.2333 1.66663 5.93336 1.66663 7.3335 1.66663H12.6668C14.067 1.66663 14.767 1.66663 15.3018 1.93911C15.7722 2.17879 16.1547 2.56124 16.3943 3.03165C16.6668 3.56643 16.6668 4.26649 16.6668 5.66663Z"
                                                stroke="#23393D" strokeWidth="1.3" strokeLinecap="round"
                                                strokeLinejoin="round"/>
                                        </svg>
                                        Invoice
                                    </span>
                                    </li>
                                    <li className='flex h-fit text-[10px] p-0' onClick={()=>printATask(workOrder)}>
                                    <span className="p-1">
                                        <svg width="10" height="10" viewBox="0 0 20 20" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M17.5 9.99996L7.5 9.99996M17.5 4.99996L7.5 4.99996M17.5 15L7.5 15M4.16667 9.99996C4.16667 10.4602 3.79357 10.8333 3.33333 10.8333C2.8731 10.8333 2.5 10.4602 2.5 9.99996C2.5 9.53972 2.8731 9.16663 3.33333 9.16663C3.79357 9.16663 4.16667 9.53972 4.16667 9.99996ZM4.16667 4.99996C4.16667 5.4602 3.79357 5.83329 3.33333 5.83329C2.8731 5.83329 2.5 5.4602 2.5 4.99996C2.5 4.53972 2.8731 4.16663 3.33333 4.16663C3.79357 4.16663 4.16667 4.53972 4.16667 4.99996ZM4.16667 15C4.16667 15.4602 3.79357 15.8333 3.33333 15.8333C2.8731 15.8333 2.5 15.4602 2.5 15C2.5 14.5397 2.8731 14.1666 3.33333 14.1666C3.79357 14.1666 4.16667 14.5397 4.16667 15Z"
                                                stroke="#23393D" strokeWidth="1.3" strokeLinecap="round"
                                                strokeLinejoin="round"/>
                                        </svg>
                                        Work Order
                                    </span>
                                    </li>

                                    <li
                                        className={`flex h-fit text-[10px] p-0 ${workOrder.locked_by>0 || workOrder?.joblist.length > 0 ? 'opacity-50' : 'cursor-pointer'}`}
                                        style={{ pointerEvents: workOrder?.joblist.length > 0 ? 'none' : 'auto' } } onClick={()=>deleteWorkOrder(workOrder.id,workOrder.work_order)}
                                    >
                                  <span className="p-1">
                                    <svg width="10" height="10" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path
                                          d="M17.5 9.99996L7.5 9.99996M17.5 4.99996L7.5 4.99996M17.5 15L7.5 15M4.16667 9.99996C4.16667 10.4602 3.79357 10.8333 3.33333 10.8333C2.8731 10.8333 2.5 10.4602 2.5 9.99996C2.5 9.53972 2.8731 9.16663 3.33333 9.16663C3.79357 9.16663 4.16667 9.53972 4.16667 9.99996ZM4.16667 4.99996C4.16667 5.4602 3.79357 5.83329 3.33333 5.83329C2.8731 5.83329 2.5 5.4602 2.5 4.99996C2.5 4.53972 2.8731 4.16663 3.33333 4.16663C3.79357 4.16663 4.16667 4.53972 4.16667 4.99996ZM4.16667 15C4.16667 15.4602 3.79357 15.8333 3.33333 15.8333C2.8731 15.8333 2.5 15.4602 2.5 15C2.5 14.5397 2.8731 14.1666 3.33333 14.1666C3.79357 14.1666 4.16667 14.5397 4.16667 15Z"
                                          stroke="#23393D" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
                                      />
                                    </svg>
                                    DELETE
                                  </span>
                                    </li>


                                </ul>
                                <Dialog
                                    open={openDialog}
                                    onClose={handleDialogClose}
                                    container={() => document.querySelector('#orderDetailsModal')} // Ensure it appears within the correct component
                                    style={{ zIndex: 1300 }} // Ensure it has a proper zIndex
                                >
                                    <DialogTitle>Select from the  Options</DialogTitle>
                                    <DialogActions>
                                        <Button onClick={() => handleButtonClick('owner')} color="primary">
                                            For Owner
                                        </Button>
                                        <Button onClick={() => handleButtonClick('lessee')} color="primary">
                                            For Lessee
                                        </Button>
                                        <Button onClick={() => handleButtonClick('combined')} color="primary">
                                            Combined
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </div>
                            {/*End Side menu*/}
                            <div className=" w-full">
                                {/*Car information */}
                                <div className="w-full bg-white p-4  mt-[24px]" id="car_info">
                                    <h6 className='font-semibold'>Car Information</h6>
                                    <div className="mt-[5px]  grid grid-cols-6 gap-10">
                                        <div className="">
                                            <p className='font-normal '>Equipment</p>
                                            <p className='text-[#979C9E] mt-[5px]'>{workOrder.railcar_id}</p>
                                        </div>
                                        <div className="">
                                            <p className='font-normal '>Car type</p>
                                            <p className='text-[#979C9E] mt-[5px]'>{workOrder.railcar.railcartype.name}</p>
                                        </div>
                                        <div className="">
                                            <p className='font-normal '>Last Product</p>
                                            <p className='text-[#979C9E] mt-[5px]'>{workOrder.railcar.products.name}</p>
                                        </div>
                                        <div className="">
                                            <p className='font-normal '>El Index</p>
                                            <p className='text-[#979C9E] mt-[5px]'>{workOrder.el_index}</p>
                                        </div>
                                        <div className="">
                                            <p className='font-normal '>Owner</p>
                                            <p className='text-[#979C9E] mt-[5px]'>{workOrder.railcar.owner_railcar_owner_idToowner.name}</p>
                                        </div>
                                        <div className="">
                                            <p className='font-normal '>Lesse</p>
                                            <p className='text-[#979C9E] mt-[5px]'>{workOrder.railcar.owner_railcar_lessee_idToowner.name}</p>
                                        </div>
                                    </div>
                                </div>
                                {/*End Car information */}
                                {/*Job list */}
                                <div className="w-full bg-white p-4  mt-[24px] rounded-none" id="job_list">
                                    <JoblistTable
                                        handlePaste={pasteJobs}
                                        jobs={jobs}
                                        workOrder={workOrder}
                                        commonData = {commonData}
                                        isBilledToLessee={isBilledToLessee}
                                        createAjob={createAjob}
                                        updateAJob={updateAJob}
                                        deleteJob={deleteJob}
                                        updateBillToLesseForAJob={updateBillToLesseForAJob}/>

                                </div>

                                {/*end job list */}


                                <div className="w-full bg-white p-[25px]  mt-[24px] border rounded  grid grid-cols-4 gap-x-64">
                                    <div className="">
                                        <h2 className='text-[12px] font-normal '>TOTAL HOURS</h2>
                                        <p className='text-[#979C9E] mt-[2px]'>{round2Dec(totalLaborHours)} Hrs</p>
                                    </div>
                                    <div className="">
                                        <h2 className='text-[12px] font-normal '>TOTAL LABOUR COST</h2>
                                        <p className='text-[#979C9E] mt-[2px]'>$ {round2Dec(totalLaborCost)}</p>
                                    </div>
                                    <div className="">
                                        <h2 className='text-[12px] font-normal '>TOTAL MATERIALS</h2>
                                        <p className='text-[#979C9E] mt-[2px]'>$ {round2Dec(totalMatCost)}</p>
                                    </div>
                                    <div className="]">
                                        <h2 className='text-[12px] font-normal '>TOTAL NET</h2>
                                        <p className='text-[#979C9E] mt-[2px]'>$ {round2Dec(totalLaborCost+totalMatCost)}</p>
                                    </div>


                                </div>
                            </div>
                            {/*Parts information*/}
                            {/*<div className="w-full bg-white p-4  mt-[24px] rounded-none" id="part_list">*/}
                            {/*    <PartsTable jobs={workOrder.joblist}/>*/}
                            {/*</div>*/}

                            <div className="w-full bg-white p-4  mt-[24px] rounded-none" id="part_list">
                                <PartReportTable initialData={partReport}/>
                            </div>
                            {/*End Parts information*/}

                            {/*Railcar log*/}

                            {railCarLog.length>0 && (hasRole('ADMIN') || hasRole('TECH') || hasRole('MANAGEMENT')   || hasRole('TIME APPROVAL')) &&(
                                <div className="w-full bg-white p-4  mt-[24px] rounded-none mb-5" id="railcar_log">
                                    <RailCareTimeLog railcarLog={railCarLog} locked_for_time_clockinhg ={workOrder.locked_for_time_clocking} workOrder={workOrder} laboorHRSEST={totalLaborHours}/>
                                </div>
                            )}
                            {/*Routing propagation*/}
                            {hasRole('TECH') && (
                                <div className="w-full bg-white p-4 mt-[24px] rounded-none mb-10">
                                    <TaskTable
                                        work_id={workOrder.id}
                                        workOrder={workOrder}
                                    />
                                </div>
                            )}

                            {/*Railcar log*/}

                            {/*Order information */}
                            <div className="w-full bg-white p-2" id="order_information">
                                <h6 className='font-semibold'>Order Information</h6>
                                <div className="mt-[8px]  grid grid-cols-2 ">
                                    <div>
                                        <div className="mt-[8px]  grid grid-cols-5 gap-0.5">
                                            <div className="p-2">
                                                <p className='text-xs font-normal'>#Wo Number</p>
                                                <p className='text-[#979C9E] text-xs font-normal'>{workOrder.work_order}</p>
                                            </div>
                                            <div className="p-2">
                                                <p className='text-xs font-normal'>Yard</p>
                                                <p className='text-[#979C9E] text-xs font-normal'>{workOrder.yard.name ? workOrder.yard.name : ""}</p>
                                            </div>
                                            <div className="p-2">
                                                <p className='text-xs font-normal'>SPLC</p>
                                                <p className='text-[#979C9E] text-xs font-normal'>{workOrder.yard.name ? workOrder.yard.splc : ""}</p>
                                            </div>
                                            <div className="p-2">
                                                <p className='text-xs font-normal'>Details Source</p>
                                                <p className='text-[#979C9E] text-xs font-normal'>{workOrder.yard.detail_source ? workOrder.yard.detail_source : ""}</p>
                                            </div>
                                            <div className="p-2">
                                                <p className='text-xs font-normal'>Facility Type</p>
                                                <p className='text-[#979C9E] text-xs font-normal'>{workOrder.yard.facility_type ? workOrder.yard.facility_type : ""}</p>
                                            </div>
                                        </div>
                                        <div className="mt-[8px]  grid grid-cols-5 gap-0.5">
                                            <div className="p-1 items-start">
                                                <p className='text-xs font-normal'>Arrival Date</p>
                                                <span className="w-full items-start align-top">
                                                  <DatePicker
                                                      customInput={<CustomDateInputFullWidth
                                                          value={workOrder.arrival_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.arrival_date).toLocaleDateString() : null}/>}
                                                      selected={workOrder.arrival_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.arrival_date) : null}
                                                      onChange={
                                                          newDate => handleArrivalDate(newDate)
                                                      }
                                                      disabled={workOrder.locked_by!=null}
                                                      isClearable ={workOrder.locked_by==null}
                                                      showYearDropdown
                                                      dateFormat="MM-dd-yyyy"
                                                  />
                                                </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal '>Inspection Date</p>
                                                <span>
                                                  <DatePicker
                                                      customInput={<CustomDateInputFullWidth
                                                          value={workOrder.inspected_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.inspected_date).toLocaleDateString() : null}/>}
                                                      selected={workOrder.inspected_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.inspected_date) : null}
                                                      onChange={
                                                          newDate => handleInspectionDate(newDate)
                                                      }
                                                      disabled={workOrder.locked_by!=null}
                                                      isClearable ={workOrder.locked_by==null}
                                                      showYearDropdown
                                                      dateFormat="MM-dd-yyyy"
                                                  />
                                                </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal '>Clean Date</p>
                                                <span>
                                              <DatePicker
                                                  customInput={<CustomDateInputFullWidth
                                                      value={workOrder.clean_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.clean_date).toLocaleDateString() : null}/>}
                                                  selected={workOrder.clean_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.clean_date) : null}
                                                  onChange={
                                                      newDate => handleCleanDate(newDate)
                                                  }
                                                  disabled={workOrder.locked_by!=null}
                                                  isClearable ={workOrder.locked_by==null}
                                                  showYearDropdown
                                                  dateFormat="MM-dd-yyyy"
                                              />
                                        </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal'>Valve tear down </p>
                                                <span>
                                                      <DatePicker
                                                          customInput={<CustomDateInputFullWidth
                                                              value={workOrder.valve_tear_down !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.valve_tear_down).toLocaleDateString() : null}/>}
                                                          selected={workOrder.valve_tear_down !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.valve_tear_down) : null}
                                                          onChange={
                                                              newDate => handleValveTearDownDate(newDate)
                                                          }
                                                          disabled={workOrder.locked_by!=null}
                                                          isClearable ={workOrder.locked_by==null}
                                                          showYearDropdown
                                                          dateFormat="MM-dd-yyyy"
                                                      />
                                                </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal '>Repair Scheduled </p>
                                                <span>
                                              <DatePicker
                                                  customInput={<CustomDateInputFullWidth
                                                      value={workOrder.repair_schedule_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.repair_schedule_date).toLocaleDateString() : null}/>}
                                                  selected={workOrder.repair_schedule_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.repair_schedule_date) : null}
                                                  onChange={
                                                      newDate => handleRepairScheduleDate(newDate)
                                                  }
                                                  disabled={workOrder.locked_by!=null}
                                                  isClearable ={workOrder.locked_by==null}
                                                  showYearDropdown
                                                  dateFormat="MM-dd-yyyy"
                                              />
                                        </span>
                                            </div>
                                        </div>
                                        <div className="mt-[8px]  grid grid-cols-5 gap-0.5">

                                            <div className="p-1">
                                                <p className='text-xs font-normal'>Valve assembly </p>
                                                <span>
                                                      <DatePicker
                                                          customInput={<CustomDateInputFullWidth
                                                              value={workOrder.valve_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.valve_date).toLocaleDateString() : null}/>}
                                                          selected={workOrder.valve_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.valve_date) : null}
                                                          onChange={
                                                              newDate => handleValveAssemblyDate(newDate)
                                                          }
                                                          disabled={workOrder.locked_by!=null}
                                                          isClearable ={workOrder.locked_by==null}
                                                          showYearDropdown
                                                          dateFormat="MM-dd-yyyy"
                                                      />
                                                </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal'>Interior Paint </p>
                                                <span>
                                                      <DatePicker
                                                          customInput={<CustomDateInputFullWidth
                                                              value={workOrder.paint_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.paint_date).toLocaleDateString() : null}/>}
                                                          selected={workOrder.paint_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.paint_date) : null}
                                                          onChange={
                                                              newDate => handlePaintDate(newDate)
                                                          }
                                                          disabled={workOrder.locked_by!=null}
                                                          isClearable ={workOrder.locked_by==null}
                                                          showYearDropdown
                                                          dateFormat="MM-dd-yyyy"
                                                      />
                                                </span>
                                            </div>
                                            <div className="p-1 ">
                                                <p className='text-xs font-normal'>Exterior paint </p>
                                                <span>
                                                  <DatePicker
                                                      customInput={<CustomDateInputFullWidth
                                                          value={workOrder.exterior_paint !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.exterior_paint).toLocaleDateString() : null}/>}
                                                      selected={workOrder.exterior_paint !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.exterior_paint) : null}
                                                      onChange={
                                                          newDate => handleExteriorPaintDate(newDate)
                                                      }
                                                      disabled={workOrder.locked_by!=null}
                                                      isClearable ={workOrder.locked_by==null}
                                                      showYearDropdown
                                                      dateFormat="MM-dd-yyyy"
                                                  />
                                                </span>
                                            </div>
                                            <div className="p-1 ">
                                                <p className='text-xs font-normal'>PD date</p>
                                                <span>
                                                  <DatePicker
                                                      customInput={<CustomDateInputFullWidth
                                                          value={workOrder.pd_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.pd_date).toLocaleDateString() : null}/>}
                                                      selected={workOrder.pd_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.pd_date) : null}
                                                      onChange={
                                                          newDate => handlePDDate(newDate)
                                                      }
                                                      disabled={workOrder.locked_by!=null}
                                                      isClearable ={workOrder.locked_by==null}
                                                      showYearDropdown
                                                      dateFormat="MM-dd-yyyy"
                                                  />
                                                </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal '>Final Date</p>
                                                <span>
                                              <DatePicker
                                                  customInput={<CustomDateInputFullWidth
                                                      value={workOrder.final_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.final_date).toLocaleDateString() : null}/>}
                                                  selected={workOrder.final_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.final_date) : null}
                                                  onChange={
                                                      newDate => handleFinalDate(newDate)
                                                  }
                                                  disabled={workOrder.locked_by!=null}
                                                  isClearable ={workOrder.locked_by==null}
                                                  showYearDropdown
                                                  dateFormat="MM-dd-yyyy"
                                              />
                                        </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal'>QA Date</p>
                                                <span>
                                                  <DatePicker
                                                      customInput={<CustomDateInputFullWidth
                                                          value={workOrder.qa_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.qa_date).toLocaleDateString() : null}/>}
                                                      selected={workOrder.qa_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.qa_date) : null}
                                                      onChange={
                                                          newDate => handleQADate(newDate)
                                                      }
                                                      disabled={workOrder.locked_by!=null}
                                                      isClearable ={workOrder.locked_by==null}
                                                      showYearDropdown
                                                      dateFormat="MM-dd-yyyy"
                                                  />
                                                </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal '>POD</p>
                                                <span>
                                              <DatePicker
                                                  customInput={<CustomDateInputFullWidth
                                                      value={workOrder.projected_out_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.projected_out_date).toLocaleDateString() : null}/>}
                                                  selected={workOrder.projected_out_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.projected_out_date) : null}
                                                  onChange={
                                                      newDate => handlePOD(newDate)
                                                  }
                                                  disabled={workOrder.locked_by!=null}
                                                  isClearable ={workOrder.locked_by==null}
                                                  showYearDropdown
                                                  dateFormat="MM-dd-yyyy"
                                              />
                                                </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal '>MTI</p>
                                                <span>
                                                  <DatePicker
                                                      customInput={<CustomDateInputFullWidth
                                                          value={workOrder.month_to_invoice !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.month_to_invoice).toLocaleDateString() : null}/>}
                                                      selected={workOrder.month_to_invoice !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.month_to_invoice) : null}
                                                      onChange={
                                                          newDate => handleMTI(newDate)
                                                      }
                                                      disabled={workOrder.locked_by!=null}
                                                      isClearable ={workOrder.locked_by==null}
                                                      showYearDropdown
                                                      dateFormat="MM-dd-yyyy"
                                                  />
                                                </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal '>MO/WK</p>
                                                <span>
                                                <input type="text" disabled={workOrder.locked_by!=null}
                                                       className="flex items-center justify-between  border  rounded-[4px] w-[90px] whitespace-nowrap overflow-hidden h-[32px] p-1"
                                                       id="mo_wk_in_details" ref={mowkRef} onChange={handleMOWK}
                                                       value={mo_wk} onKeyUp={postMOWKUpdate}/>
                                                </span>
                                            </div>

                                            <div className="p-1">
                                                <p className='text-xs font-normal '>Repair date</p>
                                                <span>
                                              <DatePicker
                                                  customInput={
                                                      <CustomDateInputFullWidth
                                                          value={
                                                              workOrder.repair_date !== process.env.REACT_APP_DEFAULT_DATE
                                                                  ? new Date(workOrder.repair_date).toLocaleDateString()
                                                                  : null
                                                          }
                                                      />
                                                  }
                                                  selected={
                                                      workOrder.repair_date !== process.env.REACT_APP_DEFAULT_DATE
                                                          ? new Date(workOrder.repair_date)
                                                          : null
                                                  }
                                                  disabled={workOrder.locked_by!=null}
                                                  isClearable ={workOrder.locked_by==null}
                                                  onChange={newDate => handleRepairDate(newDate)}
                                                  showYearDropdown
                                                  dateFormat="MM-dd-yyyy"
                                              />

                                                </span>
                                            </div>


                                        </div>
                                        <div className="mt-[8px]  grid grid-cols-4 gap-1">
                                            <div className="p-1">
                                                <p className='text-xs font-normal '>Special Process</p>
                                                <span>
                                                <input type="text" disabled={workOrder.locked_by!=null}
                                                       className="flex items-center justify-between  border w-[124px]  rounded-[4px]  whitespace-nowrap overflow-hidden h-[32px] p-1"
                                                       id="sp_in_details" ref={spRef} onChange={handleSP}
                                                       value={sp} onKeyUp={postSPUpdate}/>
                                                </span>
                                            </div>

                                            <div className="p-1">
                                                <p className='text-xs font-normal '>Tank QUAlification</p>
                                                <span>
                                                <input type="text"  disabled={workOrder.locked_by!=null}
                                                       className="flex items-center justify-between  border w-[124px]  rounded-[4px]  whitespace-nowrap overflow-hidden h-[32px] p-1"
                                                       id="tq_in_details" ref={tqRef} onChange={handleTQ}
                                                       value={tq} onKeyUp={postTQUpdate}/>
                                                </span>
                                            </div>


                                            <div className="p-1">
                                                <p className='text-xs font-normal '>RELINE</p>
                                                <span>
                                                <input type="text" disabled={workOrder.locked_by!=null}
                                                       className="flex items-center justify-between  border w-[124px] rounded-[4px]  whitespace-nowrap overflow-hidden h-[32px] p-1"
                                                       id="re_in_details" ref={reRef} onChange={handleRE}
                                                       value={re} onKeyUp={postREUpdate}/>
                                                </span>
                                            </div>


                                            <div className="p-1">
                                                <p className='text-xs font-normal '>Ex Paint Element </p>
                                                <span>
                                                <input type="text" disabled={workOrder.locked_by!=null}
                                                       className="flex items-center justify-between  border w-[124px] rounded-[4px]  whitespace-nowrap overflow-hidden h-[32px] p-1"
                                                       id="ep_in_details" ref={epRef} onChange={handleEP}
                                                       value={ep} onKeyUp={postEPUpdate}/>
                                                </span>
                                            </div>


                                        </div>
                                    </div>
                                    <div className='grid grid-cols-2 gap-10'>

                                        <div className="mt-[8px]">
                                            <div className='p-1'>
                                                <p className='text-xs font-normal'>Status</p>
                                                <span>
                                                <select onChange={(e) => handleDropdownChangeInDetails(e, workOrder.id)}
                                                        disabled={workOrder.locked_by > 0}
                                                        className={`w-full placeholder-opacity-90 mr-4 py-2 ${workOrder.index % 2 === 0 ? '' : 'bg-[#F7F9FF]'}`}>
                                                    {statusCode.map((sc) => (
                                                        <option className={'w-29'} key={sc.code}
                                                                selected={workOrder.workupdates[0].status_id === sc.code}>
                                                            {sc.code + ":" + sc.title}
                                                        </option>
                                                    ))}
                                                </select>
                                                </span>
                                            </div>


                                            <div className='p-1 mt-[10px]'>
                                                <p className='text-xs font-normal'>Routing Status</p>
                                                <p>{formatTasks(workOrder.routing_matrix_task_assignment) == "" ? "ALL steps completed" : formatTasks(workOrder.routing_matrix_task_assignment)}</p>
                                                <p>(Following {workOrder.routingmatrix.name} routing)</p>
                                            </div>


                                            <div className='mt-[8px] '>
                                                <div className='p-1 align-middle  inline-block'>
                                                    <p className='text-xs font-normal w-max float-left align-middle mt-[4px]'>
                                                        Storage Cars</p>
                                                    <input
                                                        disabled={storageInformation.length > 0}
                                                        type="checkbox"
                                                        checked={workOrder.is_storage ==1}
                                                        onChange={(e) => updateStorage(e.target.checked)}
                                                        className=" checkbox checkbox-primary float-left ml-2 align-middle"/>

                                                </div>
                                            </div>

                                            <div className='mt-[8px] '>
                                                <p>{storageInformation.length > 0 && sumOfDayDifferences(storageInformation) > 0 ? "Car is in storage and not billed for " + sumOfDayDifferences(storageInformation) + "  days" : ""}</p>
                                            </div>
                                            <div className='mt-[8px] '>
                                                <div className='p-1 align-middle  inline-block'>
                                                    <p className='text-xs font-normal w-max float-left align-middle mt-[4px]'>
                                                        Locked for Time clocking</p>
                                                    <input
                                                        disabled={workOrder.locked_by != null}
                                                        type="checkbox"
                                                        checked={workOrder.locked_for_time_clocking == 1}
                                                        onChange={(e) => updateLockForTimeClocking(e.target.checked)}
                                                        className=" checkbox checkbox-primary float-left ml-2 align-middle"/>

                                                </div>
                                            </div>

                                            <div className='mt-[8px] '>
                                                <div className='p-1 align-middle  inline-block'>
                                                    <p className='text-xs font-normal w-max float-left align-middle mt-[4px]'>
                                                        BILL TO LESSEE </p>
                                                    <input
                                                        disabled={workOrder.locked_by != null}
                                                        type="checkbox"
                                                        onChange={handleIsBilledToLessee}
                                                        checked={isBilledToLessee}
                                                        className=" checkbox checkbox-primary float-left ml-2 align-middle"/>
                                                </div>
                                            </div>

                                        </div>

                                        <div className="mt-[8px]">
                                            <div className=''>
                                                <div className='p-1'>
                                                    <p className='text-xs font-normal'>Reasons to come</p>
                                                    <textarea rows="2" disabled={workOrder.locked_by!=null}
                                                              className='text-[#979C9E] w-full p-2 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 my-4'
                                                              id="reasonToComeInDetails"
                                                              value={reasonToCome}
                                                              onChange={handleReasonToComeChange}/>

                                                    {isReasonToComeChanged == true && ( // Render the button only if the reason is changed
                                                        <span>
                                                            <button
                                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                                                onClick={handleUpdateReasonToCome}
                                                            >
                                                                UPDATE
                                                            </button>

                                                            <button
                                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
                                                                onClick={handleCancelReasonToCome}
                                                            >
                                                            CANCEL
                                                            </button>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/*End Order information */}



                            {/*Order information Owner */}
                            <div className="w-full bg-white p-4  mb-10 mt-[24px] rounded-none" id="billing_information">

                                <h6 className='font-semibold '>Billing Information(Owner)</h6>
                                <div className="grid grid-cols-3 gap-x-0.5">
                                    <div className='p-2'>
                                        <p>Purchase Order</p>
                                        <input type="text" className="input input-bordered  h-8 mt-2 w-full"
                                               onChange={handleOwnerPurchaseOrderChange} disabled={workOrder.locked_by!=null}

                                               id="purchase_order_owner" value={ownerPurchaseOrder}/>
                                        <p className='mt-2'>INVOICE NUMBER</p>
                                        <div className="relative">

                                            <input type="text" id="invoice_number_input" value={ownerInvoiceNumber} disabled={workOrder.locked_by!=null}
                                                   className="input input-bordered h-8 mt-2 w-full"
                                                   onChange={handleInvoiceNumberChangeOwner}
                                                   aria-valuemax={ownerInvoiceNumber}
                                            />
                                            <button type="submit"
                                                    className="text-white absolute end-2.5 bottom-2 "
                                                    onClick={handleInvoiceClickOwner}>&nbsp;

                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                                                     xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M6.99935 3.00002C7.36754 3.00002 7.66602 2.70154 7.66602 2.33335C7.66602 1.96516 7.36754 1.66669 6.99935 1.66669C6.63116 1.66669 6.33268 1.96516 6.33268 2.33335C6.33268 2.70154 6.63116 3.00002 6.99935 3.00002Z"
                                                        stroke="#98A2B3" strokeWidth="2" strokeLinecap="round"
                                                        strokeLinejoin="round"/>
                                                    <path
                                                        d="M6.99935 7.66669C7.36754 7.66669 7.66602 7.36821 7.66602 7.00002C7.66602 6.63183 7.36754 6.33335 6.99935 6.33335C6.63116 6.33335 6.33268 6.63183 6.33268 7.00002C6.33268 7.36821 6.63116 7.66669 6.99935 7.66669Z"
                                                        stroke="#98A2B3" strokeWidth="2" strokeLinecap="round"
                                                        strokeLinejoin="round"/>
                                                    <path
                                                        d="M6.99935 12.3334C7.36754 12.3334 7.66602 12.0349 7.66602 11.6667C7.66602 11.2985 7.36754 11 6.99935 11C6.63116 11 6.33268 11.2985 6.33268 11.6667C6.33268 12.0349 6.63116 12.3334 6.99935 12.3334Z"
                                                        stroke="#98A2B3" strokeWidth="2" strokeLinecap="round"
                                                        strokeLinejoin="round"/>
                                                    <path
                                                        d="M11.666 3.00002C12.0342 3.00002 12.3327 2.70154 12.3327 2.33335C12.3327 1.96516 12.0342 1.66669 11.666 1.66669C11.2978 1.66669 10.9993 1.96516 10.9993 2.33335C10.9993 2.70154 11.2978 3.00002 11.666 3.00002Z"
                                                        stroke="#98A2B3" strokeWidth="2" strokeLinecap="round"
                                                        strokeLinejoin="round"/>
                                                    <path
                                                        d="M11.666 7.66669C12.0342 7.66669 12.3327 7.36821 12.3327 7.00002C12.3327 6.63183 12.0342 6.33335 11.666 6.33335C11.2978 6.33335 10.9993 6.63183 10.9993 7.00002C10.9993 7.36821 11.2978 7.66669 11.666 7.66669Z"
                                                        stroke="#98A2B3" strokeWidth="2" strokeLinecap="round"
                                                        strokeLinejoin="round"/>
                                                    <path
                                                        d="M11.666 12.3334C12.0342 12.3334 12.3327 12.0349 12.3327 11.6667C12.3327 11.2985 12.0342 11 11.666 11C11.2978 11 10.9993 11.2985 10.9993 11.6667C10.9993 12.0349 11.2978 12.3334 11.666 12.3334Z"
                                                        stroke="#98A2B3" strokeWidth="2" strokeLinecap="round"
                                                        strokeLinejoin="round"/>
                                                    <path
                                                        d="M2.33268 3.00002C2.70087 3.00002 2.99935 2.70154 2.99935 2.33335C2.99935 1.96516 2.70087 1.66669 2.33268 1.66669C1.96449 1.66669 1.66602 1.96516 1.66602 2.33335C1.66602 2.70154 1.96449 3.00002 2.33268 3.00002Z"
                                                        stroke="#98A2B3" strokeWidth="2" strokeLinecap="round"
                                                        strokeLinejoin="round"/>
                                                    <path
                                                        d="M2.33268 7.66669C2.70087 7.66669 2.99935 7.36821 2.99935 7.00002C2.99935 6.63183 2.70087 6.33335 2.33268 6.33335C1.96449 6.33335 1.66602 6.63183 1.66602 7.00002C1.66602 7.36821 1.96449 7.66669 2.33268 7.66669Z"
                                                        stroke="#98A2B3" strokeWidth="2" strokeLinecap="round"
                                                        strokeLinejoin="round"/>
                                                    <path
                                                        d="M2.33268 12.3334C2.70087 12.3334 2.99935 12.0349 2.99935 11.6667C2.99935 11.2985 2.70087 11 2.33268 11C1.96449 11 1.66602 11.2985 1.66602 11.6667C1.66602 12.0349 1.96449 12.3334 2.33268 12.3334Z"
                                                        stroke="#98A2B3" strokeWidth="2" strokeLinecap="round"
                                                        strokeLinejoin="round"/>
                                                </svg>

                                            </button>
                                        </div>
                                        <p className='mt-2'>Invoice Date</p>

                                        <DatePicker
                                            style={{width: '100%'}}
                                            customInput={<CustomDateInputFullWidth
                                                value={ownerInvoiceDate !== process.env.REACT_APP_DEFAULT_DATE ? new Date(ownerInvoiceDate) : null}/>}
                                            selected={ownerInvoiceDate !== process.env.REACT_APP_DEFAULT_DATE  ? new Date(ownerInvoiceDate) : null}
                                            onChange={newDate => handleOwnerInvoiceDateChanged(newDate)}
                                            showYearDropdown
                                            disabled={workOrder.locked_by != null}
                                            dateFormat="MM-dd-yyyy"
                                            todayButton="Today"
                                        />

                                        <p className='mt-2'>Due Date</p>
                                        <DatePicker
                                            customInput={<CustomDateInputFullWidth
                                                value={ownerInvoiceDate !== process.env.REACT_APP_DEFAULT_DATE ? new Date(addDays(ownerInvoiceDate, ownerInvoiceNetDays)) : null}/>}
                                            selected={ownerInvoiceDate !== process.env.REACT_APP_DEFAULT_DATE  ? new Date(addDays(ownerInvoiceDate, ownerInvoiceNetDays)) : null}
                                            onChange={newDate => handleDueDateChanged(true, newDate)}
                                            showYearDropdown
                                            disabled={workOrder.locked_by != null}
                                            dateFormat="MM-dd-yyyy"
                                        />
                                        {!workOrder.locked_by && (
                                            <div className='mt-4'>
                                                <span className='bg-blue-50 p-2 mt-[8px] cursor-pointer' onClick={() => changeNetDays(true, 30)}>Net 30</span>
                                                <span className='bg-blue-50 p-2 mt-8 ml-2 cursor-pointer' onClick={() => changeNetDays(true, 60)}>Net 60</span>
                                                <span className='bg-blue-50 p-2 mt-8 ml-2 cursor-pointer' onClick={() => changeNetDays(true, 90)}>Net 90</span>
                                            </div>
                                        )}


                                    </div>
                                    <div className='p-2'>
                                        <div>
                                            <p>Bill To</p>
                                            <input type="text" className="input input-bordered  h-8 mt-2 w-full "
                                                   disabled
                                                   value={workOrder.railcar.owner_railcar_owner_idToowner.name}></input>
                                        </div>

                                        <div className="mt-1">
                                            <p>Address line 1</p>
                                            <input type="text"
                                                   className="input input-bordered  h-8 mt-2 w-full uppercase" disabled
                                                   value={workOrder.railcar.owner_railcar_owner_idToowner.address_line1}></input>
                                        </div>

                                        <div className="mt-1">
                                            <p>Address line 2</p>
                                            <input type="text"
                                                   className="input input-bordered  h-8 mt-2 w-full uppercase" disabled
                                                   value={workOrder.railcar.owner_railcar_owner_idToowner.address_line2}></input>
                                        </div>


                                        <div className="flex flex-row mt-1">
                                            <div className="pr-1 py-0 w-2/5">
                                                <p>CITY</p>
                                                <input type="text"
                                                       className="input input-bordered  h-8 mt-2 w-full disabled uppercase"
                                                       disabled
                                                       value={workOrder.railcar.owner_railcar_owner_idToowner.city}></input>
                                            </div>
                                            <div className="w-1/5 pr-1 ">
                                                <p>STATE</p>
                                                <input type="text"
                                                       className="input input-bordered  h-8 mt-2 w-full disabled uppercase"
                                                       disabled
                                                       value={workOrder.railcar.owner_railcar_owner_idToowner.state}></input>
                                            </div>
                                            <div className="w-1/5 pr-1 ">
                                                <p>ZIP</p>
                                                <input type="text"
                                                       className="input input-bordered  h-8 mt-2 w-full disabled uppercase"
                                                       disabled
                                                       value={workOrder.railcar.owner_railcar_owner_idToowner.zip_code}></input>
                                            </div>
                                            <div className="w-1/5 pr-1 ">
                                                <p>Country</p>
                                                <input type="text"
                                                       className="input input-bordered  h-8 mt-2 w-full disabled uppercase"
                                                       disabled
                                                       value={workOrder.railcar.owner_railcar_owner_idToowner.country}></input>
                                            </div>
                                        </div>

                                    </div>
                                    <div className='p-2 uppercase'>
                                        <div>
                                            <p>Contact Name</p>
                                            <input type="text"
                                                   className="input input-bordered  h-8 mt-2 w-full uppercase" disabled
                                                   value={workOrder.railcar.owner_railcar_owner_idToowner.contact_name}></input>
                                        </div>

                                        <div className="mt-1">
                                            <p>Contact Number</p>
                                            <input type="text"
                                                   className="input input-bordered  h-8 mt-2 w-full uppercase" disabled
                                                   value={workOrder.railcar.owner_railcar_owner_idToowner.contact_number}></input>
                                        </div>

                                        <div className="mt-1">
                                            <p>EMAIL</p>
                                            <input type="text" className="input input-bordered  h-8 mt-2 w-full "
                                                   disabled
                                                   value={workOrder.railcar.owner_railcar_owner_idToowner.contact_email}></input>
                                        </div>


                                        {showButtonsOwner && (
                                            <div className="mt-8">
                                            <span>
                                                <button
                                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded  cursor-pointer"
                                                    onClick={() => updateBillingInformation(true)}
                                                >
                                                    UPDATE
                                                </button>

                                                <button
                                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
                                                    onClick={handleCancel}

                                                >
                                                CANCEL
                                                </button>
                                            </span>

                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                            {/*End Order information Owner */}

                            {/*Order information Lessee */}
                            {isBilledToLessee && (
                                <div className="w-full bg-white p-4 mb-10 mt-[24px] rounded-none">

                                    <h6 className='font-semibold '>Billing Information(Lessee)</h6>
                                    <div className="grid grid-cols-3 gap-x-0.5">
                                        <div className='p-2'>
                                            <p>Purchase Order</p>
                                            <input type="text" className="input input-bordered  h-8 mt-2 w-full"
                                                   id="purchase_order_lesseer" value={lesseePurchaseOrder} disabled={workOrder.locked_by!=null}
                                                   onChange={handleLesseePurchaseOrderChange}/>
                                            <p className='mt-2'>INVOICE NUMBER</p>
                                            <div className="relative">

                                                <input type="text" id="invoice_number_input_lessee" disabled={workOrder.locked_by!=null}
                                                       value={lesseeInvoiceNumber}
                                                       className="input input-bordered h-8 mt-2 w-full"
                                                       onChange={handleInvoiceNumberChangeLessee}
                                                />
                                                <button type="submit"
                                                        className="text-white absolute end-2.5 bottom-2 "
                                                        onClick={handleInvoiceClickLessee}>&nbsp;

                                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                                                         xmlns="http://www.w3.org/2000/svg">
                                                        <path
                                                            d="M6.99935 3.00002C7.36754 3.00002 7.66602 2.70154 7.66602 2.33335C7.66602 1.96516 7.36754 1.66669 6.99935 1.66669C6.63116 1.66669 6.33268 1.96516 6.33268 2.33335C6.33268 2.70154 6.63116 3.00002 6.99935 3.00002Z"
                                                            stroke="#98A2B3" strokeWidth="2" strokeLinecap="round"
                                                            strokeLinejoin="round"/>
                                                        <path
                                                            d="M6.99935 7.66669C7.36754 7.66669 7.66602 7.36821 7.66602 7.00002C7.66602 6.63183 7.36754 6.33335 6.99935 6.33335C6.63116 6.33335 6.33268 6.63183 6.33268 7.00002C6.33268 7.36821 6.63116 7.66669 6.99935 7.66669Z"
                                                            stroke="#98A2B3" strokeWidth="2" strokeLinecap="round"
                                                            strokeLinejoin="round"/>
                                                        <path
                                                            d="M6.99935 12.3334C7.36754 12.3334 7.66602 12.0349 7.66602 11.6667C7.66602 11.2985 7.36754 11 6.99935 11C6.63116 11 6.33268 11.2985 6.33268 11.6667C6.33268 12.0349 6.63116 12.3334 6.99935 12.3334Z"
                                                            stroke="#98A2B3" strokeWidth="2" strokeLinecap="round"
                                                            strokeLinejoin="round"/>
                                                        <path
                                                            d="M11.666 3.00002C12.0342 3.00002 12.3327 2.70154 12.3327 2.33335C12.3327 1.96516 12.0342 1.66669 11.666 1.66669C11.2978 1.66669 10.9993 1.96516 10.9993 2.33335C10.9993 2.70154 11.2978 3.00002 11.666 3.00002Z"
                                                            stroke="#98A2B3" strokeWidth="2" strokeLinecap="round"
                                                            strokeLinejoin="round"/>
                                                        <path
                                                            d="M11.666 7.66669C12.0342 7.66669 12.3327 7.36821 12.3327 7.00002C12.3327 6.63183 12.0342 6.33335 11.666 6.33335C11.2978 6.33335 10.9993 6.63183 10.9993 7.00002C10.9993 7.36821 11.2978 7.66669 11.666 7.66669Z"
                                                            stroke="#98A2B3" strokeWidth="2" strokeLinecap="round"
                                                            strokeLinejoin="round"/>
                                                        <path
                                                            d="M11.666 12.3334C12.0342 12.3334 12.3327 12.0349 12.3327 11.6667C12.3327 11.2985 12.0342 11 11.666 11C11.2978 11 10.9993 11.2985 10.9993 11.6667C10.9993 12.0349 11.2978 12.3334 11.666 12.3334Z"
                                                            stroke="#98A2B3" strokeWidth="2" strokeLinecap="round"
                                                            strokeLinejoin="round"/>
                                                        <path
                                                            d="M2.33268 3.00002C2.70087 3.00002 2.99935 2.70154 2.99935 2.33335C2.99935 1.96516 2.70087 1.66669 2.33268 1.66669C1.96449 1.66669 1.66602 1.96516 1.66602 2.33335C1.66602 2.70154 1.96449 3.00002 2.33268 3.00002Z"
                                                            stroke="#98A2B3" strokeWidth="2" strokeLinecap="round"
                                                            strokeLinejoin="round"/>
                                                        <path
                                                            d="M2.33268 7.66669C2.70087 7.66669 2.99935 7.36821 2.99935 7.00002C2.99935 6.63183 2.70087 6.33335 2.33268 6.33335C1.96449 6.33335 1.66602 6.63183 1.66602 7.00002C1.66602 7.36821 1.96449 7.66669 2.33268 7.66669Z"
                                                            stroke="#98A2B3" strokeWidth="2" strokeLinecap="round"
                                                            strokeLinejoin="round"/>
                                                        <path
                                                            d="M2.33268 12.3334C2.70087 12.3334 2.99935 12.0349 2.99935 11.6667C2.99935 11.2985 2.70087 11 2.33268 11C1.96449 11 1.66602 11.2985 1.66602 11.6667C1.66602 12.0349 1.96449 12.3334 2.33268 12.3334Z"
                                                            stroke="#98A2B3" strokeWidth="2" strokeLinecap="round"
                                                            strokeLinejoin="round"/>
                                                    </svg>

                                                </button>
                                            </div>
                                            <p className='mt-2'>Invoice Date</p>

                                            <DatePicker
                                                style={{width: '100%'}}
                                                customInput={<CustomDateInputFullWidth
                                                    value={lesseeInvoiceDate !== process.env.REACT_APP_DEFAULT_DATE ? new Date(lesseeInvoiceDate) : null}/>}
                                                selected={lesseeInvoiceDate !== process.env.REACT_APP_DEFAULT_DATE ? new Date(lesseeInvoiceDate) : null}
                                                onChange={newDate => handleLesseeInvoiceDateChanged(newDate)}
                                                showYearDropdown
                                                disabled ={workOrder.locked_by != null}
                                                dateFormat="MM-dd-yyyy"
                                                todayButton="Today"
                                            />

                                            <p className='mt-2'>Due Date</p>
                                            <DatePicker
                                                customInput={<CustomDateInputFullWidth
                                                    value={lesseeInvoiceDate !== process.env.REACT_APP_DEFAULT_DATE ? new Date(addDays(lesseeInvoiceDate, lesseeInvoiceNetDays)) : null}/>}
                                                selected={lesseeInvoiceDate !== process.env.REACT_APP_DEFAULT_DATE ? new Date(addDays(lesseeInvoiceDate, lesseeInvoiceNetDays)) : null}
                                                onChange={newDate => handleDueDateChanged(false, newDate)}
                                                showYearDropdown
                                                disabled ={workOrder.locked_by != null}
                                                dateFormat="MM-dd-yyyy"
                                            />
                                            {!workOrder.locked_by && (
                                                <div className='mt-4'>
                                                    <span className='bg-blue-50 p-2 mt-[8px] cursor-pointer'
                                                          onClick={() => changeNetDays(false, 30)}>Net 30</span>
                                                    <span className='bg-blue-50 p-2 mt-8 ml-2 cursor-pointer'
                                                          onClick={() => changeNetDays(false, 60)}>Net 60</span>
                                                    <span className='bg-blue-50 p-2 mt-8 ml-2 cursor-pointer'
                                                          onClick={() => changeNetDays(false, 90)}>Net 90</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className='p-2'>
                                            <div>
                                                <p>Bill To</p>
                                                <input type="text" className="input input-bordered  h-8 mt-2 w-full "
                                                       disabled
                                                       value={workOrder.railcar.owner_railcar_lessee_idToowner.name}></input>
                                            </div>

                                            <div className="mt-1">
                                                <p>Address line 1</p>
                                                <input type="text"
                                                       className="input input-bordered  h-8 mt-2 w-full uppercase"
                                                       disabled
                                                       value={workOrder.railcar.owner_railcar_lessee_idToowner.address_line1}></input>
                                            </div>

                                            <div className="mt-1">
                                                <p>Address line 2</p>
                                                <input type="text"
                                                       className="input input-bordered  h-8 mt-2 w-full uppercase"
                                                       disabled
                                                       value={workOrder.railcar.owner_railcar_lessee_idToowner.address_line2}></input>
                                            </div>


                                            <div className="flex flex-row mt-1">
                                                <div className="pr-1 py-0 w-2/5">
                                                    <p>CITY</p>
                                                    <input type="text"
                                                           className="input input-bordered  h-8 mt-2 w-full disabled uppercase"
                                                           disabled
                                                           value={workOrder.railcar.owner_railcar_lessee_idToowner.city}></input>
                                                </div>
                                                <div className="w-1/5 pr-1 ">
                                                    <p>STATE</p>
                                                    <input type="text"
                                                           className="input input-bordered  h-8 mt-2 w-full disabled uppercase"
                                                           disabled
                                                           value={workOrder.railcar.owner_railcar_lessee_idToowner.state}></input>
                                                </div>
                                                <div className="w-1/5 pr-1 ">
                                                    <p>ZIP</p>
                                                    <input type="text"
                                                           className="input input-bordered  h-8 mt-2 w-full disabled uppercase"
                                                           disabled
                                                           value={workOrder.railcar.owner_railcar_lessee_idToowner.zip_code}></input>
                                                </div>
                                                <div className="w-1/5 pr-1 ">
                                                    <p>Country</p>
                                                    <input type="text"
                                                           className="input input-bordered  h-8 mt-2 w-full disabled uppercase"
                                                           disabled
                                                           value={workOrder.railcar.owner_railcar_lessee_idToowner.country}></input>
                                                </div>
                                            </div>

                                        </div>
                                        <div className='p-2 uppercase'>
                                            <div>
                                                <p>Contact Name</p>
                                                <input type="text"
                                                       className="input input-bordered  h-8 mt-2 w-full uppercase"
                                                       disabled
                                                       value={workOrder.railcar.owner_railcar_lessee_idToowner.contact_name}></input>
                                            </div>

                                            <div className="mt-1">
                                                <p>Contact Number</p>
                                                <input type="text"
                                                       className="input input-bordered  h-8 mt-2 w-full uppercase"
                                                       disabled
                                                       value={workOrder.railcar.owner_railcar_lessee_idToowner.contact_number}></input>
                                            </div>

                                            <div className="mt-1">
                                                <p>EMAIL</p>
                                                <input type="text" className="input input-bordered  h-8 mt-2 w-full "
                                                       disabled
                                                       value={workOrder.railcar.owner_railcar_lessee_idToowner.contact_email}></input>
                                            </div>
                                            {}
                                            {showButtonsLessee && (
                                                <div className="mt-8">
                                                    <span>
                                                        <button
                                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded  cursor-pointer"
                                                            onClick={() => updateBillingInformation(false)}
                                                        >
                                                            UPDATE
                                                        </button>

                                                        <button
                                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
                                                            onClick={handleLesseeCancel}

                                                        >
                                                        CANCEL
                                                        </button>
                                                    </span>

                                                </div>
                                            )}

                                        </div>
                                    </div>
                                </div>
                            )}
                            {/*End Order information Lessee */}

                            {/*Storage information*/}
                            {workOrder.is_storage ==1 &&(
                                <div className="w-full bg-white p-4  mt-[24px] rounded-none mb-20" id="storage_information">
                                    <StorageComponent initialEntries={storageInformation} railcar_id={workOrder.railcar_id} work_order={workOrder.work_order}/>
                                </div>
                            )}


                        </div>
                        {/*<dialog id="statusModalInDetails" className="modal rounded-md max-h-[100vh]">*/}
                        {/*    <textarea id="statusUpdateMessageFromDropDown" rows="2" ref={statusCommentDropDown}*/}
                        {/*              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 my-4"*/}
                        {/*              placeholder="Write your comments here..."></textarea>*/}
                        {/*    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={postStatusFromDetails}>SUBMIT</button>*/}
                        {/*</dialog>*/}

                        <Modal
                            isOpen={isStatusDropDownModalOpenInDetails}
                            onRequestClose={() => {
                                if (getValueByIdStatusCommentDropDown("statusUpdateMessageFromDropDown") !== '') {
                                    postStatusFromDetails()
                                }
                            }
                            }
                            parentSelector={() => document.querySelector('#orderDetailsModal')}
                            id="theIdHere"
                            contentLabel="POST COMMENT"
                            style={customStylesForCommentModal}
                        >
                        <textarea id="statusUpdateMessageFromDropDownInDetails" rows="2"
                                  ref={statusCommentDropDownInDetails}
                                  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 my-4"
                                  placeholder="Write your comments here..."></textarea>
                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={postStatusFromDetails}>SUBMIT
                            </button>
                        </Modal>
                    </div>
                </dialog>
            }
        </div>

    );

};

export default OrderDetails;