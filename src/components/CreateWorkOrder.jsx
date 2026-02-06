import axios from "axios"
import {useEffect, useState} from "react"
import RailCarUpdate from "./RailCarUpdate"
import {toast} from "react-toastify"

const CreateWorkOrder = ({setWorkOrderModalShowing, routingMatrix, createWO}) => {
    const [reasonToCome, setReasonToCome] = useState("")
    const [rfiD, setrfiD] = useState("")
    const [tableSchema, setTableSchema] = useState()
    const [lookupData, setLookupData] = useState()
    const [formShowing, setFormShowing] = useState(false)
    const [inputValues, setInputValues] = useState({});
    const [relatedData, setRelatedData] = useState()
    const [rm, setRM] = useState('')
    console.log("create word")
    console.log(routingMatrix)
    //console.log(routingMatrix)
    const fields = [{Field: "rfid", Type: "string"}, {Field: "type_id", Type: "int"}, {
        Field: "owner_id",
        Type: "int"
    }, {Field: "lessee_id", Type: "int"}, {Field: "last_product_id", Type: "int"}]

    useEffect(() => {
        const handleFetchTable = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BIRCH_API_URL}table?table=railcar`)
                console.log(`The response  is`, response.data.schema)
                setTableSchema(response.data.schema)
            } catch (error) {
                console.log(error, "An error occured when fetching table ")
            }
        }
        handleFetchTable()
    }, [])

    const suggestions = [
        "Cleaning",
        "Blasting",
        "Inspection",
        "Repair",
        "Lining",
        "Paint",
        "Compliance",
        "Qualification",
        "Termination"
    ]


    function validateRailCar(input) {
        // Must be exactly 10 characters

        if (input.length !== 10) return false;

        // Pattern for the first 4 chars:
        // - [A-Za-z]{4}      → 4 letters
        // - [A-Za-z]{3}\s    → 3 letters + space
        // - [A-Za-z]{2}\s{2} → 2 letters + 2 spaces
        const prefixRegex = /^(?:[A-Za-z]{4}|[A-Za-z]{3}\s|[A-Za-z]{2}\s{2})/;

        if (!prefixRegex.test(input)) return false;

        // Last 6 characters must be digits
        const suffix = input.slice(4);
        if (!/^\d{6}$/.test(suffix)) return false;

        return true;
    }


    const handleLookup = async () => {
        try {
            setFormShowing(false)
            setLookupData()
            // setRelatedData()
            setInputValues({})
            console.log(rfiD, "This is the cargo number")
            const railcar_id = rfiD.toUpperCase()
            console.log(railcar_id)
            if(!validateRailCar(railcar_id)){
                alert("Railcar ID not valid")
                return
            }
            const response = await axios.get(`${process.env.REACT_APP_BIRCH_API_URL}lookup?rfid=${railcar_id}`)
            if (response.status === 404) {
                console.log('There is a 404 error')
                setFormShowing(true)
                return
            }
            console.log(response.data)
            setLookupData(response.data.railcar)
            setFormShowing(true)
        } catch (error) {
            console.log(error)
            if (error.response && error.response.status === 404) {
                console.log('There is a 404 error')
                setFormShowing(true)
            } else {
                console.log(error)
            }
        }
    }

    // Function to filter out empty strings
    const filterEmptyStrings = (data) => {
        const filteredData = {};
        for (const key in data) {
            if (data[key] !== '') {
                filteredData[key] = data[key];
            }
        }
        return filteredData;
    };

    const formatDateTime = (datetime) => {
        const date = new Date(datetime);
        return date.toISOString()
    };


    const handleSave = async () => {
        if (!inputValues.rfid || inputValues.rfid.trim().length != 10) {
            toast("In valid car number", {type: "error"})
            return
        }
        if (reasonToCome == '') {
            toast("Reason is empty", {type: "error"})
            return
        }

        if(!inputValues.last_product_id ){
            toast("Product can't be empty", {type: "error"})
            return
        }

        if(!inputValues.lessee_id ){
            toast("Lessee can't be empty", {type: "error"})
            return
        }


        if(!inputValues.owner_id ){
            toast("Owner can't be empty", {type: "error"})
            return
        }


        if (rm == '') {
            toast("Routing matrix can't be empty", {type: "error"})
            return
        }
        console.log(inputValues, "This is the object before the removal of the empty strings");
        const filteredValue = filterEmptyStrings(inputValues);
        console.log(filteredValue, "This is the object when the empty strings are removed");
        const transformedValues = {...filteredValue};

        for (const key in transformedValues) {
            const field = fields.find(field => field.Field.toLowerCase() === key);
            if (field && tableSchema.some(schema => schema.name === field.Field && schema.isForeignKey)) {
                console.log(transformedValues[key], "This is the foreign key")
                transformedValues[key] = parseInt(transformedValues[key]);
            }
            if (field && field.Type.toLowerCase() === 'datetime') {
                transformedValues[key] = formatDateTime(transformedValues[key]);
                console.log(transformedValues[key], "found one with type datetime");
            }
        }


        try {
            let response;
            console.log("inside try")
            if (!lookupData) {
                console.log("Reached the create field");
                transformedValues['rfid'] = rfiD.toUpperCase()
                response = await axios.post(`${process.env.REACT_APP_BIRCH_API_URL}table?table=railcar`, transformedValues);

            } else {

                response = await axios.patch(`${process.env.REACT_APP_BIRCH_API_URL}table?table=railcar`, transformedValues);

            }

            const newData = {...response.data};

            tableSchema
                .filter(field => field.isForeignKey)
                .forEach(field => {
                    const foreignKeyField = field.name.toLowerCase();
                    const referencedColumn = field.foreignKeyInfo.referencedColumn.toLowerCase();
                    const relatedItem = relatedData[foreignKeyField].find(item => item[referencedColumn] === newData[foreignKeyField]);

                    if (relatedItem) {
                        if (referencedColumn === 'id') {
                            newData[foreignKeyField] = relatedItem.name;
                        } else {
                            newData[foreignKeyField] = relatedItem[referencedColumn];
                        }
                    }
                });

            console.log(rfiD, reasonToCome, rm)

            createWO(rfiD, reasonToCome, rm)

            setrfiD('')
            setReasonToCome('')
            setRM('')
            setRelatedData()
            setFormShowing(false)
            setWorkOrderModalShowing(false)
            toast.success("Created work order successfully.")
        } catch (error) {
            toast("Something is wrong", {type: "error"})
        }
    };

    const handleSelectChange = (event) => {
        setRM(event.target.value);
    };


    return (
        <div className="bg-white flex flex-col gap-4 rounded-md py-2 px-8 w-full max-w-[600px] z-50 mb-5 mt-5 overflow-y-scroll max-h-[90vh]">
            <div className="flex flex-col gap-2 w-full">
                <h4 className="font-semibold">Order Info</h4>
                <div className="w-full gap-10 text-[10px]">
                    <div className="col-span-1 flex flex-col gap-2">
                        <h6 className="-uppercase">Reason to come</h6>
                        <input type="text"
                               className="rounded-md p-2 border-[1px] border-solid border-[#000] flex outline-none"
                               value={reasonToCome} onChange={(e) => setReasonToCome(e.target.value)}/>
                        <p className="uppercase mt-2">Suggestion</p>
                        <div className="flex flex-row items-center gap-2 flex-wrap">
                            {suggestions.map((suggestion, index) => (
                                <div key={index} className="bg-[#DCE5FF] py-1 px-1.5 rounded-md cursor-pointer"
                                     onClick={() => setReasonToCome(reasonToCome == '' ? suggestion : reasonToCome + "," + suggestion)}>
                                    <p>{suggestion}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
                <h3 className="font-semibold">Routing Matrix</h3>
                <div className="w-full gap-10 text-[14px]">
                    <div className="col-span-1 flex flex-col gap-2  w-ful">
                        <div className="flex flex-row items-center gap-2 flex-wrap  w-ful">
                            <select className="select w-full max-w-xs select-primary w-full max-w-xs" value={rm}
                                    onChange={handleSelectChange}>
                                <option value="" disabled>
                                    --Select an option--
                                </option>
                                {routingMatrix.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
                <h3 className="font-semibold">Car Info</h3>
                <div className="w-full flex flex-col gap-4 text-[14px]">
                    <div className="flex flex-col gap-1">
                        <div className="col-span-1 flex flex-col gap-1">
                            <label className="uppercase">Railcar Number</label>
                            <input type="text" className="outline-none border-[1px] border-solid p-2 rounded-md uppercase"
                                   value={rfiD} placeholder="ABCD######" onChange={(e) => setrfiD(e.target.value)}/>
                        </div>
                        <button
                            className='bg-[#002e54] text-white text-[12px] px-2.5 py-1.5 flex rounded-md justify-center items-center w-fit mt-1 uppercase'
                            onClick={handleLookup}>
                            lookup
                        </button>
                    </div>
                    <div className="">
                        {formShowing &&
                            <RailCarUpdate editRowData={lookupData} tableSchema={tableSchema} inputValues={inputValues}
                                           setInputValues={setInputValues} relatedData={relatedData}
                                           setRelatedData={setRelatedData} rfid={rfiD}/>}
                    </div>
                </div>
            </div>
            <div className='w-full flex flex-row justify-end items-center gap-2 mt-3'>
                <button
                    className='bg-[#002e54] text-white text-[12px] px-2.5 py-1.5 flex rounded-md justify-center items-center'
                    onClick={handleSave}>
                    Submit
                </button>
            </div>
        </div>

    )
}

export default CreateWorkOrder