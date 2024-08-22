import { useEffect, useState } from "react"
import axios from "axios"

import {round2Dec} from "../utils/NumberHelper";

const EditJobModal = ({ lineNumber, workOrder , commonData,setModalShowing, editData, setEditData }) => {
    console.log(editData)

    const [previousPart, setPreviousPart] = useState(null)

    const [markupPercent, setMarkupPercent] = useState(workOrder.railcar.owner_railcar_owner_idToowner.markup_percent || '')
    const [hourlyRate, setHourlyRate] = useState(workOrder.railcar.owner_railcar_owner_idToowner.labor_rate || '')
    const [totalCost, setTotalCost] = useState('')


    //logic for new part
    const [jobParts, setJobParts] = useState([])


    // for edit modal
    const [deleted, setDeleted] = useState([])

    const handlePartChange = (partId) => {
        const part = commonData.parts.find(part => part.id == partId)
        let newPart
        if(editData) {
            console.log("edit")
            newPart = {
                additional_info: "",
                job_id: editData.jobId,
                purchase_cost: part?.price,
                availability:1,
                part_id: part.id,
                unit: part.unit,
                quantity: part.quantity,
                parts:part
            }
        } else {
            console.log("new")
            newPart = { ...part, additional_info: "" }
        }
        console.log(newPart, "This is the new Part")
        setJobParts(prev => [...prev, newPart])
    }

    const handleRemovePart = (partId) => {
        setDeleted(prev => [...prev, partId])
        setJobParts(prev => (
            [...prev].filter(pv => pv.id !== partId)
        ))
    }

    const handleFieldChange = (partId, field, value) => {
        const part = jobParts.find(part => part.id == partId)
        let updatedPart;
        if(field === "quantity" || field === "purchase_cost") {
            updatedPart = { ...part, [field]: Number(value) }
        } else {
            updatedPart  = { ...part, [field]: value }
        }
        const updatedJobParts = jobParts.map((job) => (
            job.id !== partId ? job : updatedPart
        ))
        console.log(updatedJobParts, "This is the updatedJobPart")
        setJobParts(updatedJobParts)
    }



    const [inputValues, setInputValues] = useState({
        location_code: "",
        quantity: "",
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
        labor_time: "",
        labor_rate: "",
        material_cost: "",
    })

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
                    labor_time:  editData.jobcode_joblist_job_code_appliedTojobcode ? editData.jobcode_joblist_job_code_appliedTojobcode.time_custom : "",
                    labor_cost:  editData.labor_cost ? editData.labor_cost : 0,


                }))
                console.log(editData.jobparts)
                setPreviousPart(editData.jobparts)
                setJobParts(editData.jobparts)
            }
        }
        handleEditData()
    }, [])


    const handleChange = (field, value) => {
        // console.log(value)
        // console.log(field)
        // console.log(commonData.job_codes)
        // console.log(commonData.job_codes.find(job_code => job_code.code == value))

        switch (field) {
            case 'job_code':
                setInputValues(prev => ({
                    ...prev,
                    [field]: parseInt(value),
                    job_description: (() => {
                        const job = commonData.job_codes.find(job_code => job_code.code == value);
                        return job?.description || job?.title || "";
                    })()
                }))

            case 'responsibility_code':
                setInputValues(prev => ({
                    ...prev,
                    [field]: parseInt(value)
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

    const handleSave = async () => {
        // The logic to call the end point will be here

        if(!editData) {
            console.log(inputValues, "This is the input values")
            const populatedJobPart = jobParts.map(jobPt => ({ ...jobPt, markup_percent: markupPercent, availability: 2}))
            const dataToBackend = {
                work_order: workOrder.work_order,
                line_number: Number(lineNumber),
                location_code: inputValues["location_code"],
                quantity: Number(inputValues["quantity"]),
                condition_code: Number(inputValues["condition_code"]),
                job_code_applied: Number(inputValues["job_code"]),
                qualifier_applied_id: Number(inputValues["qualifier_code"]),
                job_description: inputValues["job_description"],
                why_made_code: inputValues["why_made_code"],
                job_code_removed: Number(inputValues["job_code"]),
                qualifier_removed_id: Number(inputValues["qualifier_code_removed"]),
                responsibility_code: inputValues["responsibility"],
                labor_cost: Number(inputValues["labor_cost"]),
                labor_time: Number(inputValues["labor_time"]),
                labor_rate: Number(inputValues["labor_rate"]),
                material_cost: Number(inputValues["material_cost"]),
                // this is the job parts data, I've filled everyone on the UI, it remains availability, it's not on the UI
                jobPartsData: populatedJobPart,
                user_id: 9
            }
            console.log(dataToBackend, "This is the data to be sent to the backend.")
            console.log(`${process.env.REACT_APP_BB_API_URL}create_job/`, "This is the backen url")
            const response = await axios.post(`${process.env.REACT_APP_BB_API_URL}create_job/`, dataToBackend)
            console.log(response, "This is the response from the backend")
        } else {
            const populatedJobPart = jobParts.map(jobPt => ({ ...jobPt, markup_percent: markupPercent, availability: 2}))


            const jobPartsToDelete = previousPart.filter(part => deleted.includes(part.id))
            const jobPartsToUpdate = populatedJobPart.filter((currentPart) => {
                const originalPart = previousPart.find(part => part.part_id === currentPart.part_id);

                if (!originalPart) return false; // New part, not an update

                // Check if any field has changed
                return (
                    currentPart.quantity !== originalPart.quantity ||
                    currentPart.total_cost !== originalPart.total_cost ||
                    currentPart.purchase_cost !== originalPart.purchase_cost ||
                    currentPart.markup_percent !== originalPart.markup_percent || currentPart.additional_info !== originalPart.additional_info
                );
            });

            const jobPartsToCreate = populatedJobPart.filter((currentPart) => {
                const originalPart = previousPart.find(part => part.part_id === currentPart.part_id)
                if(!originalPart) return currentPart
                return false
            })

            const dataToBackend = {
                work_order: workOrder.work_order,
                line_number: Number(lineNumber),
                location_code: inputValues["location_code"],
                quantity: Number(inputValues["quantity"]),
                condition_code: Number(inputValues["condition_code"]),
                job_code_applied: Number(inputValues["job_code"]),
                qualifier_applied_id: Number(inputValues["qualifier_code"]),
                job_description: inputValues["job_description"],
                why_made_code: inputValues["why_made_code"],
                job_code_removed: Number(inputValues["job_code_removed"]),
                qualifier_removed_id: Number(inputValues["qualifier_code_removed"]),
                responsibility_code: inputValues["responsibility"],
                labor_cost: Number(inputValues["labor_cost"]),
                labor_time: Number(inputValues["labor_time"]),
                labor_rate: Number(inputValues["labor_rate"]),
                material_cost: Number(inputValues["material_cost"]),
                // this is the job parts data, I've filled everyone on the UI, it remains availability, it's not on the UI
                jobPartsToCreate,
                jobPartsToDelete,
                jobPartsToUpdate,
                user_id: 9
            }
            // the job
            console.log(dataToBackend, "This is the data to backend from the update")
            const response = await axios.post(`${process.env.REACT_APP_BB_API_URL}update_a_job/${editData.id}`, dataToBackend)
            console.log(response, "This is the response from the backend")
        }
    }

    return (
        <div className='fixed p-2 flex flex-col h-[100vh] overflow-y-auto bg-[#2e2b2b40] backdrop-blur-sm top-0 left-0 w-full justify-center items-center z-[100]' onClick={() => {
            setModalShowing((prev) => (!prev))
            setEditData()
        }}>
            <div className="bg-white drop-shadow-md rounded-md w-[95%] max-w-[1600px] p-4 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                Add jobs
                <div className="grid grid-cols-3 gap-5">
                    <div className="col-span-1 flex flex-col gap-1.5">
                        <div className="h-10 bg-[#DCE5FF] rounded-md px-2 w-full flex justify-center items-center">
                            STEP 1: LOCATION AND CONDITION
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-[12px] capitalize'>Location Code (LOC)</label>
                            <select name="loc" id="loc" className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2' value={inputValues["location_code"]} onChange={(e) => handleChange("location_code", e.target.value)}>
                                <option value=''>Select an option</option>
                                {commonData.location_codes.map((locationcode, index) => (
                                    <option key={`locationcode--${index}`} value={locationcode.code}>{locationcode.code+":"+locationcode.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[12px] capitalize">QUANTITY(QTY)</label>
                            <input type="number" min={1}className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2' placeholder="Quantity" value={inputValues["quantity"]} onChange={(e) => handleChange("quantity", e.target.value)} />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-[12px] capitalize'>Condition Code (CC)</label>
                            <select name="cc" id="cc" className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2' value={inputValues["condition_code"]} onChange={(e) => handleChange("condition_code", e.target.value)}>
                                <option value=''>Select an option</option>
                                {commonData.condition_codes.map((conditioncode, index) => (
                                    <option key={`conditioncode--${index}`} value={conditioncode.code}>{conditioncode.code+":"+conditioncode.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="col-span-1 flex flex-col gap-1.5">
                        <div className="h-10 bg-[#DCE5FF] rounded-md px-2 w-full flex justify-center items-center">
                            STEP 2: JOB APPLIED
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-[12px] capitalize'>Job Code Applied (JC)</label>
                            <select name="job" id="job" className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2' value={inputValues["job_code"]} onChange={(e) => handleChange("job_code", e.target.value)}>
                                <option value=''>Select an option</option>
                                {commonData.job_codes.map((jobcode, index) => (
                                    <option key={`jobcode--${index}`} value={jobcode.code}>{jobcode.code+":"+jobcode.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-[12px] capitalize'>Qualifier Applied (AQ)</label>
                            <select name="loc" id="loc" className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2' value={inputValues["qualifier_code"]} onChange={(e) => handleChange("qualifier_code", e.target.value)}>
                                <option value=''>Select an option</option>
                                {commonData.qualifier_codes.map((qualifiercode, index) => (
                                    <option key={`qualifiercode--${index}`} value={qualifiercode.id}>{qualifiercode.code+":"+qualifiercode.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-[12px] capitalize'>Why Made Code (WMC)</label>
                            <select name="cc" id="cc" className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2' value={inputValues["why_made_code"]} onChange={(e) => handleChange("why_made_code", e.target.value)}>
                                <option value=''>Select an option</option>
                                {commonData.wmc_codes.map((wmc, index) => (
                                    <option key={`wmc--${index}`} value={wmc.code}>{wmc.code+":"+wmc.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="col-span-1 flex flex-col gap-1.5">
                        <div className="h-10 bg-[#DCE5FF] rounded-md px-2 w-full flex justify-center items-center">
                            STEP 3: JOB REMOVED
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-[12px] capitalize'>Jobe Code Removed (JCR)</label>
                            <select name="loc" id="loc" className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2' value={inputValues["job_code_removed"]} onChange={(e) => handleChange("job_code_removed", e.target.value)}>
                                <option value=''>Select an option</option>
                                {commonData.job_codes.map((jobcode, index) => (
                                    <option key={`jobcode--${index}`} value={jobcode.code}>{jobcode.code+":"+jobcode.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-[12px] capitalize'>Qualifier Removed (RQ)</label>
                            <select name="loc" id="loc" className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2' value={inputValues["qualifier_code_removed"]} onChange={(e) => handleChange("qualifier_code_removed", e.target.value)}>
                                <option value=''>Select an option</option>
                                {commonData.qualifier_codes.map((qcr, index) => (
                                    <option key={`qcr--${index}`} value={qcr.id}>{qcr.code+":"+qcr.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-[12px] capitalize'>Responsibility Code (RC)</label>
                            <select name="cc" id="cc" className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2' value={inputValues["responsibility_code"]} onChange={(e) => handleChange("responsibility_code", e.target.value)}>
                                <option value=''>Select an option</option>
                                {commonData.responsibility_codes.map((rc, index) => (
                                    <option key={`rc--${index}`} value={rc.code}>{rc.code+":"+rc.title}</option>
                                ))}
                            </select>
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
                        <select name="loc" id="loc" className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2' onChange={(e) => handlePartChange(e.target.value)}>
                            <option value=''>Select an option</option>
                            {commonData.parts.map((part, index) => (
                                <option key={`locationcode--${index}`} value={part.id}>{part.code+":"+part.title}</option>
                            ))}
                        </select>
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
                                    <input type="text" name="" id="" className="w-[45%] p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" value={jobPart?.additional_info || ""} onChange={(e) => handleFieldChange(jobPart.id, "additional_info", e.target.value)} />
                                    <input type="text" name="" id="" className="w-[14%] p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1 " value={jobPart?.parts.unit} disabled={true} />
                                    <input type="number" name="" id="" className="w-[14%] p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" value={jobPart?.quantity} onChange={(e) => handleFieldChange(jobPart.id, "quantity", e.target.value)} />
                                    <input type="number" name="" id="" className="w-[20%] p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" value={jobPart?.purchase_cost} onChange={(e) => handleFieldChange(jobPart.id, "purchase_cost", e.target.value)} />
                                    <div className="w-[7%]">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => handleRemovePart(jobPart?.id)}>
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
                            <textarea rows={5} className="text-[12px] w-full border-[1px] rounded-md border-[#002e54] p-1 px-2 outline-none" value={inputValues["job_description"]} onChange={(e) => handleChange("job_description", e.target.value)} placeholder="Enter description of repair"></textarea>
                        </div>
                        <div className="col-span-2 grid grid-cols-3 gap-1">
                            <div className="flex flex-col col-span-1">
                                <label className="text-[12px] capitalize">ST. Time (HR)</label>
                                <input type="text" name="" id="" className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" value={inputValues["labor_time"]} onChange={(e) => handleChange("labor_time",e.target.value)} />
                            </div>
                            <div className="flex flex-col col-span-1">
                                <label className="text-[12px] capitalize">Rate ($/HR)</label>
                                <input type="text" name="" id="" className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" value={round2Dec(hourlyRate)} onChange={(e) => handleChange("labor_rate", e.target.value)} />
                            </div>
                            <div className="flex flex-col col-span-1">
                                <label className="text-[12px] capitalize">Total Labor ($)</label>
                                <input type="text" name="" id="" className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" value={inputValues["labor_cost"]} onChange={(e) => handleChange("labor_cost", e.target.value)} />
                            </div>
                            <div className="flex flex-col col-span-1">
                                <label className="text-[12px] capitalize">Purchase ($)</label>
                                <input type="text" name="" id="" className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" />
                            </div>
                            <div className="flex flex-col col-span-1">
                                <label className="text-[12px] capitalize">Markup (%)</label>
                                <input type="number" name="" id="" className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" value={markupPercent} onChange={(e) => setMarkupPercent(e.target.value)} />
                            </div>
                            <div className="flex flex-col col-span-1">
                                <label className="text-[12px] capitalize">Total Material ($)</label>
                                <input type="text" name="" id="" className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" value={inputValues["material_cost"]} onChange={(e) => handleChange("material_cost", e.target.value)} />
                            </div>
                            <div className="col-span-1" />
                            <div className="col-span-1" />
                            <div className="flex flex-col col-span-1">
                                <label className="text-[12px] capitalize">Total Net ($)</label>
                                <input type="number" name="" id="" className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" value={totalCost} onChange={(e) => setTotalCost(e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <button className='bg-[#002e54] text-white text-[12px] px-2.5 py-1.5 flex rounded-md justify-center items-center' onClick={handleSave}>
                        {editData ? "Save" : "Add"}
                    </button>
                    <button className='bg-[#002e54] text-white text-[12px] px-2.5 py-1.5 flex rounded-md justify-center items-center' onClick={() => {
                        setModalShowing(false)
                        setEditData()
                    }}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditJobModal