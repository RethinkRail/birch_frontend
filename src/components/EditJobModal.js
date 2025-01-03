import { useEffect, useState } from "react"
import axios from "axios"
import {round2Dec} from "../utils/NumberHelper";
import {showToastMessage} from "../utils/CommonHelper";
import {toast} from "react-toastify";
import Select from "react-select";


const EditJobModal = ({ lineNumber, workOrder  , commonData,setModalShowing, editData, setEditData ,createAjob,updateAJob,deleteJob}) => {
    console.log(editData)
    console.log(commonData)
    console.log(lineNumber)

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
        // if (field in part.parts) {
        //     console.log("sas")
        //     updatedPart = {
        //         ...part,
        //         parts: {
        //             ...part.parts,
        //             [field]: value
        //         }
        //     };
        // } else {
        //     console.log("sassssss")
        //     updatedPart = {
        //         ...part,
        //         [field]: field === "quantity" || field === "purchase_cost" ? Number(value) : value
        //     };
        // }

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
        labor_rate: workOrder.railcar.owner_railcar_owner_idToowner.labor_rate,
        material_cost: "",
        purchase: "",
    })

    const [purchase, setPurchase] = useState("")

    const [totalLabor, setTotalLabor] = useState("")
    const [totalMaterial, setTotalMaterial] = useState("")
    const [totalNet, setTotalNet] = useState("")

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
        setTotalNet(Number(totalLabor) + Number(totalMaterial))
    }, [totalLabor, totalMaterial])

    useEffect(() => {
        const handleInputValuesChange = () => {
            console.log(inputValues["labor_rate"], inputValues["labor_time"], inputValues["quantity"])
            setTotalLabor(Number(inputValues["labor_rate"]) * Number(inputValues["labor_time"]) *  Number(inputValues["quantity"]))
        }
        handleInputValuesChange()
    }, [inputValues])

    useEffect(() => {
        const handleEditData = () => {
            if(editData) {
                console.log(editData, "Edit data exists")
                setInputValues(prev => ({
                    ...prev,
                    location_code: editData.locationcode ? editData.locationcode.code : "",
                    qualifier_code: editData.qualifiercode_joblist_qualifier_applied_idToqualifiercode ? editData.qualifiercode_joblist_qualifier_applied_idToqualifiercode.id : "",
                    qualifier_code_removed: editData.qualifiercode_joblist_qualifier_removed_idToqualifiercode ? editData.qualifiercode_joblist_qualifier_removed_idToqualifiercode.id : ""
                    ,
                    job_code: editData.jobcode_joblist_job_code_appliedTojobcode ? editData.jobcode_joblist_job_code_appliedTojobcode.code : "",
                    job_code_removed: editData.jobcode_joblist_job_code_removedTojobcode ? editData.jobcode_joblist_job_code_removedTojobcode.code : "",
                    job_description: editData.job_description ? editData.job_description : "",
                    material_cost: editData.material_cost ? editData.material_cost : "",
                    quantity: editData.quantity ? editData.quantity : "",
                    why_made_code: editData.whymadecode ? editData.whymadecode.code : "",
                    responsibility_code: editData.responsibilitycode ? editData.responsibilitycode.code : "",
                    condition_code:  editData.conditioncode ? editData.conditioncode.code : "",
                    labor_time:  editData.labor_time ,
                    labor_rate:  editData.labor_rate ,
                    labor_cost:  Number(editData?.quantity) * Number(editData?.labor_time)* Number(editData?.labor_rate)
                }))
                console.log(editData.jobparts)
                setPreviousPart(editData.jobparts)
                setJobParts(editData.jobparts)
            }
        }
        handleEditData()
    }, [])


    const handleChange = (field, value) => {
        console.log(field)
        console.log(value)

        switch (field) {
            case 'job_code':
                setInputValues(prev => ({
                    ...prev,
                    [field]: parseInt(value),
                    job_description: (() => {
                        const job = commonData.job_codes.find(job_code => job_code.code == value);
                        return job?.description || job?.title || "";
                    })(),
                    labor_time: (() => {
                        const job = commonData.job_codes.find(job_code => job_code.code == value);
                        return job?.time_custom || job?.time_standard ;
                    })(),

                    job_code_removed: (() => {
                        const job = commonData.job_codes.find(job_code => job_code.code == value);
                        return job?.code  ;
                    })(),
                    qualifier_code_removed: (() => {
                        return '' ;
                    })(),
                    qualifier_code: (()=>{
                        return ''
                    })()
                }))

            case 'qualifier_code':
                setInputValues(prev => ({
                    ...prev,
                    [field]: parseInt(value),

                    qualifier_code_removed: (() => {
                        const job = commonData.qualifier_codes.find(job_code => job_code.id == value);
                        return job?.id  ;
                    })()
                }))
            case 'condition_code':
                setInputValues(prev => ({
                    ...prev,
                    [field]: parseInt(value)
                }))
            default:
                setInputValues(prev => ({
                    ...prev,
                    [field]: value
                }))
        }
        console.log(field, value, "Input value changed")
    }
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
        // The logic to call the end point will be here

        if(!editData) {
            console.log(inputValues, "This is the input values")
            let populatedJobPart = jobParts.map(jobPt => ({ ...jobPt, markup_percent: Number( markupPercent), availability: 1}))
            console.log(populatedJobPart)
            populatedJobPart = processPartsArray(populatedJobPart)
            console.log(populatedJobPart)
            const dataToBackend = {
                work_id: workOrder.id,
                work_order: workOrder.work_order,
                line_number: Number(lineNumber),
                location_code: inputValues["location_code"],
                quantity: Number(round2Dec(inputValues["quantity"])),
                condition_code: inputValues["condition_code"],
                job_code_applied: Number(inputValues["job_code"]),
                qualifier_applied_id: Number(inputValues["qualifier_code"])>0?Number(inputValues["qualifier_code"]):null,
                job_description: inputValues["job_description"],
                why_made_code: inputValues["why_made_code"],
                job_code_removed: Number(inputValues["job_code_removed"]),
                qualifier_removed_id: Number(inputValues["qualifier_code_removed"])>0?Number(inputValues["qualifier_code_removed"]):null,
                responsibility_code: Number(inputValues["responsibility_code"]),

                labor_cost: Number(round2Dec(totalLabor)),
                labor_time: Number(round2Dec(inputValues["labor_time"])),
                labor_rate: Number(round2Dec(inputValues["labor_rate"])),
                material_cost: Number(round2Dec(totalMaterial)),
                // this is the job parts data, I've filled everyone on the UI, it remains availability, it's not on the UI
                jobPartsData: populatedJobPart,
                user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["id"]
            }
            console.log(populatedJobPart)
            console.log(dataToBackend)
            console.log(dataToBackend, "This is the data to be sent to the backend.")
            //console.log(`${process.env.REACT_APP_BB_API_URL}create_job/`, "This is the backen url")
            //const response = await axios.post(`${process.env.REACT_APP_BIRCH_API_URL}create_job/`, dataToBackend)
            const response = await  createAjob(dataToBackend)
            console.log(response)
            if(response.status == 200){

                setModalShowing(false)

            }else {

            }
        } else {
            console.log(editData)
            console.log("here")
            let populatedJobPart = jobParts.map(jobPt => ({ ...jobPt, markup_percent: Number(markupPercent), availability: 1}))
            console.log(populatedJobPart)
            populatedJobPart = processPartsArray(populatedJobPart)
            console.log(populatedJobPart)
            const jobPartsToDelete = previousPart.filter(part => deleted.includes(part.part_id))
            const jobPartsToUpdate = populatedJobPart.filter((currentPart) => {
                const originalPart = previousPart.find(part => part.part_id === currentPart.part_id);
                console.log(originalPart)
                if (!originalPart){
                    console.log("No original part")
                    return false;
                } // New part, not an update
                console.log(currentPart)
                console.log(originalPart)
                // Check if any field has changed
                return (
                    currentPart.quantity !== originalPart.quantity ||
                    currentPart.total_cost !== originalPart.total_cost ||
                    currentPart.purchase_cost !== originalPart.purchase_cost ||
                    currentPart.additional_info !== originalPart.additional_info ||
                    currentPart.markup_percent !== editData.jobparts[0].markup_percent
                );
            });

            const  jobPartsToAdd = populatedJobPart.filter((currentPart) => {
                const originalPart = previousPart.find(part => part.part_id === currentPart.part_id)
                if(!originalPart) return currentPart
                return false
            })
            //
            // jobPartsToAdd = jobPartsToAdd= jobPartsToAdd.map((jp)=>{
            //     jp.job_id = editData.id
            // })

            const dataToBackend = {
                work_order: workOrder.work_order,
                work_id: workOrder.id,
                line_number: Number(editData.line_number),
                location_code: inputValues["location_code"],
                quantity: Number(round2Dec(inputValues["quantity"])),
                condition_code: inputValues["condition_code"],
                job_code_applied: Number(inputValues["job_code"]),
                qualifier_applied_id: Number(inputValues["qualifier_code"])>0?Number(inputValues["qualifier_code"]):null,
                job_description: inputValues["job_description"],
                why_made_code: inputValues["why_made_code"],
                job_code_removed: Number(inputValues["job_code_removed"]),
                qualifier_removed_id: Number(inputValues["qualifier_code_removed"])>0?Number(inputValues["qualifier_code_removed"]):null,
                responsibility_code: Number(inputValues["responsibility_code"]),
                labor_cost: Number(round2Dec(totalLabor)),
                labor_time: Number(round2Dec(inputValues["labor_time"])),
                labor_rate: Number(round2Dec(inputValues["labor_rate"])),
                material_cost: Number(round2Dec(totalMaterial)),
                // this is the job parts data, I've filled everyone on the UI, it remains availability, it's not on the UI
                jobPartsToAdd: jobPartsToAdd,
                jobPartsToDelete,
                jobPartsToUpdate,
                user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["id"]
            }

            console.log(dataToBackend)
            // the job
            console.log(dataToBackend, "This is the data to backend from the update")
            const response = await  updateAJob(dataToBackend, editData.id)
            console.log(response)
            if(response.status == 200){
                setModalShowing(false)
            }else {

            }
            console.log(response, "This is the response from the backend")
        }
    }
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
            setModalShowing((prev) => (!prev))
            setEditData()
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
                    <div className="grid grid-cols-5 gap-4 mt-4">
                        <div className="col-span-3 flex flex-col gap-1.5">
                            <label className="capitalize text-[12px]">Description of Repair</label>
                            <textarea rows={5} disabled={workOrder.locked_by != null} className="text-[12px] w-full border-[1px] rounded-md border-[#002e54] p-1 px-2 outline-none" value={inputValues["job_description"]} onChange={(e) => handleChange("job_description", e.target.value)} placeholder="Enter description of repair"></textarea>
                        </div>
                        <div className="col-span-2 grid grid-cols-3 gap-1">
                            <div className="flex flex-col col-span-1">
                                <label className="text-[12px] capitalize">ST. Time (HR)</label>
                                <input
                                    type="number"
                                    step={0.01}
                                    disabled={workOrder.locked_by != null}
                                    name=""
                                    id=""
                                    className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1"
                                    value={inputValues["labor_time"]}
                                    onChange={(e) => {
                                        let value = parseFloat(e.target.value);
                                        // Check if the value has more than 2 decimal places
                                        if (value && value.toString().split(".")[1]?.length > 2) {
                                            // Round to 2 decimal places if necessary
                                            value = parseFloat(value.toFixed(2));
                                        }
                                        handleChange("labor_time", value);
                                    }}
                                />

                            </div>
                            <div className="flex flex-col col-span-1">
                                <label className="text-[12px] capitalize">Rate ($/HR)</label>
                                <input
                                    type="number"
                                    step={0.1}
                                    disabled={workOrder.locked_by != null}
                                    name=""
                                    id=""
                                    className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1"
                                    value={inputValues["labor_rate"]}
                                    onChange={(e) => {
                                        let value = parseFloat(e.target.value);
                                        // Check if the value has more than 2 decimal places
                                        if (value && value.toString().split(".")[1]?.length > 2) {
                                            // If more than 2 decimal places, round it to 2 decimals
                                            value = parseFloat(value.toFixed(2));
                                        }
                                        handleChange("labor_rate", value);
                                    }}
                                />

                            </div>
                            <div className="flex flex-col col-span-1">
                                <label className="text-[12px] capitalize">Total Labor ($)</label>
                                <input type="text" disabled name="" id="" className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" value={round2Dec(totalLabor)} readOnly />
                            </div>
                            <div className="flex flex-col col-span-1">
                                <label className="text-[12px] capitalize">Purchase ($)</label>
                                <input type="text" disabled name="" id="" className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" value={round2Dec(purchase)} onChange={(e) => setPurchase(round2Dec(purchase))} />
                            </div>
                            <div className="flex flex-col col-span-1">
                                <label className="text-[12px] capitalize">Markup (%)</label>
                                <input
                                    type="number"
                                    disabled={workOrder.locked_by != null}
                                    name=""
                                    id=""
                                    className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1"
                                    value={markupPercent}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value);
                                        // Check if the value has more than 2 decimal places
                                        if (value && value.toString().split(".")[1]?.length > 2) {
                                            // If more than 2 decimal places, round it to 2 decimals
                                            setMarkupPercent(value.toFixed(2));
                                        } else {
                                            setMarkupPercent(e.target.value);
                                        }
                                    }}
                                />

                            </div>
                            <div className="flex flex-col col-span-1">
                                <label className="text-[12px] capitalize">Total Material ($)</label>
                                <input type="text"  disabled  name="" id="" className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" value={round2Dec(totalMaterial)} readOnly />
                            </div>
                            <div className="col-span-1" />
                            <div className="col-span-1" />
                            <div className="flex flex-col col-span-1">
                                <label className="text-[12px] capitalize">Total Net ($)</label>
                                <input type="number"  disabled name="" id="" className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" value={round2Dec(totalNet)} readOnly />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-2">
                    {!workOrder.locked_by && (
                        <button
                            className='bg-[#002e54] text-white text-[12px] px-2.5 py-1.5 flex rounded-md justify-center items-center'
                            onClick={handleSave}
                        >
                            {editData ? "UPDATE" : "ADD"}
                        </button>
                    )}

                    {editData && !workOrder.locked_by && (
                        <button
                            className={`text-white text-[12px] px-2.5 py-1.5 flex rounded-md justify-center items-center 
                            ${editData.time_log.length > 0 ? 'bg-gray-300 tooltip tooltip-top before:whitespace-pre-wrap before:content-[attr(data-tip)]' : 'bg-[#002e54]'}`}
                            onClick={handleDelete}
                            disabled={editData.time_log.length > 0}
                            data-tip={editData.time_log.length > 0 ? "Can't delete, time is logged in this line" : ""}
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
