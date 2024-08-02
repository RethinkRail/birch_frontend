import CreateWorkOrder from "./CreateWorkOrder"
import { useEffect, useState } from "react"
import axios from "axios"

const WorkOrderModal = ({ setWorkOrderModalShowing }) => {
    // This is the dummy value fetched from the backend
    const [workOrderResponse, setWorkOrderResponse] = useState()
    // This manages the current value the user picked
    const [workOrderValues, setWorkOrderValues] = useState()

    useEffect(() => {
        const handleFetch = async () => {
            const response = await axios.get(`${process.env.REACT_APP_BIRCH_API_URL}get_last_work_order`)
            console.log(response.data, "This is the work order response")
            // Initialize workOrderValues with default values
            const initialValues = {};
            // for (const key in response.data) {
            //     if (Array.isArray(response.data[key])) {
            //         initialValues[key] = response.data[key][0]; // Set the first entry of the array as the default value
            //     } else {
            //         initialValues[key] = response.data[key]; // Set the value directly if it's not an array
            //     }
            // }

            initialValues["wo"] = "www";
            console.log(initialValues, "The initial values is   ")

            setWorkOrderResponse(response.data);
            setWorkOrderValues(initialValues);
        }
        handleFetch()
    }, [])

    return (
        <div className="absolute h-screen w-full top-0 left-0 bg-white">
            <div className="h-[60px] fixed w-full bg-[#DCE5FF] flex items-center justify-end p-5">
                <button onClick={() => {
                    setWorkOrderResponse()
                    setWorkOrderModalShowing(false)
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="#464646" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
            {workOrderResponse && <CreateWorkOrder workOrderResponse={workOrderResponse} workOrderValues={workOrderValues} setWorkOrderValues={setWorkOrderValues} setWorkOrderModalShowing={setWorkOrderModalShowing} />}
        </div>
    )
}

export default WorkOrderModal