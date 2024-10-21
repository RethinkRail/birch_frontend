import CreateWorkOrder from "./CreateWorkOrder"
import {useState} from "react"

const WorkOrderModal = ({setWorkOrderModalShowing, routingMatrix, createWO}) => {
    // This is the dummy value fetched from the backend
    const [workOrderResponse, setWorkOrderResponse] = useState()
    // This manages the current value the user picked
    const [workOrderValues, setWorkOrderValues] = useState()
    //
    // useEffect(() => {
    //     const handleFetch = async () => {
    //         const response = await axios.get(`${process.env.REACT_APP_BIRCH_API_URL}dummy-workorder`)
    //         console.log(response.data.workOrder, "This is the work order response")
    //         // Initialize workOrderValues with default values
    //         const initialValues = {};
    //         for (const key in response.data.workOrder) {
    //             if (Array.isArray(response.data.workOrder[key])) {
    //                 initialValues[key] = response.data.workOrder[key][0]; // Set the first entry of the array as the default value
    //             } else {
    //                 initialValues[key] = response.data.workOrder[key]; // Set the value directly if it's not an array
    //             }
    //         }
    //
    //         console.log(initialValues, "The initial values is   ")
    //
    //         setWorkOrderResponse(response.data.workOrder);
    //         setWorkOrderValues(initialValues);
    //     }
    //     //handleFetch()
    // }, [])

    return (
        <>
            <div className='fixed inset-0 flex justify-center items-center z-[15] bg-[#2e2b2b40] backdrop-blur-sm'>
                <div className='relative w-full max-w-[600px] bg-white rounded-md'>
                    {/* Close button */}
                    <button className="absolute top-2 right-2 text-black text-[18px] font-bold"
                            onClick={() => setWorkOrderModalShowing(false)}>
                        &times;
                    </button>
                    {/* ParentModal Content */}
                    <CreateWorkOrder
                        setWorkOrderModalShowing={setWorkOrderModalShowing}
                        routingMatrix={routingMatrix}
                        createWO={createWO}
                    />
                </div>
            </div>


        </>
    )
}

export default WorkOrderModal