import { useEffect, useState } from "react"
import axios from "axios"
import {round2Dec} from "../utils/NumberHelper";
import {showToastMessage} from "../utils/CommonHelper";
import {toast} from "react-toastify";
import Select from "react-select";


const EditJobModal = ({ lineNumber, workOrder  , commonData,setModalShowing, editData, setEditData ,createAjob,updateAJob,deleteJob}) => {
    console.log(workOrder)
    console.log(editData)
    const [previousPart, setPreviousPart] = useState(null)
    const singleMarkUp = editData && editData.jobparts && editData.jobparts.length > 0 ? editData.jobparts[0].markup_percent : null;
    console.log(singleMarkUp)
    const [markupPercent, setMarkupPercent] = useState(singleMarkUp!=null? singleMarkUp:workOrder.railcar.owner_railcar_owner_idToowner.markup_percent || 0)
    // const [hourlyRate, setHourlyRate] = useState(editData?editData.labor_rate: workOrder.railcar.owner_railcar_owner_idToowner.labor_rate)
    const [totalCost, setTotalCost] = useState('')

    console.log(markupPercent)
    //logic for new part
    const [jobParts, setJobParts] = useState([])


    // for edit modal
    const [deleted, setDeleted] = useState([])

    const handlePartChange = (partId) => {
        const part = commonData.parts.find(part => part.id == partId)
        const existing_part = jobParts.find(part=>part.part_id == partId)
        if(existing_part)
            return
        let newPart
        if(editData) {
            console.log("edit")
            newPart = {
                additional_info: "",
                job_id: editData.id,
                purchase_cost: part?.price,
                availability:1,
                part_id: part.id,
                unit: part.parts_unit.name,
                quantity: part.quantity!=0?part.quantity:1,
                parts:part
            }
        } else {
            console.log("new")
            newPart = {
                additional_info: "",
                purchase_cost: part?.price,
                availability:1,
                part_id: part.id,
                unit: part.unit,
                quantity: 1,
                parts:part
            }
        }
        console.log(newPart, "This is the new Part")
        setJobParts(prev => [...prev, newPart])
    }

    const handleRemovePart = (partId) => {
        setDeleted(prev => [...prev, partId])
        setJobParts(prev => (
            [...prev].filter(pv => pv.part_id !== partId)
        ))
    }

    const handleFieldChange = (partId, field, value) => {
        console.log(partId);
        console.log(field);
        console.log(value);

        // Find the part to be updated
        const part = jobParts.find(job => job.part_id == partId);
        if (!part) {
            console.error("Part not found");
            return;
        }

        // Determine if the update is for a field within `parts` or directly in `jobPart`
        let updatedPart;


        updatedPart = {
            ...part,
            [field]: field === "quantity" || field === "purchase_cost" ? Number(value) : value
        };

        // Update the jobParts array with the modified part
        const updatedJobParts = jobParts.map(job =>
            job.part_id !== partId ? job : updatedPart
        );

        console.log(updatedJobParts, "This is the updatedJobParts");
        setJobParts(updatedJobParts);
    };




    const [inputValues, setInputValues] = useState({
        location_code: "",
        quantity: 1,
        condition_code: "",
        job_code: "",
        job_code_removed: "",
        job_description: "",
        part: "",
        why_made_code: "",
        responsibility_code: "",
        qualifier_code: "",
        qualifier_code_removed: "",
        labor_cost: "",
        labor_time: 0,
        labor_time_aar: 0,
        labor_rate: workOrder.railcar.owner_railcar_owner_idToowner.labor_rate,
        variable_labor_rate: workOrder.railcar.owner_railcar_owner_idToowner.labor_rate,
        variable_labor_time: 0,
        material_cost: "",
        purchase: "",
        cid:"",
        wheel_details:"",
    })

    const [purchase, setPurchase] = useState("")

    const [totalLabor, setTotalLabor] = useState("")
    const [totalVariableLabor, setTotalVariableLabor] = useState("")
    const [totalMaterial, setTotalMaterial] = useState("")
    const [perItemLaborFixed,setPerItemLaborFixed] = useState(0)
    const [perItemLaborVariable, setPerItemLaborVariable] = useState(0)
    const [totalNet, setTotalNet] = useState("")
    const [showFixedRate,setShowFixedRate] = useState(false);

    useEffect(() => {
        console.log("Input value or job part changed")
        let purchase = 0
        for(let i = 0; i < jobParts.length; i++) {
            purchase = purchase + (Number(jobParts[i]["purchase_cost"]) * Number(jobParts[i]["quantity"]))
        }
        setPurchase(purchase)
    }, [jobParts])

    useEffect(() => {
        let newMaterial = Number(purchase) * (1 + Number(markupPercent))
        setTotalMaterial(newMaterial)
    }, [purchase, markupPercent])

    useEffect(() => {
        const netLabor = Number(round2Dec(totalLabor)) || 0;
        const netVariableLabor = Number(round2Dec(totalVariableLabor)) || 0;
        const netMaterial = Number(round2Dec(totalMaterial)) || 0;

        setTotalNet(netLabor + netVariableLabor + netMaterial);
    }, [totalLabor, totalVariableLabor, totalMaterial]);


    useEffect(() => {
        const handleInputValuesChange = () => {
            const laborRate = Number(inputValues["labor_rate"]);
            const laborTime = Number(inputValues["labor_time_aar"]);
            const variableRate = Number(inputValues["variable_labor_rate"]);
            const variableTime = Number(inputValues["variable_labor_time"]);
            const qty = Number(inputValues["quantity"]);
            const rc = Number(inputValues["responsibility_code"]);
            setPerItemLaborVariable(variableRate * variableTime )
            setPerItemLaborFixed(variableRate * variableTime )
            if (rc === 3) {
                if (qty === 1) {
                    // Case: responsibility_code = 3 AND quantity = 1
                    setTotalLabor(laborRate * laborTime * qty);
                    setTotalVariableLabor(variableRate * variableTime * qty);
                } else if (qty > 1) {
                    console.log("hhhhh")
                    console.log(laborRate)
                    console.log(laborTime)
                    // Case: responsibility_code = 3 AND quantity > 1
                    setTotalLabor(laborRate * laborTime * 1);
                    setTotalVariableLabor(variableRate * variableTime * (qty));
                }
            } else {
                // DEFAULT CASE
                setTotalLabor(0);
                setTotalVariableLabor(variableRate * variableTime * qty);
            }
        };



        handleInputValuesChange();
    }, [inputValues]);


    useEffect(() => {
        const handleEditData = () => {
            if (editData) {
                console.log(editData, "Edit data exists");

                if(editData.responsibilitycode.code==3){
                    setShowFixedRate(true);
                }else {
                    setShowFixedRate(false);
                }

                // ---- Labor Cost Logic (same as other sections) ----
                const today = new Date();
                const cutoffDate = new Date("2025-11-01");

                let laborTimeAar;
                let laborRate;
                let varLaborTime;
                let varLaborRate;


                const qty = parseFloat(editData?.quantity || 1);

                let laborCost = 0;
                let laborTime =0


                if (
                    parseInt(editData?.responsibilitycode?.code) === 3 &&
                    today > cutoffDate
                ) {

                    laborTimeAar = 0;
                    laborRate = 0;
                    varLaborTime = parseFloat(editData?.labor_time_aar || 0);
                    varLaborRate = parseFloat(editData?.labor_rate || 0);


                    if(qty === 1) {
                        laborCost =
                            1 * laborTimeAar * laborRate +
                           1 * varLaborTime * varLaborRate;
                    }else {
                        laborCost =
                            1 * laborTimeAar * laborRate +
                            Math.max(qty , 0) * varLaborTime * varLaborRate;
                    }

                } else {
                    laborTimeAar = parseFloat(editData?.labor_time_aar || 0);;
                    laborRate = parseFloat(editData?.labor_rate || 0);
                    varLaborTime = parseFloat(editData?.variable_labor_time || 0);
                    varLaborRate = parseFloat(editData?.variable_labor_rate || 0);
                    laborCost = laborTimeAar * laborRate * qty;
                }

                laborCost = round2Dec(laborCost);
                // ----------------------------------------------------

                setInputValues((prev) => ({
                    ...prev,
                    location_code: editData.locationcode ? editData.locationcode.code : "",
                    qualifier_code:
                        editData.qualifiercode_joblist_qualifier_applied_idToqualifiercode
                            ? editData.qualifiercode_joblist_qualifier_applied_idToqualifiercode.id
                            : "",
                    qualifier_code_removed:
                        editData.qualifiercode_joblist_qualifier_removed_idToqualifiercode
                            ? editData.qualifiercode_joblist_qualifier_removed_idToqualifiercode.id
                            : "",
                    job_code: editData.jobcode_joblist_job_code_appliedTojobcode
                        ? editData.jobcode_joblist_job_code_appliedTojobcode.code
                        : "",
                    job_code_removed: editData.jobcode_joblist_job_code_removedTojobcode
                        ? editData.jobcode_joblist_job_code_removedTojobcode.code
                        : "",
                    job_description: editData.job_description || "",
                    material_cost: editData.material_cost || "",
                    quantity: editData.quantity || "",
                    why_made_code: editData.whymadecode ? editData.whymadecode.code : "",
                    responsibility_code: editData.responsibilitycode
                        ? editData.responsibilitycode.code
                        : "",
                    condition_code: editData.conditioncode
                        ? editData.conditioncode.code
                        : "",
                    labor_time: today>cutoffDate?0: editData.labor_time,
                    labor_time_aar:today>cutoffDate?0: editData.labor_time_aar,
                    labor_rate: today>cutoffDate?0:editData.labor_rate,

                    variable_labor_rate:today>cutoffDate?editData.labor_rate: editData.variable_labor_rate,
                    variable_labor_time:today>cutoffDate?editData.labor_time_aar: editData.variable_labor_time,

                    // 🔥 Apply new labor cost logic
                    labor_cost: laborCost,

                    cid: editData.cid,
                    wheel_details: editData.wheel_details,
                }));

                console.log(editData.jobparts);
                setPreviousPart(editData.jobparts);
                setJobParts(editData.jobparts);
            }
        };

        handleEditData();
    }, []);



    // const handleChange = (field, value) => {
    //
    //     switch (field) {
    //         case 'job_code':
    //             setInputValues(prev => ({
    //                 ...prev,
    //                 [field]: parseInt(value),
    //                 job_description: (() => {
    //                     const job = commonData.job_codes.find(job_code => job_code.code == value);
    //                     return job?.description || job?.title || "";
    //                 })(),
    //                 labor_time: (() => {
    //                     const job = commonData.job_codes.find(job_code => job_code.code == value);
    //                     return job?.time_custom || job?.time_standard ;
    //                 })(),
    //
    //                 labor_time_aar: (() => {
    //                     const job = commonData.job_codes.find(job_code => job_code.code == value);
    //                     return job?.time_standard_aar || job?.time_standard_aar ;
    //                 })(),
    //
    //                 job_code_removed: (() => {
    //                     const job = commonData.job_codes.find(job_code => job_code.code == value);
    //                     return job?.code  ;
    //                 })(),
    //                 qualifier_code_removed: (() => {
    //                     return '' ;
    //                 })(),
    //                 qualifier_code: (()=>{
    //                     return ''
    //                 })()
    //             }))
    //
    //         case 'qualifier_code':
    //             setInputValues(prev => ({
    //                 ...prev,
    //                 [field]: parseInt(value),
    //
    //                 qualifier_code_removed: (() => {
    //                     const job = commonData.qualifier_codes.find(job_code => job_code.id == value);
    //                     return job?.id  ;
    //                 })()
    //             }))
    //         case 'condition_code':
    //             setInputValues(prev => ({
    //                 ...prev,
    //                 [field]: parseInt(value)
    //             }))
    //         default:
    //             setInputValues(prev => ({
    //                 ...prev,
    //                 [field]: value
    //             }))
    //     }
    //     console.log(field, value, "Input value changed")
    // }


    const handleChange = (field, value) => {
        setInputValues(prev => {
            let updated = { ...prev };
            console.log(field, value);
            if (field === "responsibility_code") {
                setShowFixedRate(Number(value) === 3);
            }

            // --------------------------
            // 1. BASE FIELD ASSIGNMENT
            // --------------------------
            if (field === "labor_time") {
                // Enforce max 3 decimals
                if (value && value.toString().includes(".")) {
                    const decimals = value.toString().split(".")[1].length;
                    if (decimals > 3) {
                        value = parseFloat(value.toFixed(3));
                    }
                }
                console.log(value)
                updated.labor_time = value;
                updated.labor_time_aar = value; // AAR always mirrors full value
            }
            else {
                updated[field] = value;
            }

            // --------------------------
            // 2. JOB CODE LOGIC
            // --------------------------
            if (field === "job_code") {
                const job = commonData.job_codes.find(j => j.code == value);

                updated.job_description = job?.description || job?.title || "";
                updated.labor_time = job?.time_standard_aar || job?.time_standard || 0;
                updated.labor_time_aar = job?.time_standard_aar || 0;
                updated.variable_labor_time = job?.time_standard_aar || 0;
                updated.job_code_removed = job?.code || "";
                updated.qualifier_code = "";
                updated.qualifier_code_removed = "";
            }

            // --------------------------
            // 3. QUALIFIER CODE LOGIC
            // --------------------------
            if (field === "qualifier_code") {
                const qc = commonData.qualifier_codes.find(q => q.id == value);
                updated.qualifier_code_removed = qc?.id || "";
            }

            return updated;
        });

        console.log(field, value, "Input value changed");
    };

    function processPartsArray(dataArray) {
        console.log(dataArray)
        return dataArray.map(item => {
            // Remove the `parts` object
            const { parts,unit, ...rest } = item;

            // Calculate the totalcost
            const totalcost = rest.quantity * rest.purchase_cost * (1 + rest.markup_percent);

            // Return the updated object
            return {
                ...rest,
                totalcost
            };
        });
    }


    const handleSave = async () => {

        if (!inputValues["location_code"]) {
            alert("Put location code")
            return;
        }

        // -----------------------------
        // LABOR COST CALCULATION LOGIC
        // -----------------------------
        const responsibility = Number(inputValues["responsibility_code"]);
        const qty = Number(inputValues["quantity"]);
        const laborTimeAar = Number(inputValues["labor_time_aar"]);
        const laborRate = Number(inputValues["labor_rate"]);
        const varLaborTime = Number(inputValues["variable_labor_time"]);
        const varLaborRate = Number(inputValues["variable_labor_rate"]);



        let calculatedLabor = 0;

        if (responsibility === 3) {
            if (qty === 1) {
                // Case: responsibility = 3 AND qty = 1
                calculatedLabor =
                    (qty * laborTimeAar * laborRate) +
                    (qty * varLaborTime * varLaborRate);
                console.log(calculatedLabor);
            } else if (qty > 1) {
                // Case: responsibility = 3 AND qty > 1
                calculatedLabor =
                    (1 * laborTimeAar * laborRate) +
                    ((qty ) * varLaborTime * varLaborRate);
                console.log(calculatedLabor);
            }
        } else {
            // DEFAULT CASE
            calculatedLabor =
                0 + (qty * varLaborTime * varLaborRate);
            console.log(calculatedLabor);
        }
        console.log(calculatedLabor);
        calculatedLabor = round2Dec(Number(calculatedLabor));
        console.log(calculatedLabor);

        // ------------------------------------
        // CREATE MODE
        // ------------------------------------
        if (!editData) {
            console.log("here")
            let populatedJobPart = jobParts.map(jobPt => ({
                ...jobPt,
                markup_percent: Number(markupPercent),
                availability: 1
            }));

            populatedJobPart = processPartsArray(populatedJobPart);

            const dataToBackend = {
                work_id: workOrder.id,
                work_order: workOrder.work_order,
                line_number: Number(lineNumber),
                location_code: inputValues["location_code"],
                quantity: qty,
                condition_code: inputValues["condition_code"],
                job_code_applied: inputValues["job_code"],
                qualifier_applied_id:
                    Number(inputValues["qualifier_code"]) > 0
                        ? Number(inputValues["qualifier_code"])
                        : null,
                job_description: inputValues["job_description"],
                why_made_code: inputValues["why_made_code"],
                job_code_removed: inputValues["job_code_removed"],
                qualifier_removed_id:
                    Number(inputValues["qualifier_code_removed"]) > 0
                        ? Number(inputValues["qualifier_code_removed"])
                        : null,
                responsibility_code: responsibility,
                cid: inputValues["cid"],
                wheel_details: inputValues["wheel_details"],

                // ⬇️ UPDATED LABOR COST
                labor_cost: Number(calculatedLabor),

                // labor_time: Number(round2Dec(inputValues["labor_time"])),
                // labor_time_aar: laborTimeAar,
                // labor_rate: laborRate,

                labor_time: responsibility === 3 ? Number(round2Dec(inputValues["labor_time_aar"])) : 0,
                labor_time_aar: responsibility === 3 ? laborTimeAar : 0,
                labor_rate: responsibility === 3 ? laborRate : 0,


                variable_labor_time: Number(round2Dec(inputValues["variable_labor_time"])),
                variable_labor_rate: Number(round2Dec(inputValues["variable_labor_rate"])),

                material_cost: Number(round2Dec(totalMaterial)),
                jobPartsData: populatedJobPart,
                user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["id"]
            };
            console.log(dataToBackend);
            //return;
            const response = await createAjob(dataToBackend);
            if (response.status === 200) setModalShowing(false);

        } else {
            // ------------------------------------
            // UPDATE MODE
            // ------------------------------------
            let populatedJobPart = jobParts.map(jobPt => ({
                ...jobPt,
                markup_percent: Number(markupPercent),
                availability: 1
            }));

            populatedJobPart = processPartsArray(populatedJobPart);

            const jobPartsToDelete = previousPart.filter(part =>
                deleted.includes(part.part_id)
            );

            const jobPartsToUpdate = populatedJobPart.filter(currentPart => {
                const originalPart = previousPart.find(
                    part => part.part_id === currentPart.part_id
                );
                if (!originalPart) return false;

                return (
                    currentPart.quantity !== originalPart.quantity ||
                    currentPart.total_cost !== originalPart.total_cost ||
                    currentPart.purchase_cost !== originalPart.purchase_cost ||
                    currentPart.additional_info !== originalPart.additional_info ||
                    currentPart.markup_percent !== editData.jobparts[0].markup_percent
                );
            });

            const jobPartsToAdd = populatedJobPart.filter(currentPart => {
                const originalPart = previousPart.find(
                    part => part.part_id === currentPart.part_id
                );
                return !originalPart;
            });

            const dataToBackend = {
                work_order: workOrder.work_order,
                work_id: workOrder.id,
                line_number: Number(editData.line_number),
                location_code: inputValues["location_code"],
                quantity: qty,
                condition_code: inputValues["condition_code"],
                job_code_applied: inputValues["job_code"],
                qualifier_applied_id:
                    Number(inputValues["qualifier_code"]) > 0
                        ? Number(inputValues["qualifier_code"])
                        : null,
                job_description: inputValues["job_description"],
                why_made_code: inputValues["why_made_code"],
                job_code_removed: inputValues["job_code_removed"],
                cid: inputValues["cid"],
                wheel_details: inputValues["wheel_details"],
                qualifier_removed_id:
                    Number(inputValues["qualifier_code_removed"]) > 0
                        ? Number(inputValues["qualifier_code_removed"])
                        : null,
                responsibility_code: responsibility,


                labor_cost: Number(calculatedLabor),

                labor_time: Number(round2Dec(inputValues["labor_time"])),
                labor_time_aar: laborTimeAar,
                labor_rate: laborRate,
                variable_labor_time: Number(round2Dec(inputValues["variable_labor_time"])),
                variable_labor_rate: Number(round2Dec(inputValues["variable_labor_rate"])),
                material_cost: Number(round2Dec(totalMaterial)),
                jobPartsToAdd,
                jobPartsToDelete,
                jobPartsToUpdate,
                user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["id"]
            };

            const response = await updateAJob(dataToBackend, editData.id);
            if (response.status === 200) setModalShowing(false);
        }
    };



    const handleDelete = async () =>{

        const response = await  deleteJob(workOrder.id,editData.id)
        console.log(response)
        if(response.status == 200){
            setModalShowing(false)
        }else {

        }
    }
    return (
        <div className='fixed p-2 flex flex-col h-[100vh] overflow-y-auto bg-[#2e2b2b40] backdrop-blur-sm top-0 left-0 w-full justify-center items-center z-[100]' onClick={() => {
            setModalShowing(true)
        }}>
            <div className="bg-white drop-shadow-md rounded-md w-[95%] overflow-y-auto max-w-[1600px] p-4 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                {editData ? "Edit line number: "+editData.line_number : "ADD A JOB"}
                <div className="grid grid-cols-3 gap-5">
                    <div className="col-span-1 flex flex-col gap-1.5">
                        <div className="h-10 bg-[#DCE5FF] rounded-md px-2 w-full flex justify-center items-center">
                            STEP 1: LOCATION AND CONDITION
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-[12px] capitalize'>Location Code (LOC)</label>
                            <Select
                                name="loc"
                                id="loc"
                                isDisabled={workOrder.locked_by != null}
                                classNamePrefix="react-select" // To allow custom styling with your class names
                                value={commonData.location_codes.map((locationcode) => ({
                                    value: locationcode.code,
                                    label: `${locationcode.code}: ${locationcode.title}`,
                                })).find(option => option.value === inputValues["location_code"])}
                                onChange={(selectedOption) => handleChange("location_code", selectedOption?.value)}
                                options={commonData.location_codes.map((locationcode) => ({
                                    value: locationcode.code,
                                    label: `${locationcode.code}: ${locationcode.title}`,
                                }))}
                                placeholder="Select an option"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[12px] capitalize">QUANTITY(QTY)</label>
                            <input type="number"    disabled={workOrder.locked_by != null} min={1}className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2' placeholder="Quantity" value={inputValues["quantity"]} onChange={(e) => handleChange("quantity", e.target.value)} />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-[12px] capitalize'>Condition Code (CC)</label>
                            <Select
                                name="cc"
                                id="cc"
                                isDisabled={workOrder.locked_by != null}
                                classNamePrefix="react-select" // To apply your custom styles
                                value={commonData.condition_codes.map((conditioncode) => ({
                                    value: conditioncode.code,
                                    label: `${conditioncode.code}: ${conditioncode.title}`,
                                })).find(option => option.value === inputValues["condition_code"])}
                                onChange={(selectedOption) => handleChange("condition_code", selectedOption?.value)}
                                options={commonData.condition_codes.map((conditioncode) => ({
                                    value: conditioncode.code,
                                    label: `${conditioncode.code}: ${conditioncode.title}`,
                                }))}
                                placeholder="Select an option"
                            />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-[12px] capitalize'>Wheel details</label>
                            <input type="text"    disabled={workOrder.locked_by != null} className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2' placeholder="Wheel details" value={inputValues["wheel_details"]} onChange={(e) => handleChange("wheel_details", e.target.value)} />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-[12px] capitalize'>CID</label>
                            <input type="text"    disabled={workOrder.locked_by != null} className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2' placeholder="CID" value={inputValues["cid"]} onChange={(e) => handleChange("cid", e.target.value)} />
                        </div>
                    </div>
                    <div className="col-span-1 flex flex-col gap-1.5">
                        <div className="h-10 bg-[#DCE5FF] rounded-md px-2 w-full flex justify-center items-center">
                            STEP 2: JOB APPLIED
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-[12px] capitalize'>Job Code Applied (JC)</label>
                            <Select
                                name="job"
                                id="job"
                                isDisabled={workOrder.locked_by != null}
                                classNamePrefix="react-select" // To allow custom styling
                                value={commonData.job_codes.map((jobcode) => ({
                                    value: jobcode.code,
                                    label: `${jobcode.code}: ${jobcode.title}`,
                                })).find(option => option.value === inputValues["job_code"])}
                                onChange={(selectedOption) => handleChange("job_code", selectedOption?.value)}
                                options={commonData.job_codes.map((jobcode) => ({
                                    value: jobcode.code,
                                    label: `${jobcode.code}: ${jobcode.title}`,
                                }))}
                                placeholder="Select an option"
                            />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-[12px] capitalize'>Qualifier Applied (AQ)</label>
                            <Select
                                name="loc"
                                id="loc"
                                isDisabled={workOrder.locked_by != null}
                                classNamePrefix="react-select" // To allow custom styling
                                value={[
                                    { value: null, label: "Select an option" },
                                    ...commonData.qualifier_codes.map((qualifiercode) => ({
                                        value: qualifiercode.id,
                                        label: `${qualifiercode.code}: ${qualifiercode.title}`,
                                    }))
                                ].find(option => option.value === inputValues["qualifier_code"])}
                                onChange={(selectedOption) => handleChange("qualifier_code", selectedOption?.value)}
                                options={[
                                    { value: null, label: "Select an option" },
                                    ...commonData.qualifier_codes.map((qualifiercode) => ({
                                        value: qualifiercode.id,
                                        label: `${qualifiercode.code}: ${qualifiercode.title}`,
                                    }))
                                ]}
                                placeholder="Select an option"
                            />


                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-[12px] capitalize'>Why Made Code (WMC)</label>
                            <Select
                                name="cc"
                                id="cc"
                                isDisabled={workOrder.locked_by != null}
                                classNamePrefix="react-select" // To allow custom styling
                                value={commonData.wmc_codes.map((wmc) => ({
                                    value: wmc.code,
                                    label: `${wmc.code}: ${wmc.title}`,
                                })).find(option => option.value === inputValues["why_made_code"])}
                                onChange={(selectedOption) => handleChange("why_made_code", selectedOption?.value)}
                                options={commonData.wmc_codes.map((wmc) => ({
                                    value: wmc.code,
                                    label: `${wmc.code}: ${wmc.title}`,
                                }))}
                                placeholder="Select an option"
                            />
                        </div>

                    </div>
                    <div className="col-span-1 flex flex-col gap-1.5">
                        <div className="h-10 bg-[#DCE5FF] rounded-md px-2 w-full flex justify-center items-center">
                            STEP 3: JOB REMOVED
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-[12px] capitalize'>Jobe Code Removed (JCR)</label>
                            <Select
                                name="loc"
                                id="loc"
                                isDisabled={workOrder.locked_by != null}
                                classNamePrefix="react-select" // To allow custom styling
                                value={commonData.job_codes.map((jobcode) => ({
                                    value: jobcode.code,
                                    label: `${jobcode.code}: ${jobcode.title}`,
                                })).find(option => option.value === inputValues["job_code_removed"])}
                                onChange={(selectedOption) => handleChange("job_code_removed", selectedOption?.value)}
                                options={commonData.job_codes.map((jobcode) => ({
                                    value: jobcode.code,
                                    label: `${jobcode.code}: ${jobcode.title}`,
                                }))}
                                placeholder="Select an option"
                            />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-[12px] capitalize'>Qualifier Removed (RQ)</label>
                            <Select
                                name="loc"
                                id="loc"
                                isDisabled={workOrder.locked_by != null}
                                classNamePrefix="react-select" // To allow custom styling
                                value={commonData.qualifier_codes.map((qcr) => ({
                                    value: qcr.id,
                                    label: `${qcr.code}: ${qcr.title}`,
                                })).find(option => option.value === inputValues["qualifier_code_removed"])}
                                onChange={(selectedOption) => handleChange("qualifier_code_removed", selectedOption?.value)}
                                options={commonData.qualifier_codes.map((qcr) => ({
                                    value: qcr.id,
                                    label: `${qcr.code}: ${qcr.title}`,
                                }))}
                                placeholder="Select an option"
                            />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-[12px] capitalize'>Responsibility Code (RC)</label>
                            <Select
                                name="cc"
                                id="cc"
                                isDisabled={workOrder.locked_by != null}
                                classNamePrefix="react-select" // To allow custom styling
                                value={commonData.responsibility_codes.map((rc) => ({
                                    value: rc.code,
                                    label: `${rc.code}: ${rc.title}`,
                                })).find(option => option.value === inputValues["responsibility_code"])}
                                onChange={(selectedOption) => handleChange("responsibility_code", selectedOption?.value)}
                                options={commonData.responsibility_codes.map((rc) => ({
                                    value: rc.code,
                                    label: `${rc.code}: ${rc.title}`,
                                }))}
                                placeholder="Select an option"
                            />
                        </div>
                    </div>
                </div>
                <div className="w-full mt-3 flex-col gap-2">
                    <div className="h-10 bg-[#DCE5FF] rounded-md px-2 w-full flex justify-center items-center">
                        STEP 3: PARTS
                    </div>
                    <div className='flex flex-col gap-1 mt-1'>
                        <div className='text-[12px] capitalize flex flex-row w-full justify-between'>
                            <label>Add A Part</label>

                        </div>
                        <Select
                            name="loc"
                            id="loc"
                            isDisabled={workOrder.locked_by != null}
                            classNamePrefix="react-select" // To allow custom styling
                            onChange={(selectedOption) => handlePartChange(selectedOption?.value)}
                            options={commonData.parts.map((part) => ({
                                value: part.id,
                                label: `${part.code}: ${part.title}`,
                            }))}
                            placeholder="Select an option"
                        />
                    </div>
                    {/* <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="#464646" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg> */}
                    <div className="w-[100%] grid grid-cols-5 mt-3">
                        <div className="col-span-3">CODE:TITLE</div>
                        <div className="col-span-2 flex flex-row items-center gap-1">
                            <div className="w-[45%]">ADDITIONAL INFO</div>
                            <div className="w-[14%]">UNIT</div>
                            <div className="w-[14%]">QTY</div>
                            <div className="w-[20%]">PURCHASE</div>
                            <div className="w-[7%]">

                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-1">
                        {jobParts.map((jobPart, index) => (
                            <div key={index} className="w-[100%] grid grid-cols-5">
                                <div className="col-span-3">{jobPart.parts.code+":"+jobPart.parts.title}</div>
                                <div className="col-span-2 flex flex-row items-center gap-1">
                                    <input type="text" name="" id="" className="w-[45%] p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" value={jobPart?.additional_info || ""} onChange={(e) => handleFieldChange(jobPart.part_id, "additional_info", e.target.value)} />
                                    <input type="text" name="" id="" className="w-[14%] p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1 " value={jobPart?.parts.parts_unit.name} disabled={true} />
                                    <input type="number"  step={0.1} name="" id="" className="w-[14%] p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" value={jobPart?.quantity} onChange={(e) => handleFieldChange(jobPart.part_id, "quantity", parseFloat(e.target.value).toFixed(2))} />
                                    <input type="number" step={0.1} name="" id="" className="w-[20%] p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" value={jobPart?.purchase_cost} onChange={(e) => handleFieldChange(jobPart.part_id, "purchase_cost", parseFloat(e.target.value).toFixed(2))} />
                                    <div className="w-[7%]">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => handleRemovePart(jobPart?.part_id)}>
                                            <path d="M18 6L6 18M6 6L18 18" stroke="#464646" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-5 gap-6 mt-4">
                        {/* Description Section */}
                        <div className="col-span-2 flex flex-col gap-2">
                            <label className="capitalize text-[12px] font-medium text-[#002e54]">
                                Description of Repair
                            </label>
                            <textarea
                                rows={6}
                                disabled={workOrder.locked_by != null}
                                className="text-[12px] w-full border border-[#002e54] rounded-md p-2 outline-none resize-none focus:ring-1 focus:ring-[#002e54]"
                                value={inputValues["job_description"]}
                                onChange={(e) => handleChange("job_description", e.target.value)}
                                placeholder="Enter description of repair"
                            ></textarea>
                        </div>

                        {/* Right-Side Form Fields */}
                        <div className="col-span-3 grid grid-cols-12 gap-3">

                            {/* Row 2: Material */}
                            <div className="flex flex-col col-span-4">
                                <label className="text-[12px] capitalize text-[#002e54]">Purchase ($)</label>
                                <input
                                    type="text"
                                    disabled
                                    className="p-1 rounded-md border border-[#002e54] outline-none text-[12px] px-2 bg-gray-100"
                                    value={round2Dec(purchase)}
                                    readOnly
                                />
                            </div>

                            <div className="flex flex-col col-span-4">
                                <label className="text-[12px] capitalize text-[#002e54]">Markup (%)</label>
                                <input
                                    type="number"
                                    disabled={workOrder.locked_by != null}
                                    className="p-1 rounded-md border border-[#002e54] outline-none text-[12px] px-2 focus:ring-1 focus:ring-[#002e54]"
                                    value={markupPercent}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value);
                                        if (value && value.toString().split(".")[1]?.length > 2) {
                                            setMarkupPercent(value.toFixed(2));
                                        } else {
                                            setMarkupPercent(e.target.value);
                                        }
                                    }}
                                />
                            </div>

                            <div className="flex flex-col col-span-4">
                                <label className="text-[12px] capitalize text-[#002e54]">Total Material ($)</label>
                                <input
                                    type="text"
                                    disabled
                                    className="p-1 rounded-md border border-[#002e54] outline-none text-[12px] px-2 bg-gray-100"
                                    value={round2Dec(totalMaterial)}
                                    readOnly
                                />
                            </div>

                            {showFixedRate && (
                                <>
                                    {/* Row 1: Labor fixed */}
                                    <div className="flex flex-col col-span-2">
                                        <label
                                            className="text-[12px] capitalize text-[#002e54] mx-5"

                                        >
                                            ST. Time (HR)
                                        </label>

                                        <div className="flex items-center gap-1">
                                            <div className="text-[12px] font-semibold">(F)</div>

                                            <input
                                                type="number"
                                                step={0.001}
                                                disabled={workOrder.locked_by != null}
                                                className="p-1 rounded-md border border-[#002e54] outline-none text-[12px]  focus:ring-1 focus:ring-[#002e54] w-10/12"
                                                value={inputValues.labor_time}
                                                onChange={(e) => {
                                                    let value = parseFloat(e.target.value);

                                                    // enforce max 3 decimal places
                                                    if (value && value.toString().includes(".")) {
                                                        const decimals = value.toString().split(".")[1].length;
                                                        if (decimals > 3) {
                                                            value = parseFloat(value.toFixed(3));
                                                        }
                                                    }

                                                    handleChange("labor_time", value);
                                                }}
                                            />
                                        </div>
                                    </div>


                                    {/* Box 2 — Truncated to 2 decimals */}
                                    <div className="flex flex-col col-span-2">
                                        <label className="text-[12px] capitalize text-[#002e54]">ST. Time (HR)</label>
                                        <input
                                            type="number"
                                            step={0.01}
                                            disabled={true}
                                            className="p-1 rounded-md border border-[#002e54] outline-none text-[12px] px-2"
                                            value={
                                                inputValues.labor_time !== "" && inputValues.labor_time !== null
                                                    ? Number(inputValues.labor_time).toFixed(2)
                                                    : ""
                                            }
                                        />
                                    </div>

                                    {/* Box 3 — Full 3 decimals (AAR) */}
                                    <div className="flex flex-col col-span-2">
                                        <label className="text-[12px] capitalize text-[#002e54]">ST. Time AAR (HR)</label>
                                        <input
                                            type="number"
                                            step={0.001}
                                            disabled={true}
                                            className="p-1 rounded-md border border-[#002e54] outline-none text-[12px] px-2"
                                            value={
                                                inputValues.labor_time !== "" && inputValues.labor_time !== null
                                                    ? Number(inputValues.labor_time).toFixed(3)
                                                    : ""
                                            }
                                        />
                                    </div>


                                    <div className="flex flex-col col-span-2">
                                        <label className="text-[12px] capitalize text-[#002e54]">Rate ($/HR)</label>
                                        <input
                                            type="number"
                                            step={0.1}
                                            disabled={workOrder.locked_by != null}
                                            className="p-1 rounded-md border border-[#002e54] outline-none text-[12px] px-2 focus:ring-1 focus:ring-[#002e54]"
                                            value={inputValues["labor_rate"]}
                                            onChange={(e) => {
                                                let value = parseFloat(e.target.value);
                                                if (value && value.toString().split(".")[1]?.length > 2) {
                                                    value = parseFloat(value.toFixed(2));
                                                }
                                                handleChange("labor_rate", value);
                                            }}
                                        />
                                    </div>

                                    <div className="flex flex-col col-span-2">
                                        <label className="text-[12px] capitalize text-[#002e54]">(Item/Labor)$</label>
                                        <input
                                            type="number"
                                            step={0.1}
                                            disabled={true}
                                            className="p-1 rounded-md border border-[#002e54] outline-none text-[12px]  focus:ring-1 focus:ring-[#002e54]"
                                            value={round2Dec(perItemLaborFixed)}
                                            onChange={(e) => {
                                                let value = parseFloat(e.target.value);
                                                if (value && value.toString().split(".")[1]?.length > 2) {
                                                    value = parseFloat(value.toFixed(2));
                                                }
                                                handleChange("labor_rate", value);
                                            }}
                                        />
                                    </div>

                                    <div className="flex flex-col col-span-2">
                                        <label className="text-[12px] capitalize text-[#002e54]">Total Labor ($)</label>
                                        <input
                                            type="text"
                                            disabled
                                            className="p-1 rounded-md border border-[#002e54] outline-none text-[12px] px-2 bg-gray-100"
                                            value={round2Dec(totalLabor)}
                                            readOnly
                                        />
                                    </div>
                                </>
                        )}


                            {/* Row 1: Labor variable */}

                            <div className="flex flex-col col-span-2">
                                <label
                                    className="text-[12px] capitalize text-[#002e54] mx-5"
                                    hidden={showFixedRate}
                                >
                                    Time
                                </label>

                                <div className="flex items-center gap-1">
                                    <div className="text-[12px] font-semibold">(V)</div>

                                    <input
                                        type="number"
                                        step={0.001}
                                        disabled={workOrder.locked_by != null}
                                        className="p-1 rounded-md border border-[#002e54] outline-none text-[12px]  focus:ring-1 focus:ring-[#002e54] w-10/12"
                                        value={inputValues.variable_labor_time}
                                        onChange={(e) => {
                                            let value = parseFloat(e.target.value);

                                            if (value && value.toString().includes(".")) {
                                                const decimals = value.toString().split(".")[1].length;
                                                if (decimals > 3) {
                                                    value = parseFloat(value.toFixed(3));
                                                }
                                            }

                                            handleChange("variable_labor_time", value);
                                        }}
                                    />
                                </div>
                            </div>


                            {/* Box 2 — Truncated to 2 decimals */}
                            <div className="flex flex-col col-span-2">
                                <label className="text-[12px] capitalize text-[#002e54]" hidden={showFixedRate}>ST. Time (HR)</label>
                                <input
                                    type="number"
                                    step={0.01}
                                    disabled={true}
                                    className="p-1 rounded-md border border-[#002e54] outline-none text-[12px] px-2"
                                    value={
                                        inputValues.variable_labor_time !== "" && inputValues.variable_labor_time !== null
                                            ? Number(inputValues.variable_labor_time).toFixed(2)
                                            : ""
                                    }
                                />
                            </div>

                            {/* Box 3 — Full 3 decimals */}
                            <div className="flex flex-col col-span-2">
                                <label className="text-[12px] capitalize text-[#002e54]" hidden={showFixedRate}>AAR. Time (HR)</label>
                                <input
                                    type="number"
                                    step={0.001}
                                    disabled={true}
                                    className="p-1 rounded-md border border-[#002e54] outline-none text-[12px] px-2"
                                    value={
                                        inputValues.variable_labor_time !== "" && inputValues.variable_labor_time !== null
                                            ? Number(inputValues.variable_labor_time).toFixed(3)
                                            : ""
                                    }
                                />
                            </div>


                            <div className="flex flex-col col-span-2" >
                                <label className="text-[12px] capitalize text-[#002e54]" hidden={showFixedRate}>Rate ($/hr)</label>
                                <input
                                    type="number"
                                    step={0.1}
                                    disabled={workOrder.locked_by != null}
                                    className="p-1 rounded-md border border-[#002e54] outline-none text-[12px] px-2 focus:ring-1 focus:ring-[#002e54]"
                                    value={inputValues["variable_labor_rate"]}
                                    onChange={(e) => {
                                        let value = parseFloat(e.target.value);
                                        if (value && value.toString().split(".")[1]?.length > 2) {
                                            value = parseFloat(value.toFixed(2));
                                        }
                                        handleChange("variable_labor_rate", value);
                                    }}
                                />
                            </div>

                            <div className="flex flex-col col-span-2" >
                                <label className="text-[12px] capitalize text-[#002e54]" hidden={showFixedRate}>(Item/Labor)$</label>
                                <input
                                    type="number"
                                    step={0.1}
                                    disabled={true}
                                    className="p-1 rounded-md border border-[#002e54] outline-none text-[12px]  focus:ring-1 focus:ring-[#002e54]"
                                    value={round2Dec(perItemLaborVariable)}

                                />
                            </div>

                            <div className="flex flex-col col-span-2"  >
                                <label className="text-[12px] capitalize text-[#002e54]" hidden={showFixedRate}>Total labor (hr)</label>
                                <input
                                    type="text"
                                    disabled
                                    className="p-1 rounded-md border border-[#002e54] outline-none text-[12px] px-2 bg-gray-100"
                                    value={round2Dec(totalVariableLabor)}
                                    readOnly
                                />
                            </div>


                        </div>

                    </div>

                    <div className="grid grid-cols-5 gap-6">
                        {/* Other grid items would be here */}

                        {/* This div spans all 5 columns and pushes content to the right */}
                        <div className="col-span-5 flex justify-end">
                            <div className="w-[9%]">
                                <label className="text-[12px] capitalize text-[#002e54]">Total Net ($)</label>
                                <input
                                    type="number"
                                    disabled
                                    className="w-full p-1 rounded-md border border-[#002e54] outline-none text-[12px] px-2 bg-gray-100"
                                    value={round2Dec(totalNet)}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>



                </div>
                <div className="flex flex-row items-center gap-2">
                    {(!workOrder.locked_by && Number(workOrder.locked_for_time_clocking) !== 1) && (
                        <button
                            className='bg-[#002e54] text-white text-[12px] px-2.5 py-1.5 flex rounded-md justify-center items-center'
                            onClick={handleSave}
                        >
                            {editData ? "UPDATE" : "ADD"}
                        </button>
                    )}

                    {(!workOrder.locked_by &&  Number(workOrder.locked_for_time_clocking) !== 1) && (
                        <button
                            className={`text-white text-[12px] px-2.5 py-1.5 flex rounded-md justify-center items-center 
                            ${editData?.time_log.length > 0 ? 'bg-gray-300 tooltip tooltip-top before:whitespace-pre-wrap before:content-[attr(data-tip)]' : 'bg-[#002e54]'}`}
                            onClick={handleDelete}
                            disabled={editData?.time_log.length > 0}
                            data-tip={editData?.time_log.length > 0 ? "Can't delete, time is logged in this line" : ""}
                        >
                            DELETE
                        </button>

                    )}

                    <button className='bg-[#002e54] text-white text-[12px] px-2.5 py-1.5 flex rounded-md justify-center items-center' onClick={() => {
                        setModalShowing(false)
                        setEditData()
                    }}>
                        CANCEL
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditJobModal
