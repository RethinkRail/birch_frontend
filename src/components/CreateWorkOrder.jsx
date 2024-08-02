import axios from "axios"
import { useEffect, useState } from "react"
import CargoUpdate from "./CargoUpdate"
import { toast } from "react-toastify"

const CreateWorkOrder = ({ workOrderResponse, workOrderValues, setWorkOrderValues, setWorkOrderModalShowing }) => {
    const [reasonToCome, setReasonToCome] = useState("")
    const [cargoNumber, setCargoNumber] = useState("")
    const [tableSchema, setTableSchema] = useState()
    const [lookupData, setLookupData] = useState()
    const [formShowing, setFormShowing] = useState(false)
    const [inputValues, setInputValues] = useState({});
    const [relatedData, setRelatedData] = useState()

    const fields = [{Field: "rfid", Type: "string"}, {Field: "type_id", Type: "int"}, {Field: "owner_id", Type: "int"}, {Field: "lessee_id", Type: "int"}, {Field: "last_product_id", Type: "int"}]

    useEffect(() => {
        const handleFetchTable = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BIRCH_API_URL}table?table=railcar`)
                console.log(`The response gotten is`, response.data.schema)
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setWorkOrderValues(prevValues => ({
            ...prevValues,
            [name]: value
        }));
    };

    const handleLookup = async () => {
        try {
            setFormShowing(false)
            setLookupData()
            setRelatedData()
            setInputValues({})
            console.log(cargoNumber, "This is the cargo number")
            const response = await axios.get(`${process.env.REACT_APP_BB_API_URL}lookup?rfid=${cargoNumber}`)
            if(response.status === 404) {
                console.log('There is a 404 error')
                setFormShowing(true)
                return
            }
            console.log(response.data)
            setLookupData(response.data.cargo)
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
        console.log(inputValues, "This is the object before the removal of the empty strings");
        const filteredValue = filterEmptyStrings(inputValues);
        console.log(filteredValue, "This is the object when the empty strings are removed");
        const transformedValues = { ...filteredValue };
      
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

        console.log(transformedValues, "This is the transformed value");
      
        try {
          let response;
          if (!lookupData) {
            console.log("Reached the create field");
            response = await axios.post(`${process.env.REACT_APP_BB_API_URL}table?table=cargo`, transformedValues);
    
          } else {
            response = await axios.patch(`${process.env.REACT_APP_BB_API_URL}table?table=cargo`, transformedValues);
          }
          console.log(response, "This is the response from the data creation/update");
      
          const newData = { ...response.data };
      
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
            setCargoNumber()
            setRelatedData()
            setFormShowing(false)
            setWorkOrderModalShowing(false)
        } catch (error) {
          console.log(error);
          console.log(error.response.data.message, "This is the error")
          toast.error(error.response.data.message)
        }
      };


    return (
        <div className="modal rounded-md h-full ">
            <div className="flex flex-col gap-2 w-full">
                <h3 className="font-semibold">
                    Order Info
                </h3>
                <div className="w-full grid grid-cols-2 gap-10 text-[14px]">
                    <div className="col-span-1 grid grid-cols-2 gap-4">
                        <div className="col-span-1 flex flex-col gap-1">
                            <label className="uppercase">
                                Work Order
                            </label>
                            <input type="text" className="outline-none border-[1px] border-solid p-2 rounded-md" name="workOrder" value={workOrderValues.workOrder || ""} onChange={handleChange} />
                        </div>
                        <div className="col-span-1 flex flex-col gap-1">
                            <label className="uppercase">
                                Yard
                            </label>
                            {/*<select type="text" className="outline-none border-[1px] border-solid p-2 rounded-md" name="yard">*/}
                            {/*    {workOrderResponse.yard.map((yd, index) => (*/}
                            {/*        <option key={index} value={yd}>*/}
                            {/*            {yd.toUpperCase()}*/}
                            {/*        </option>*/}
                            {/*    ))}*/}
                            {/*</select>*/}
                        </div>
                        <div className="col-span-1 flex flex-col gap-1">
                            <label className="uppercase">
                                splc
                            </label>
                            <input type="text" className="outline-none border-[1px] border-solid p-2 rounded-md" name="splc" value={workOrderValues.splc || ""} onChange={handleChange} />
                        </div>
                        <div className="col-span-1 flex flex-col gap-1">
                            <label className="-uppercase">
                                Creator
                            </label>
                            {/*<select type="text" className="outline-none border-[1px] border-solid p-2 rounded-md" name="creator">*/}
                            {/*    {workOrderResponse.creator.map((yd, index) => (*/}
                            {/*        <option key={index} value={yd}>*/}
                            {/*            {yd.toUpperCase()}*/}
                            {/*        </option>*/}
                            {/*    ))}*/}
                            {/*</select>*/}
                        </div>
                        <div className="col-span-1 flex flex-col gap-1">
                            <label className="-uppercase">
                                Status
                            </label>
                            {/*<select type="text" className="outline-none border-[1px] border-solid p-2 rounded-md" name="status">*/}
                            {/*    {workOrderResponse.status.map((yd, index) => (*/}
                            {/*        <option key={index} value={yd}>*/}
                            {/*            {yd.toUpperCase()}*/}
                            {/*        </option>*/}
                            {/*    ))}*/}
                            {/*</select>*/}
                        </div>
                        <div className="col-span-1 flex flex-col gap-1">
                            <label className="-uppercase">
                                comment
                            </label>
                            {/*<input type="text" className="outline-none border-[1px] border-solid p-2 rounded-md uppercase" name="comment" value={workOrderValues.comment || ""} onChange={handleChange} />*/}
                            <input type="text" className="outline-none border-[1px] border-solid p-2 rounded-md uppercase" name="comment"  onChange={handleChange} />
                        </div>
                        <div className="col-span-1 flex flex-col gap-1">
                            <label className="-uppercase">
                                Routing Matrix
                            </label>
                            {/*<select type="text" className="outline-none border-[1px] border-solid p-2 rounded-md" name="routingMatrix">*/}
                            {/*    {workOrderResponse.routingMatrix.map((yd, index) => (*/}
                            {/*        <option key={index} value={yd}>*/}
                            {/*            {yd.toUpperCase()}*/}
                            {/*        </option>*/}
                            {/*    ))}*/}
                            {/*</select>*/}
                        </div>
                    </div>
                    <div className="col-span-1 flex flex-col gap-2">
                        <h4 className="-uppercase">Reason to come</h4>
                        <input type="text" className=" rounded-md p-5 border-[1px] border-solid border-[#000] flex outline-none" value={reasonToCome} onChange={(e) => setReasonToCome(e.target.value)} />
                        <p className="uppercase mt-2">
                            Suggestion
                        </p>
                        <div className="flex flex-row items-center gap-2 flex-wrap">
                            {suggestions.map((suggestion, index) => (
                                <div key={index} className="bg-[#DCE5FF] py-1 px-1.5 rounded-md cursor-pointer" onClick={() => setReasonToCome(suggestion)}>
                                    <p>{suggestion}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
                <h3 className="font-semibold">
                    Car Info
                </h3>
                <div className="w-full grid grid-cols-2 gap-10 text-[14px]">
                    <div className="col-span-1 flex flex-col gap-1">
                        <div className="col-span-1 flex flex-col gap-1">
                            <label className="uppercase">
                                Cargo Number
                            </label>
                            <input type="text" className="outline-none border-[1px] border-solid p-2 rounded-md" value={cargoNumber} placeholder="ABCD######" onChange={(e) => setCargoNumber(e.target.value)} />
                        </div>
                        <button className='bg-[#002e54] text-white text-[12px] px-2.5 py-1.5 flex rounded-md justify-center items-center w-fit mt-1 uppercase' onClick={handleLookup}>
                            lookup
                        </button>
                    </div>
                    <div className="col-span-1">
                        {formShowing && <CargoUpdate editRowData={lookupData} tableSchema={tableSchema} inputValues={inputValues} setInputValues={setInputValues} relatedData={relatedData} setRelatedData={setRelatedData} cargoNumber={cargoNumber} />}
                    </div>
                </div>
            </div>
            <div className='w-full flex flex-row justify-end items-center gap-2 mt-3'>
                <button className='bg-[#002e54] text-white text-[12px] px-2.5 py-1.5 flex rounded-md justify-center items-center' onClick={handleSave}>
                    Submit
                </button>
            </div>
        </div>
    )
}

export default CreateWorkOrder