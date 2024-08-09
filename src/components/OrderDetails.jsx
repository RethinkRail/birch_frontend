import React, {useEffect, useRef, useState} from 'react';
import Modal from "react-modal";
import qs from "qs";
import {toast} from "react-toastify";
import CustomDateInput from "./CustomDateInput";
import axios from "axios";
import CustomDateInputFullWidth from "./CustomDateInputFullWidth";
import {addDays} from "flowbite-react/lib/esm/components/Datepicker/helpers";
import {convertSqlToFormattedDate, convertSqlToFormattedDateTime,} from "../utils/DateTimeHelper";

import DatePicker from "react-datepicker";
import {printATask, printBBOM, printBRC, printInvoice} from '../utils/documentPrintHelper';
import JoblistTable from "./JoblistTable";
import {round2Dec} from "../utils/NumberHelper";

//
// import JoblistTable from "./JoblistTable";
// import PartsTable from "./PartsTable";

const OrderDetails = ({
                          commonData,
                          workOrder,
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
                          handleBillingInformationChanged
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



    const containerRef = useRef();
    workOrder.joblist.sort((a, b) => a.line_number - b.line_number)

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

    const [totalLaborHours,setTotalLaborHours]= useState()
    const [totalLaborCost,setTotalLaborCost]= useState()
    const [totalMatCost,setTotalMatCost]= useState()

    const calculateJobCosts = (jobs) => {
        let totalLaborCost = 0;
        let totalLaborHours = 0;
        let totalMaterialCost = 0;

        jobs.forEach(job => {
            // Calculate labor cost
            const laborCost = job.labor_rate * job.labor_time * job.quantity;
            totalLaborCost += laborCost;

            // Calculate labor hours
            const laborHours = job.labor_time * job.quantity;
            totalLaborHours += laborHours;

            // Calculate material cost
            job.jobparts.forEach(part => {
                const purchaseCost = part.purchase_cost * part.quantity;
                const markup = purchaseCost * part.markup_percent;
                const materialCost = purchaseCost + markup;
                totalMaterialCost += materialCost;
            });
        });
        setTotalLaborHours(totalLaborHours)
        setTotalLaborCost(totalLaborCost)
        setTotalMatCost(totalMaterialCost)

    };

    useEffect(() => {
        console.log("use effect in orderdetails")
        setReasonToCome(workOrder.reason_to_come);
        console.log(workOrder.joblist)
        setJobs(workOrder.joblist)
        setIsStatusDropDownModalOpenInDetails(false);


        setupdatedStatusCode("")
        setIsReasonToComeChanged(false)


        setIsBillingInformationChangedForOwner(false)
        setIsBillingInformationChangedForLessee(false)

        setOwnerPurchaseOrder(workOrder.purchase_order)
        // This is for the button displayer function
        setOwnerPurchaseOrderOriginal(workOrder.purchase_order)
        setLesseePurchaseOrder(workOrder.secondary_owner_info?.purchase_order ?? '')
        setLesseePurchaseOrderOriginal(workOrder.secondary_owner_info?.purchase_order ?? '')
        setPurchaseOrderChangedForOwner(false)
        setPurchaseOrderChangedForLessee(false)

        setOwnerInvoiceNumber(workOrder.invoice_number)
        // This is for the button displayer function
        setOwnerInvoiceNumberOriginal(workOrder.invoice_number)
        setLesseeInvoiceNumber(workOrder.secondary_owner_info?.invoice_number ?? '')
        // this is for lessee button displayer
        setLesseeInvoiceNumberOriginal(workOrder.secondary_owner_info?.invoice_number ?? '')
        setInvoiceChangedForOwner(false)
        setInvoiceChangedForLessee(false)


        setOwnerInvoiceNetDays(workOrder.invoice_net_days)
        // This is for the button displayer function
        setOwnerInvoiceNetDaysOriginal(workOrder.invoice_net_days)
        setLesseeInvoiceNetDays(workOrder.secondary_owner_info ? workOrder.secondary_owner_info.invoice_net_days : 0)
        // this is for the lessee button displayer function
        setLesseeInvoiceNetDaysOriginal(workOrder.secondary_owner_info ? workOrder.secondary_owner_info.invoice_net_days : 0)
        setInvoiceNetDaysChangedForOwner(false)
        setInvoiceNetDaysChangedForLessee(false)

        console.log(workOrder.secondary_owner_info)
        setOwnerInvoiceDate(workOrder.invoice_date)
        // This is for the button displayer function
        setOwnerInvoiceDateOriginal(workOrder.invoice_date)

        // This is for the button displayer function
        setOwnerDueDateOriginal(new Date(addDays(workOrder.invoice_date, workOrder.invoice_net_days)))
        if (workOrder.secondary_owner_info != null) {
            console.log(workOrder.secondary_owner_info.invoice_date == process.env.REACT_APP_DEFAULT_DATE)
        }

        if (workOrder.secondary_owner_info != null) {
            console.log(workOrder.secondary_owner_info.invoice_date == process.env.REACT_APP_DEFAULT_DATE)
        }

        setLesseeInvoiceDate(workOrder.secondary_owner_info == null ? process.env.REACT_APP_DEFAULT_DATE : workOrder.secondary_owner_info.invoice_date)
        // this is for the lessee button displayer function
        setLesseeInvoiceDateOriginal(workOrder.secondary_owner_info == null ? process.env.REACT_APP_DEFAULT_DATE : workOrder.secondary_owner_info.invoice_date)

        const invDateLessee = workOrder.secondary_owner_info == null ? process.env.REACT_APP_DEFAULT_DATE : workOrder.secondary_owner_info.invoice_date
        const invNetDateLessee = workOrder.secondary_owner_info == null ? process.env.REACT_APP_DEFAULT_DATE : workOrder.secondary_owner_info.invoice_net_days

        setLesseeDueDateOriginal(invDateLessee !== process.env.REACT_APP_DEFAULT_DATE ? new Date(addDays(invDateLessee, invNetDateLessee)) : null)

        setInvoiceDateChangedForOwner(false)
        setInvoiceDateChangedForLessee(false)

        console.log(lesseeInvoiceDate)
        setMo_wk(workOrder.mo_wk);
        setSP(workOrder.sp);
        setTQ(workOrder.tq);
        setRE(workOrder.re);
        setEP(workOrder.ep);
        setOwnerInvoiceNumber(workOrder.invoice_number);
        setOwnerInvoiceNumberOriginal(workOrder.invoice_number)
        setLesseeInvoiceNumber(workOrder.secondary_owner_info != null?workOrder.secondary_owner_info.invoice_number:"");
        setLesseeInvoiceNumberOriginal(workOrder.secondary_owner_info != null?workOrder.secondary_owner_info.invoice_number:"");
        setIsBilledToLessee(workOrder.secondary_owner_info == null ? false : true)
        calculateJobCosts(workOrder.joblist)
    }, [workOrder]);
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

    const orderDetailsModal = document.getElementById('orderDetailsModal');
    //const statusTextArea = useRef(null);
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
    const closeModal = () => {
        if (orderDetailsModal) {
            orderDetailsModal.close();
        } else {
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
        let sum = 0;
        storageInformation.forEach(obj => {
            const startDate = new Date(convertSqlToFormattedDateTime(obj.start_date));
            console.log(startDate)
            if (obj.end_date === process.env.REACT_APP_DEFAULT_DATE) {
                sum += 0
            } else {
                const endDate = new Date(convertSqlToFormattedDateTime(obj.end_date));
                console.log(endDate)
                const timeDiff = endDate.getTime() - startDate.getTime();
                const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Convert milliseconds to days and round up
                console.log(dayDiff)
                sum += dayDiff;
            }

        });
        return sum;
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
        setOwnerInvoiceDate(toSqlDatetime(value))
    }

    function toSqlDatetime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const handleLesseeInvoiceDateChanged = (value) => {
        console.log("lessee invoice date changed")
        setLesseeInvoiceDate(toSqlDatetime(value))
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
        <div ref={containerRef}>
            <dialog id="orderDetailsModal" className="modal rounded-md h-full ">
                <div className="w-full bg-white">
                    <div className="bg-white  h-[60px] w-full pb-5 rounded-md overflow-auto">
                        <div className="w-full fixed  bg-[#DCE5FF] px-6 py-[18px] text-lg font-semibold  ">
                            <span
                                className="float-left">{workOrder.railcar_id != null ? workOrder.railcar_id : ""}</span>
                            <form method="dialog">
                                <div className="float-right mr-5">
                                    <button className="" onClick={closeModal}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path d="M18 6L6 18M6 6L18 18" stroke="#464646" strokeWidth="2"
                                                  strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="bg-[#F7F9FF] w-full py-10 px-24 max-h-[100vh]  rounded overflow-auto">
                        {/*Side menu*/}
                        <div className="absolute top-1/3 right-4">
                            <ul tabIndex={0} className="dropdown-content z-[1] menu  shadow bg-white p-0">
                                <li className='flex h-fit text-[10px] p-0' onClick={printBRC}>
                                    <span className="p-1">
                                        <svg width="10" height="10" viewBox="0 0 20 20" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M11.6668 9.16663H6.66683M8.3335 12.5H6.66683M13.3335 5.83329H6.66683M16.6668 5.66663V14.3333C16.6668 15.7334 16.6668 16.4335 16.3943 16.9683C16.1547 17.4387 15.7722 17.8211 15.3018 18.0608C14.767 18.3333 14.067 18.3333 12.6668 18.3333H7.3335C5.93336 18.3333 5.2333 18.3333 4.69852 18.0608C4.22811 17.8211 3.84566 17.4387 3.60598 16.9683C3.3335 16.4335 3.3335 15.7334 3.3335 14.3333V5.66663C3.3335 4.26649 3.3335 3.56643 3.60598 3.03165C3.84566 2.56124 4.22811 2.17879 4.69852 1.93911C5.2333 1.66663 5.93336 1.66663 7.3335 1.66663H12.6668C14.067 1.66663 14.767 1.66663 15.3018 1.93911C15.7722 2.17879 16.1547 2.56124 16.3943 3.03165C16.6668 3.56643 16.6668 4.26649 16.6668 5.66663Z"
                                                stroke="#23393D" stroke-width="1.3" stroke-linecap="round"
                                                stroke-linejoin="round"/>
                                        </svg>
                                        BRC
                                    </span>
                                </li>
                                <li className='flex h-fit text-[10px] p-0'>
                                    <span className="p-1">
                                        <svg width="10" height="10" viewBox="0 0 20 20" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M14.1665 14.1667L18.3332 10L14.1665 5.83333M5.83317 5.83333L1.6665 10L5.83317 14.1667M11.6665 2.5L8.33317 17.5"
                                                stroke="#23393D" stroke-width="1.3" stroke-linecap="round"
                                                stroke-linejoin="round"/>
                                        </svg>
                                        ARR-500B
                                    </span>
                                </li>
                                <li className='flex h-fit text-[10px] p-0'  onClick={printBBOM}>
                                    <span className="p-1">
                                        <svg width="10" height="10" viewBox="0 0 20 20" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M14.1665 14.1667L18.3332 10L14.1665 5.83333M5.83317 5.83333L1.6665 10L5.83317 14.1667M11.6665 2.5L8.33317 17.5"
                                                stroke="#23393D" stroke-width="1.3" stroke-linecap="round"
                                                stroke-linejoin="round"/>
                                        </svg>
                                        BBOM
                                    </span>
                                </li>
                                <li className='flex h-fit text-[10px] p-0' onClick={printInvoice}>
                                    <span className="p-1">
                                        <svg width="10" height="10" viewBox="0 0 20 20" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M11.6668 9.16663H6.66683M8.3335 12.5H6.66683M13.3335 5.83329H6.66683M16.6668 5.66663V14.3333C16.6668 15.7334 16.6668 16.4335 16.3943 16.9683C16.1547 17.4387 15.7722 17.8211 15.3018 18.0608C14.767 18.3333 14.067 18.3333 12.6668 18.3333H7.3335C5.93336 18.3333 5.2333 18.3333 4.69852 18.0608C4.22811 17.8211 3.84566 17.4387 3.60598 16.9683C3.3335 16.4335 3.3335 15.7334 3.3335 14.3333V5.66663C3.3335 4.26649 3.3335 3.56643 3.60598 3.03165C3.84566 2.56124 4.22811 2.17879 4.69852 1.93911C5.2333 1.66663 5.93336 1.66663 7.3335 1.66663H12.6668C14.067 1.66663 14.767 1.66663 15.3018 1.93911C15.7722 2.17879 16.1547 2.56124 16.3943 3.03165C16.6668 3.56643 16.6668 4.26649 16.6668 5.66663Z"
                                                stroke="#23393D" stroke-width="1.3" stroke-linecap="round"
                                                stroke-linejoin="round"/>
                                        </svg>
                                        Invoice
                                    </span>
                                </li>
                                <li className='flex h-fit text-[10px] p-0' onClick={() => printATask(workOrder)}>
                                <span className="p-1">
                                    <svg width="10" height="10" viewBox="0 0 20 20" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M17.5 9.99996L7.5 9.99996M17.5 4.99996L7.5 4.99996M17.5 15L7.5 15M4.16667 9.99996C4.16667 10.4602 3.79357 10.8333 3.33333 10.8333C2.8731 10.8333 2.5 10.4602 2.5 9.99996C2.5 9.53972 2.8731 9.16663 3.33333 9.16663C3.79357 9.16663 4.16667 9.53972 4.16667 9.99996ZM4.16667 4.99996C4.16667 5.4602 3.79357 5.83329 3.33333 5.83329C2.8731 5.83329 2.5 5.4602 2.5 4.99996C2.5 4.53972 2.8731 4.16663 3.33333 4.16663C3.79357 4.16663 4.16667 4.53972 4.16667 4.99996ZM4.16667 15C4.16667 15.4602 3.79357 15.8333 3.33333 15.8333C2.8731 15.8333 2.5 15.4602 2.5 15C2.5 14.5397 2.8731 14.1666 3.33333 14.1666C3.79357 14.1666 4.16667 14.5397 4.16667 15Z"
                                            stroke="#23393D" stroke-width="1.3" stroke-linecap="round"
                                            stroke-linejoin="round"/>
                                    </svg>
                                    Work Order
                                </span>
                                </li>
                            </ul>
                        </div>
                        {/*End Side menu*/}
                        <div className=" w-full">
                            {/*Order information */}
                            <div className="w-full bg-white p-2">
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
                                                      customInput={<CustomDateInput
                                                          value={workOrder.arrival_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.arrival_date).toLocaleDateString() : null}/>}
                                                      selected={workOrder.arrival_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.arrival_date) : null}
                                                      onChange={
                                                          newDate => handleArrivalDate(newDate)
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
                                                      customInput={<CustomDateInput
                                                          value={workOrder.inspected_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.inspected_date).toLocaleDateString() : null}/>}
                                                      selected={workOrder.inspected_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.inspected_date) : null}
                                                      onChange={
                                                          newDate => handleInspectionDate(newDate)
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
                                                  customInput={<CustomDateInput
                                                      value={workOrder.clean_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.clean_date).toLocaleDateString() : null}/>}
                                                  selected={workOrder.clean_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.clean_date) : null}
                                                  onChange={
                                                      newDate => handleCleanDate(newDate)
                                                  }
                                                  disabled={workOrder.finalized > 0}
                                                  showYearDropdown
                                                  dateFormat="MM-dd-yyyy"
                                              />
                                        </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal'>Valve tear down </p>
                                                <span>
                                                      <DatePicker
                                                          customInput={<CustomDateInput
                                                              value={workOrder.valve_tear_down !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.valve_tear_down).toLocaleDateString() : null}/>}
                                                          selected={workOrder.valve_tear_down !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.valve_tear_down) : null}
                                                          onChange={
                                                              newDate => handleValveTearDownDate(newDate)
                                                          }
                                                          showYearDropdown
                                                          dateFormat="MM-dd-yyyy"
                                                      />
                                                </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal '>Repair Scheduled </p>
                                                <span>
                                              <DatePicker
                                                  customInput={<CustomDateInput
                                                      value={workOrder.repair_schedule_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.repair_schedule_date).toLocaleDateString() : null}/>}
                                                  selected={workOrder.repair_schedule_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.repair_schedule_date) : null}
                                                  onChange={
                                                      newDate => handleRepairScheduleDate(newDate)
                                                  }
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
                                                          customInput={<CustomDateInput
                                                              value={workOrder.valve_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.valve_date).toLocaleDateString() : null}/>}
                                                          selected={workOrder.valve_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.valve_date) : null}
                                                          onChange={
                                                              newDate => handleValveAssemblyDate(newDate)
                                                          }
                                                          showYearDropdown
                                                          dateFormat="MM-dd-yyyy"
                                                      />
                                                </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal'>Interior Paint </p>
                                                <span>
                                                      <DatePicker
                                                          customInput={<CustomDateInput
                                                              value={workOrder.paint_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.paint_date).toLocaleDateString() : null}/>}
                                                          selected={workOrder.paint_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.paint_date) : null}
                                                          onChange={
                                                              newDate => handlePaintDate(newDate)
                                                          }
                                                          showYearDropdown
                                                          dateFormat="MM-dd-yyyy"
                                                      />
                                                </span>
                                            </div>
                                            <div className="p-1 ">
                                                <p className='text-xs font-normal'>Exterior paint </p>
                                                <span>
                                                  <DatePicker
                                                      customInput={<CustomDateInput
                                                          value={workOrder.exterior_paint !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.exterior_paint).toLocaleDateString() : null}/>}
                                                      selected={workOrder.exterior_paint !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.exterior_paint) : null}
                                                      onChange={
                                                          newDate => handleExteriorPaintDate(newDate)
                                                      }
                                                      showYearDropdown
                                                      dateFormat="MM-dd-yyyy"
                                                  />
                                                </span>
                                            </div>
                                            <div className="p-1 ">
                                                <p className='text-xs font-normal'>PD date</p>
                                                <span>
                                                  <DatePicker
                                                      customInput={<CustomDateInput
                                                          value={workOrder.pd_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.pd_date).toLocaleDateString() : null}/>}
                                                      selected={workOrder.pd_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.pd_date) : null}
                                                      onChange={
                                                          newDate => handlePDDate(newDate)
                                                      }
                                                      showYearDropdown
                                                      dateFormat="MM-dd-yyyy"
                                                  />
                                                </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal '>Final Date</p>
                                                <span>
                                              <DatePicker
                                                  customInput={<CustomDateInput
                                                      value={workOrder.final_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.final_date).toLocaleDateString() : null}/>}
                                                  selected={workOrder.final_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.final_date) : null}
                                                  onChange={
                                                      newDate => handleFinalDate(newDate)
                                                  }
                                                  showYearDropdown
                                                  dateFormat="MM-dd-yyyy"
                                              />
                                        </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal'>QA Date</p>
                                                <span>
                                                  <DatePicker
                                                      customInput={<CustomDateInput
                                                          value={workOrder.qa_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.qa_date).toLocaleDateString() : null}/>}
                                                      selected={workOrder.qa_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.qa_date) : null}
                                                      onChange={
                                                          newDate => handleQADate(newDate)
                                                      }
                                                      showYearDropdown
                                                      dateFormat="MM-dd-yyyy"
                                                  />
                                                </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal '>POD</p>
                                                <span>
                                              <DatePicker
                                                  customInput={<CustomDateInput
                                                      value={workOrder.projected_out_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.projected_out_date).toLocaleDateString() : null}/>}
                                                  selected={workOrder.projected_out_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.projected_out_date) : null}
                                                  onChange={
                                                      newDate => handlePOD(newDate)
                                                  }
                                                  showYearDropdown
                                                  dateFormat="MM-dd-yyyy"
                                              />
                                                </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal '>MTI</p>
                                                <span>
                                                  <DatePicker
                                                      customInput={<CustomDateInput
                                                          value={workOrder.month_to_invoice !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.month_to_invoice).toLocaleDateString() : null}/>}
                                                      selected={workOrder.month_to_invoice !== process.env.REACT_APP_DEFAULT_DATE ? new Date(workOrder.month_to_invoice) : null}
                                                      onChange={
                                                          newDate => handleMTI(newDate)
                                                      }
                                                      showYearDropdown
                                                      dateFormat="MM-dd-yyyy"
                                                  />
                                                </span>
                                            </div>
                                            <div className="p-1">
                                                <p className='text-xs font-normal '>MO/WK</p>
                                                <span>
                                                <input type="text"
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
                                                      <CustomDateInput
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
                                                <input type="text"
                                                       className="flex items-center justify-between  border w-[148px]  rounded-[4px]  whitespace-nowrap overflow-hidden h-[32px] p-1"
                                                       id="sp_in_details" ref={spRef} onChange={handleSP}
                                                       value={sp} onKeyUp={postSPUpdate}/>
                                                </span>
                                            </div>

                                            <div className="p-1">
                                                <p className='text-xs font-normal '>Tank QUAlification</p>
                                                <span>
                                                <input type="text"
                                                       className="flex items-center justify-between  border w-[148px]  rounded-[4px]  whitespace-nowrap overflow-hidden h-[32px] p-1"
                                                       id="tq_in_details" ref={tqRef} onChange={handleTQ}
                                                       value={tq} onKeyUp={postTQUpdate}/>
                                                </span>
                                            </div>


                                            <div className="p-1">
                                                <p className='text-xs font-normal '>RELINE</p>
                                                <span>
                                                <input type="text"
                                                       className="flex items-center justify-between  border w-[148px] rounded-[4px]  whitespace-nowrap overflow-hidden h-[32px] p-1"
                                                       id="re_in_details" ref={reRef} onChange={handleRE}
                                                       value={re} onKeyUp={postREUpdate}/>
                                                </span>
                                            </div>


                                            <div className="p-1">
                                                <p className='text-xs font-normal '>Ex Paint Element </p>
                                                <span>
                                                <input type="text"
                                                       className="flex items-center justify-between  border w-[148px] rounded-[4px]  whitespace-nowrap overflow-hidden h-[32px] p-1"
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
                                            </div>


                                            <div className='mt-[8px] '>
                                                <div className='p-1 align-middle  inline-block'>
                                                    <p className='text-xs font-normal w-max float-left align-middle mt-[4px]'>Is
                                                        Storage Cars</p>
                                                    <input
                                                        disabled={workOrder.storage_information.length > 0}
                                                        type="checkbox"
                                                        checked={workOrder.is_storage > 0}
                                                        className=" checkbox checkbox-primary float-left ml-2 align-middle"/>

                                                </div>
                                            </div>

                                            <div className='mt-[8px] '>
                                                <p>{workOrder.storage_information.length > 0 && sumOfDayDifferences(workOrder.storage_information) > 0 ? "Car is in storage and not billed for " + sumOfDayDifferences(workOrder.storage_information) + "  days" : ""}</p>
                                            </div>
                                            <div className='mt-[8px] '>
                                                <div className='p-1 align-middle  inline-block'>
                                                    <p className='text-xs font-normal w-max float-left align-middle mt-[4px]'>Is
                                                        Locked for Time clocking</p>
                                                    <input
                                                        disabled={workOrder.locked_by != null}
                                                        type="checkbox"
                                                        checked={workOrder.locked_for_time_clocking > 0}
                                                        className=" checkbox checkbox-primary float-left ml-2 align-middle"/>

                                                </div>
                                            </div>

                                            <div className='mt-[8px] '>
                                                <div className='p-1 align-middle  inline-block'>
                                                    <p className='text-xs font-normal w-max float-left align-middle mt-[4px]'>Is
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
                                                    <textarea rows="2"
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

                            {/*Car information */}
                            <div className="w-full bg-white p-4  mt-[24px]">
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

                            {/*Order information Owner */}
                            <div className="w-full bg-white p-4  mt-[24px] rounded-none">

                                <h6 className='font-semibold '>Billing Information(Owner)</h6>
                                <div className="grid grid-cols-3 gap-x-0.5">
                                    <div className='p-2'>
                                        <p>Purchase Order</p>
                                        <input type="text" className="input input-bordered  h-8 mt-2 w-full"
                                               onChange={handleOwnerPurchaseOrderChange}

                                               id="purchase_order_owner" value={ownerPurchaseOrder}/>
                                        <p className='mt-2'>INVOICE NUMBER</p>
                                        <div className="relative">

                                            <input type="text" id="invoice_number_input" value={ownerInvoiceNumber}
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
                                                        stroke="#98A2B3" stroke-width="2" stroke-linecap="round"
                                                        stroke-linejoin="round"/>
                                                    <path
                                                        d="M6.99935 7.66669C7.36754 7.66669 7.66602 7.36821 7.66602 7.00002C7.66602 6.63183 7.36754 6.33335 6.99935 6.33335C6.63116 6.33335 6.33268 6.63183 6.33268 7.00002C6.33268 7.36821 6.63116 7.66669 6.99935 7.66669Z"
                                                        stroke="#98A2B3" stroke-width="2" stroke-linecap="round"
                                                        stroke-linejoin="round"/>
                                                    <path
                                                        d="M6.99935 12.3334C7.36754 12.3334 7.66602 12.0349 7.66602 11.6667C7.66602 11.2985 7.36754 11 6.99935 11C6.63116 11 6.33268 11.2985 6.33268 11.6667C6.33268 12.0349 6.63116 12.3334 6.99935 12.3334Z"
                                                        stroke="#98A2B3" stroke-width="2" stroke-linecap="round"
                                                        stroke-linejoin="round"/>
                                                    <path
                                                        d="M11.666 3.00002C12.0342 3.00002 12.3327 2.70154 12.3327 2.33335C12.3327 1.96516 12.0342 1.66669 11.666 1.66669C11.2978 1.66669 10.9993 1.96516 10.9993 2.33335C10.9993 2.70154 11.2978 3.00002 11.666 3.00002Z"
                                                        stroke="#98A2B3" stroke-width="2" stroke-linecap="round"
                                                        stroke-linejoin="round"/>
                                                    <path
                                                        d="M11.666 7.66669C12.0342 7.66669 12.3327 7.36821 12.3327 7.00002C12.3327 6.63183 12.0342 6.33335 11.666 6.33335C11.2978 6.33335 10.9993 6.63183 10.9993 7.00002C10.9993 7.36821 11.2978 7.66669 11.666 7.66669Z"
                                                        stroke="#98A2B3" stroke-width="2" stroke-linecap="round"
                                                        stroke-linejoin="round"/>
                                                    <path
                                                        d="M11.666 12.3334C12.0342 12.3334 12.3327 12.0349 12.3327 11.6667C12.3327 11.2985 12.0342 11 11.666 11C11.2978 11 10.9993 11.2985 10.9993 11.6667C10.9993 12.0349 11.2978 12.3334 11.666 12.3334Z"
                                                        stroke="#98A2B3" stroke-width="2" stroke-linecap="round"
                                                        stroke-linejoin="round"/>
                                                    <path
                                                        d="M2.33268 3.00002C2.70087 3.00002 2.99935 2.70154 2.99935 2.33335C2.99935 1.96516 2.70087 1.66669 2.33268 1.66669C1.96449 1.66669 1.66602 1.96516 1.66602 2.33335C1.66602 2.70154 1.96449 3.00002 2.33268 3.00002Z"
                                                        stroke="#98A2B3" stroke-width="2" stroke-linecap="round"
                                                        stroke-linejoin="round"/>
                                                    <path
                                                        d="M2.33268 7.66669C2.70087 7.66669 2.99935 7.36821 2.99935 7.00002C2.99935 6.63183 2.70087 6.33335 2.33268 6.33335C1.96449 6.33335 1.66602 6.63183 1.66602 7.00002C1.66602 7.36821 1.96449 7.66669 2.33268 7.66669Z"
                                                        stroke="#98A2B3" stroke-width="2" stroke-linecap="round"
                                                        stroke-linejoin="round"/>
                                                    <path
                                                        d="M2.33268 12.3334C2.70087 12.3334 2.99935 12.0349 2.99935 11.6667C2.99935 11.2985 2.70087 11 2.33268 11C1.96449 11 1.66602 11.2985 1.66602 11.6667C1.66602 12.0349 1.96449 12.3334 2.33268 12.3334Z"
                                                        stroke="#98A2B3" stroke-width="2" stroke-linecap="round"
                                                        stroke-linejoin="round"/>
                                                </svg>

                                            </button>
                                        </div>
                                        <p className='mt-2'>Invoice Date</p>

                                        <DatePicker
                                            style={{width: '100%'}}
                                            customInput={<CustomDateInputFullWidth
                                                value={ownerInvoiceDate !== process.env.REACT_APP_DEFAULT_DATE || ownerInvoiceDate !== null ? new Date(ownerInvoiceDate) : null}/>}
                                            selected={ownerInvoiceDate !== process.env.REACT_APP_DEFAULT_DATE || ownerInvoiceDate !== null ? new Date(ownerInvoiceDate) : null}
                                            onChange={newDate => handleOwnerInvoiceDateChanged(newDate)}
                                            showYearDropdown
                                            dateFormat="MM-dd-yyyy"
                                        />

                                        <p className='mt-2'>Due Date</p>
                                        <DatePicker
                                            customInput={<CustomDateInputFullWidth
                                                value={ownerInvoiceDate !== process.env.REACT_APP_DEFAULT_DATE || ownerInvoiceDate !== null ? new Date(addDays(ownerInvoiceDate, ownerInvoiceNetDays)) : null}/>}
                                            selected={ownerInvoiceDate !== process.env.REACT_APP_DEFAULT_DATE || ownerInvoiceDate !== null ? new Date(addDays(ownerInvoiceDate, ownerInvoiceNetDays)) : null}
                                            onChange={newDate => handleDueDateChanged(true, newDate)}
                                            showYearDropdown
                                            dateFormat="MM-dd-yyyy"
                                        />
                                        <div className='mt-4'>
                                            <span className='bg-blue-50 p-2 mt-[8px] cursor-pointer'
                                                  onClick={() => changeNetDays(true, 30)}>Net 30</span>
                                            <span className='bg-blue-50 p-2 mt-8 ml-2 cursor-pointer'
                                                  onClick={() => changeNetDays(true, 60)}>Net 60</span>
                                            <span className='bg-blue-50 p-2 mt-8 ml-2 cursor-pointer'
                                                  onClick={() => changeNetDays(true, 90)}>Net 90</span>
                                        </div>

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

                                        do your work here
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
                            {workOrder.secondary_owner_info  != null && (
                                <div className="w-full bg-white p-4  mt-[24px] rounded-none">

                                    <h6 className='font-semibold '>Billing Information(Lessee)</h6>
                                    <div className="grid grid-cols-3 gap-x-0.5">
                                        <div className='p-2'>
                                            <p>Purchase Order</p>
                                            <input type="text" className="input input-bordered  h-8 mt-2 w-full"
                                                   id="purchase_order_lesseer" value={lesseePurchaseOrder}
                                                   onChange={handleLesseePurchaseOrderChange}/>
                                            <p className='mt-2'>INVOICE NUMBER</p>
                                            <div className="relative">

                                                <input type="text" id="invoice_number_input_lessee"
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
                                                            stroke="#98A2B3" stroke-width="2" stroke-linecap="round"
                                                            stroke-linejoin="round"/>
                                                        <path
                                                            d="M6.99935 7.66669C7.36754 7.66669 7.66602 7.36821 7.66602 7.00002C7.66602 6.63183 7.36754 6.33335 6.99935 6.33335C6.63116 6.33335 6.33268 6.63183 6.33268 7.00002C6.33268 7.36821 6.63116 7.66669 6.99935 7.66669Z"
                                                            stroke="#98A2B3" stroke-width="2" stroke-linecap="round"
                                                            stroke-linejoin="round"/>
                                                        <path
                                                            d="M6.99935 12.3334C7.36754 12.3334 7.66602 12.0349 7.66602 11.6667C7.66602 11.2985 7.36754 11 6.99935 11C6.63116 11 6.33268 11.2985 6.33268 11.6667C6.33268 12.0349 6.63116 12.3334 6.99935 12.3334Z"
                                                            stroke="#98A2B3" stroke-width="2" stroke-linecap="round"
                                                            stroke-linejoin="round"/>
                                                        <path
                                                            d="M11.666 3.00002C12.0342 3.00002 12.3327 2.70154 12.3327 2.33335C12.3327 1.96516 12.0342 1.66669 11.666 1.66669C11.2978 1.66669 10.9993 1.96516 10.9993 2.33335C10.9993 2.70154 11.2978 3.00002 11.666 3.00002Z"
                                                            stroke="#98A2B3" stroke-width="2" stroke-linecap="round"
                                                            stroke-linejoin="round"/>
                                                        <path
                                                            d="M11.666 7.66669C12.0342 7.66669 12.3327 7.36821 12.3327 7.00002C12.3327 6.63183 12.0342 6.33335 11.666 6.33335C11.2978 6.33335 10.9993 6.63183 10.9993 7.00002C10.9993 7.36821 11.2978 7.66669 11.666 7.66669Z"
                                                            stroke="#98A2B3" stroke-width="2" stroke-linecap="round"
                                                            stroke-linejoin="round"/>
                                                        <path
                                                            d="M11.666 12.3334C12.0342 12.3334 12.3327 12.0349 12.3327 11.6667C12.3327 11.2985 12.0342 11 11.666 11C11.2978 11 10.9993 11.2985 10.9993 11.6667C10.9993 12.0349 11.2978 12.3334 11.666 12.3334Z"
                                                            stroke="#98A2B3" stroke-width="2" stroke-linecap="round"
                                                            stroke-linejoin="round"/>
                                                        <path
                                                            d="M2.33268 3.00002C2.70087 3.00002 2.99935 2.70154 2.99935 2.33335C2.99935 1.96516 2.70087 1.66669 2.33268 1.66669C1.96449 1.66669 1.66602 1.96516 1.66602 2.33335C1.66602 2.70154 1.96449 3.00002 2.33268 3.00002Z"
                                                            stroke="#98A2B3" stroke-width="2" stroke-linecap="round"
                                                            stroke-linejoin="round"/>
                                                        <path
                                                            d="M2.33268 7.66669C2.70087 7.66669 2.99935 7.36821 2.99935 7.00002C2.99935 6.63183 2.70087 6.33335 2.33268 6.33335C1.96449 6.33335 1.66602 6.63183 1.66602 7.00002C1.66602 7.36821 1.96449 7.66669 2.33268 7.66669Z"
                                                            stroke="#98A2B3" stroke-width="2" stroke-linecap="round"
                                                            stroke-linejoin="round"/>
                                                        <path
                                                            d="M2.33268 12.3334C2.70087 12.3334 2.99935 12.0349 2.99935 11.6667C2.99935 11.2985 2.70087 11 2.33268 11C1.96449 11 1.66602 11.2985 1.66602 11.6667C1.66602 12.0349 1.96449 12.3334 2.33268 12.3334Z"
                                                            stroke="#98A2B3" stroke-width="2" stroke-linecap="round"
                                                            stroke-linejoin="round"/>
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
                                                dateFormat="MM-dd-yyyy"
                                            />

                                            <p className='mt-2'>Due Date</p>
                                            <DatePicker
                                                customInput={<CustomDateInputFullWidth
                                                    value={lesseeInvoiceDate !== process.env.REACT_APP_DEFAULT_DATE ? new Date(addDays(lesseeInvoiceDate, lesseeInvoiceNetDays)) : null}/>}
                                                selected={lesseeInvoiceDate !== process.env.REACT_APP_DEFAULT_DATE ? new Date(addDays(lesseeInvoiceDate, lesseeInvoiceNetDays)) : null}
                                                onChange={newDate => handleDueDateChanged(false, newDate)}
                                                showYearDropdown
                                                dateFormat="MM-dd-yyyy"
                                            />
                                            <div className='mt-4'>
                                                <span className='bg-blue-50 p-2 mt-[8px] cursor-pointer'
                                                      onClick={() => changeNetDays(false, 30)}>Net 30</span>
                                                <span className='bg-blue-50 p-2 mt-8 ml-2 cursor-pointer'
                                                      onClick={() => changeNetDays(false, 60)}>Net 60</span>
                                                <span className='bg-blue-50 p-2 mt-8 ml-2 cursor-pointer'
                                                      onClick={() => changeNetDays(false, 90)}>Net 90</span>
                                            </div>
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

                            {/*Job list */}
                            <div className="w-full bg-white p-4  mt-[24px] rounded-none">

                                <JoblistTable jobs={workOrder.joblist} commonData = {commonData} is_billed_to_lessee={isBilledToLessee}/>
                            </div>

                            {/*end job list */}




                            {/*<PartsTable />*/}
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
                                    <div
                                        className="w-[48px] h-[48px]  rounded-full bg-[#002E54] flex justify-center items-center">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9 18L15 12L9 6" stroke="white" stroke-width="2"
                                                  stroke-linecap="round" stroke-linejoin="round"/>
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
        </div>
    );

};

export default OrderDetails;