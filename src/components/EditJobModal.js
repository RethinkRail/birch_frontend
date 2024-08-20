/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 8/14/2024, Wednesday
 * Description:
 **/

import { useEffect, useState } from "react"
import axios from "axios"

const EditJobModal = ({ commonData,lineNumber, workOrder ,setModalShowing, setEditData }) => {

    const [inputValues, setInputValues] = useState({
        location_code: "",
        quantity: "",
        condition_code: "",
        job_code: "",
        job_description: "",
        part: "",
        why_made_code: "",
        responsibility_code: "",
        qualifier_code: "",
        labor_cost: "",
        labor_time: "",
        labor_rate: "",
        material_cost: "",
        jobpart_quantity: "",
        jobpart_additional_info: "",
        jobpart_markup_percent: "",
        jobpart_total_cost: "",
        jobpart_purchase_cost: "",
    })

    const handleClearPart = () => {
        setInputValues(prev => ({
            ...prev,
            part: "",
            jobpart_quantity: "",
            jobpart_total_cost: "",
            jobpart_purchase_cost: "",
            jobpart_markup_percent: "",
            jobpart_additional_info: ""
        }))

        // /create_job/
    }


    const handleChange = (field, value) => {
        switch (field) {
            case 'job_code':
                setInputValues(prev => ({
                    ...prev,
                    [field]: parseInt(value),
                    job_description: commonData.job_codes.find(job_code => job_code.code == parseInt(value))?.description || ""
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
        console.log(inputValues, "This is the input values")
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
            qualifier_removed_id: Number(inputValues["qualifier_code"]),
            responsibility_code: inputValues["responsibility"],
            labor_cost: Number(inputValues["labor_cost"]),
            labor_time: Number(inputValues["labor_time"]),
            labor_rate: Number(inputValues["labor_rate"]),
            material_cost: Number(inputValues["material_cost"]),
            // this is the job parts data, I've filled everyone on the UI, it remains availability, it's not on the UI
            jobPartsData: {
                part_id: Number(inputValues["part"]),
                quantity: Number(inputValues["jobpart_quantity"]),
                total_cost: Number(inputValues["jobpart_total_cost"]),
                purchase_cost: Number(inputValues["jobpart_purchase_cost"]),
                markup_percent: Number(inputValues["jobpart_markup_percent"]),
                additional_info: Number(inputValues["jobpart_additional_info"])
            },
            user_id: 9
        }
        console.log(dataToBackend, "This is the data to be sent to the backend.")
        console.log(`${process.env.REACT_APP_BB_API_URL}create_job/`, "This is the backen url")
        const response = await axios.post(`${process.env.REACT_APP_BB_API_URL}create_job/`, dataToBackend)
        console.log(response, "This is the response from the backend")
    }

    return (
        <div className='fixed p-2 flex flex-col h-[100vh] overflow-y-auto bg-[#2e2b2b40] backdrop-blur-sm top-0 left-0 w-full justify-center items-center z-[100]' onClick={() => {
            setModalShowing((prev) => (!prev))
            setEditData()
        }}>
            <div className="bg-white drop-shadow-md rounded-md w-[95%] max-w-[1100px] p-4 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
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
                                    <option key={`locationcode--${index}`} value={locationcode.code}>{locationcode.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[12px] capitalize">QUANTITY(QTY)</label>
                            <input type="text" className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2' placeholder="Quantity" value={inputValues["quantity"]} onChange={(e) => handleChange("quantity", e.target.value)} />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-[12px] capitalize'>Condition Code (CC)</label>
                            <select name="cc" id="cc" className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2' value={inputValues["condition_code"]} onChange={(e) => handleChange("condition_code", e.target.value)}>
                                <option value=''>Select an option</option>
                                {commonData.condition_codes.map((conditioncode, index) => (
                                    <option key={`conditioncode--${index}`} value={conditioncode.code}>{conditioncode.title}</option>
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
                                {commonData.job_codes.map((locationcode, index) => (
                                    <option key={`locationcode--${index}`} value={locationcode.code}>{locationcode.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-[12px] capitalize'>Qualifier Applied (AQ)</label>
                            <select name="loc" id="loc" className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2' value={inputValues["qualifier_code"]} onChange={(e) => handleChange("qualifier_code", e.target.value)}>
                                <option value=''>Select an option</option>
                                {commonData.qualifier_codes.map((locationcode, index) => (
                                    <option key={`locationcode--${index}`} value={locationcode.id}>{locationcode.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-[12px] capitalize'>Why Made Code (WMC)</label>
                            <select name="cc" id="cc" className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2' value={inputValues["why_made_code"]} onChange={(e) => handleChange("why_made_code", e.target.value)}>
                                <option value=''>Select an option</option>
                                {commonData.wmc_codes.map((conditioncode, index) => (
                                    <option key={`conditioncode--${index}`} value={conditioncode.code}>{conditioncode.title}</option>
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
                            <select name="loc" id="loc" className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2' value={inputValues["job_code"]} onChange={(e) => handleChange("job_code", e.target.value)}>
                                <option value=''>Select an option</option>
                                {commonData.job_codes.map((locationcode, index) => (
                                    <option key={`locationcode--${index}`} value={locationcode.code}>{locationcode.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-[12px] capitalize'>Qualifier Removed (RQ)</label>
                            <select name="loc" id="loc" className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2' value={inputValues["qualifier_code"]} onChange={(e) => handleChange("qualifier_code", e.target.value)}>
                                <option value=''>Select an option</option>
                                {commonData.qualifier_codes.map((locationcode, index) => (
                                    <option key={`locationcode--${index}`} value={locationcode.id}>{locationcode.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-[12px] capitalize'>Responsibility Code (RC)</label>
                            <select name="cc" id="cc" className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2' value={inputValues["responsibility_code"]} onChange={(e) => handleChange("responsibility_code", e.target.value)}>
                                <option value=''>Select an option</option>
                                {commonData.responsibility_codes.map((conditioncode, index) => (
                                    <option key={`conditioncode--${index}`} value={conditioncode.code}>{conditioncode.title}</option>
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
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={handleClearPart}>
                                <path d="M18 6L6 18M6 6L18 18" stroke="#464646" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <select name="loc" id="loc" className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2' value={inputValues["part"]} onChange={(e) => handleChange("part", e.target.value)}>
                            <option value=''>Select an option</option>
                            {commonData.parts.map((locationcode, index) => (
                                <option key={`locationcode--${index}`} value={locationcode.id}>{locationcode.title}</option>
                            ))}
                        </select>
                    </div>
                    {/* <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="#464646" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg> */}
                    <div className="grid grid-cols-8 gap-3 text-[12px] mt-2">
                        <div className="col-span-5 flex flex-col gap-1.5">
                            <h4>Code Title</h4>
                            <p className="">
                                {commonData.parts.find(part => part.id == inputValues[part])?.title || ""}
                            </p>
                        </div>
                        <div className="col-span-3 grid grid-cols-9 gap-1">
                            <div className="flex flex-col gap-1.5 col-span-5">
                                <label>Additional Info</label>
                                <input type="text" name="" id="" className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" />
                            </div>
                            <div className="flex flex-col gap-1.5 col-span-1">
                                <label>Unit</label>
                                <input type="text" name="" id="" className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" />
                            </div>
                            <div className="flex flex-col gap-1.5 col-span-1">
                                <label>Qty</label>
                                <input type="text" name="" id="" className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" value={inputValues["jobpart_quantity"]} onChange={(e) => handleChange("jobpart_quantity", e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1.5 col-span-2">
                                <label>Purchase</label>
                                <input type="number" name="" id="" className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" />
                            </div>
                        </div>
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
                                <input type="text" name="" id="" className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" value={inputValues["labor_rate"]} onChange={(e) => handleChange("labor_rate", e.target.value)} />
                            </div>
                            <div className="flex flex-col col-span-1">
                                <label className="text-[12px] capitalize">Total Labor ($)</label>
                                <input type="text" name="" id="" className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" value={inputValues["labor_cost"]} onChange={(e) => handleChange("labor_cost", e.target.value)} />
                            </div>
                            <div className="flex flex-col col-span-1">
                                <label className="text-[12px] capitalize">Purchase ($)</label>
                                <input type="text" name="" id="" className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" value={inputValues["jobpart_purchase_cost"]} onChange={(e) => handleChange("jobpart_purchase_cost", e.target.value)} />
                            </div>
                            <div className="flex flex-col col-span-1">
                                <label className="text-[12px] capitalize">Markup (%)</label>
                                <input type="text" name="" id="" className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" value={inputValues["jobpart_markup_percent"]} onChange={(e) => handleChange("jobpart_markup_percent", e.target.value)} />
                            </div>
                            <div className="flex flex-col col-span-1">
                                <label className="text-[12px] capitalize">Total Material ($)</label>
                                <input type="text" name="" id="" className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" value={inputValues["material_cost"]} onChange={(e) => handleChange("material_cost", e.target.value)} />
                            </div>
                            <div className="col-span-1" />
                            <div className="col-span-1" />
                            <div className="flex flex-col col-span-1">
                                <label className="text-[12px] capitalize">Total Net ($)</label>
                                <input type="text" name="" id="" className="p-[2px] rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-1" value={inputValues["jobpart_total_cost"]} onChange={(e) => handleChange("jobpart_total_cost", e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <button className='bg-[#002e54] text-white text-[12px] px-2.5 py-1.5 flex rounded-md justify-center items-center' onClick={handleSave}>
                        Add
                    </button>
                    <button className='bg-[#002e54] text-white text-[12px] px-2.5 py-1.5 flex rounded-md justify-center items-center' onClick={() => setModalShowing(false)}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditJobModal

// bg-[#2e2b2b40]