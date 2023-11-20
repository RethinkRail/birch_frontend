import React, {useEffect, useState} from "react";
import axios from "axios";
import {differenceBetweenTwoTimeStamp} from "../utils/DateTimeHelper";
import TaskRow from "../components/TaskRow";
import ActiveOrdersTable from "../components/ActiveOrdersTable";
import WorkOrderDataTable from "../components/WorkOrderDataTable";
const Home = () =>{
    const [workOrders, setWorkOrders] = useState([]);
    const [activeTasks,setActiveTask] = useState([])
    const [statusCodes,setStatusCodes] = useState([])
    const getActiveTasks =() =>{
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: process.env.REACT_APP_BIRCH_API_URL+'get_active_tasks_by_user?user_id='+JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["id"],
            headers: { }
        };

        axios.request(config)
            .then((response) => {
                //console.log(JSON.stringify(response.data));
                setActiveTask(response.data);
            })
            .catch((error) => {
                console.log(error);
            });

    }
    const getActiveWorkOrders = () =>{
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: process.env.REACT_APP_BIRCH_API_URL+'get_active_workorder',
            headers: { }
        };

        axios.request(config)
            .then((response) => {
                console.log("All workorder is completed")
                setWorkOrders(response.data)
            })
            .catch((error) => {
                console.log(error);
            });

    }
    const getAllStatusCode = () =>{
        if(statusCodes.length==0){
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: process.env.REACT_APP_BIRCH_API_URL+'get_all_status',
                headers: { }
            };

            return axios.request(config)
                .then((response) => {
                    console.log("Getting all status codes is completed");
                    setStatusCodes(response.data)
                    return Promise.resolve();
                })
                .catch((error) => {
                    console.log(error);
                    return Promise.resolve();
                });
        }else {

            return Promise.resolve()
        }
    }
    const handleMarkTaskAsComplete =(task_id) =>{
        console.log(task_id)
    }
    const updateWorkUpdates =(work_id,status_id,status_text) =>{

    }
    const handleChangeMaterialETA = (work_id,date) =>{
        console.log(date.toISOString())
        console.log(work_id)
    }
    const handleChangePOD= (work_id,date) =>{

    }
    const handleMarkedFinalized= (work_id) =>{

    }
    const handleMarkedShipped= (work_id) =>{

    }
    useEffect(() => {
        getActiveTasks();
    }, []);
    useEffect(() => {
        //getAllStatusCode()
        getAllStatusCode()
            .then(() => {
                getActiveWorkOrders();
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }, []);
    return(
        <React.Fragment>
            {activeTasks.length>0 ? (
                <div className="lg:px-[40PX] font-inter md:px-2 sm:p-2 ">
                    <h2 className="text-[18px] font-semibold mt-[13px]">Your Tasks</h2>
                    <div className="overflow-x-auto w-full mt-[8px] mx-auto border rounded-[8px]">
                        <table className="  mx-auto   w-full font-inter bg-white  text-[#686868] font-semibold">
                            <thead className="uppercase text-[12px]  ">
                                <tr className='px-6'>
                                    <th className="bg-[#DCE5FF] px-[10px] py-2 w-[360px] text-left  h-[24px]  whitespace-nowrap rounded-l ">CAR NUMBER</th>
                                    <th className="bg-[#DCE5FF] px-[5px] w-[383px] text-left  h-[24px] whitespace-nowrap   ">TASK</th>
                                    <th className="bg-[#DCE5FF] px-[14px] w-[308px] justify-center h-[24px] whitespace-nowrap  ">ACTIVE FOR DAY(S)</th>
                                    <th className="bg-[#DCE5FF] px-[14px] w-[308px] text-center h-[24px] whitespace-nowrap   rounded-r ">MARK AS COMPLETE</th>
                                </tr>
                            </thead>
                            <tbody className="text-[13.7px] font-medium">
                            {activeTasks.map((task, index) => (
                                <TaskRow
                                    task={task}
                                    onCheck={handleMarkTaskAsComplete}
                                    index={index}
                                />
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : null}
            <div className="lg:px-[40PX] font-inter md:px-2 sm:p-2 ">
                {workOrders.length>0 && statusCodes.length>0?(
                    <WorkOrderDataTable
                        workOrders={workOrders}
                        statusCode ={statusCodes}
                        updateWorkUpdates={updateWorkUpdates}
                        updateMaterialETA={handleChangeMaterialETA}
                        updatePOD={handleChangePOD}
                        updateMarkAsFinalized={handleMarkedFinalized}
                        updateMarkAsShipped={handleMarkedShipped}
                    />
                ):null}
            </div>
        </React.Fragment>
    )
}

export default Home