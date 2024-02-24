import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import TaskRow from "../components/TaskRow";
import WorkOrderDataTable from "../components/WorkOrderDataTable";
import {showToastMessage, updateObjectByIdInsideArray} from "../utils/CommonHelper";
import Modal from "react-modal";
import {toast} from "react-toastify";


const qs = require('qs');
const Home = () =>{
    const [workOrders, setWorkOrders] = useState([]);
    const [activeTasks,setActiveTask] = useState([])
    const [statusCodes,setStatusCodes] = useState([])
    const [commonData,setCommonData] = useState(null)
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [completingTask,setcompletingTask]= useState(null)
    const routingStatusTextArea = useRef(null);
    const toastId = useRef(null)
    const getActiveTasks =() =>{
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: process.env.REACT_APP_BIRCH_API_URL+'get_active_tasks_by_user?user_id='+JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["id"],
            headers: { }
        };

        axios.request(config)
            .then((response) => {
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
                console.log(response.data)
                setWorkOrders(response.data.active_workorder)

                return Promise.resolve();
            })
            .catch((error) => {
                console.log(error);
     
                return Promise.resolve();
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
    const getAllCommonData =() =>{
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: process.env.REACT_APP_BIRCH_API_URL+'get_all_common_data',
                headers: { }
            };

            axios.request(config)
                .then((response) => {
                    setCommonData(response.data)
                    toast.update(toastId.current, {
                        render: "All data loaded",
                        autoClose: 1000,
                        type: "success",
                        hideProgressBar: true,
                        isLoading: false
                    });
                    return Promise.resolve();
                })
                .catch((error) => {
                    console.log(error);
                    return Promise.resolve();
                });
    }
    const handleMarkTaskAsComplete =(task) =>{
        setcompletingTask(task)
        setIsCommentModalOpen(true)
    }
    const updateWorkUpdates =(work_id,statusObject,statusCode) =>{
        const workOrder = workOrders.find(workOrder => workOrder.id === work_id);
        if (workOrder) {
            const workupdates = workOrder.workupdates;
            console.log(workupdates);
            const newWorkUpdate = {
                "status_id":statusObject["status_id"],
                "update_date":statusObject["update_date"],
                "comment":statusObject["comment"],
                "user":{
                    "name":JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['name'],
                    "id":JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id']
                },
                "statuscode":{
                    "title":statusCode
                }
            }
            workupdates.unshift(newWorkUpdate)
            const updatedWorkOrders =updateObjectByIdInsideArray(workOrders,'id',work_id,{workupdates:workupdates})
            setWorkOrders(updatedWorkOrders)
        }
    }
    const handleChangeArrivalDate = (work_id,date) =>{
        console.log(date)
        let data = qs.stringify({
            'arrival_date': date? date.toISOString():null,
            'workorder_id': work_id,
            'user_id': JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id']
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.REACT_APP_BIRCH_API_URL+ 'update_arrival_date',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data
        };

        axios.request(config)
            .then((response) => {
                const updatedWorkOrders = updateObjectByIdInsideArray(workOrders,'id',work_id,{arrival_date:response.data})
                setWorkOrders(updatedWorkOrders)
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleInspectedlDate = (work_id,date) =>{
        let data = qs.stringify({
            'inspected_date': date? date.toISOString():null,
            'workorder_id': work_id,
            'user_id': JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id']
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.REACT_APP_BIRCH_API_URL+ 'update_inspection_date',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data
        };

        axios.request(config)
            .then((response) => {
                console.log("inspection"+response)
                console.log("inspection"+response.data)
                const updatedWorkOrders = updateObjectByIdInsideArray(workOrders,'id',work_id,{inspected_date:response.data})
                setWorkOrders(updatedWorkOrders)
            })
            .catch((error) => {
                console.log(error);
            });
    }
    const handleChangeCleanDate = (work_id,date) =>{
        let data = qs.stringify({
            'clean_date': date? date.toISOString():null,
            'workorder_id': work_id,
            'user_id': JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id']
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.REACT_APP_BIRCH_API_URL+ 'update_clean_date',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data
        };

        axios.request(config)
            .then((response) => {
                const updatedWorkOrders = updateObjectByIdInsideArray(workOrders,'id',work_id,{clean_date:response.data})
                setWorkOrders(updatedWorkOrders)
            })
            .catch((error) => {
                console.log(error);
            });
    }
    const handleChangeRepairScheduleDate = (work_id,date) =>{
        let data = qs.stringify({
            'repair_schedule_date': date? date.toISOString():null,
            'workorder_id': work_id,
            'user_id': JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id']
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.REACT_APP_BIRCH_API_URL+ 'update_repair_schedule_date',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data
        };

        axios.request(config)
            .then((response) => {
                const updatedWorkOrders = updateObjectByIdInsideArray(workOrders,'id',work_id,{repair_schedule_date:response.data})
                setWorkOrders(updatedWorkOrders)
            })
            .catch((error) => {
                console.log(error);
            });
    }
    const handleChangePaintDate = (work_id,date) =>{
        let data = qs.stringify({
            'paint_date': date? date.toISOString():null,
            'workorder_id': work_id,
            'user_id': JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id']
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.REACT_APP_BIRCH_API_URL+ 'update_paint_date',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data
        };

        axios.request(config)
            .then((response) => {
                const updatedWorkOrders = updateObjectByIdInsideArray(workOrders,'id',work_id,{paint_date:response.data})
                setWorkOrders(updatedWorkOrders)
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleRepairDate = (work_id,date) =>{
        let data = qs.stringify({
            'repair_date': date? date.toISOString():null,
            'workorder_id': work_id,
            'user_id': JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id']
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.REACT_APP_BIRCH_API_URL+ 'update_repair_date',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data
        };

        axios.request(config)
            .then((response) => {
                const updatedWorkOrders = updateObjectByIdInsideArray(workOrders,'id',work_id,{repair_date:response.data})
                setWorkOrders(updatedWorkOrders)
            })
            .catch((error) => {
                console.log(error);
            });
    }
    const handleFinalDate = (work_id,date) =>{
        let data = qs.stringify({
            'final_date': date? date.toISOString():null,
            'workorder_id': work_id,
            'user_id': JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id']
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.REACT_APP_BIRCH_API_URL+ 'update_repair_date',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data
        };

        axios.request(config)
            .then((response) => {
                const updatedWorkOrders = updateObjectByIdInsideArray(workOrders,'id',work_id,{final_date:response.data})
                setWorkOrders(updatedWorkOrders)
            })
            .catch((error) => {
                console.log(error);
            });
    }
    const handleQADate = (work_id,date) =>{
        let data = qs.stringify({
            'qa_date': date? date.toISOString():null,
            'workorder_id': work_id,
            'user_id': JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id']
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.REACT_APP_BIRCH_API_URL+ 'update_qa_date',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data
        };

        axios.request(config)
            .then((response) => {
                const updatedWorkOrders = updateObjectByIdInsideArray(workOrders,'id',work_id,{qa_date:response.data})
                setWorkOrders(updatedWorkOrders)
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleMTI = (work_id,date) =>{
        let data = qs.stringify({
            'month_to_invoice': date? date.toISOString():null,
            'workorder_id': work_id,
            'user_id': JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id']
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.REACT_APP_BIRCH_API_URL+ 'update_mti',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data
        };

        axios.request(config)
            .then((response) => {
                const updatedWorkOrders = updateObjectByIdInsideArray(workOrders,'id',work_id,{month_to_invoice:response.data})
                setWorkOrders(updatedWorkOrders)
            })
            .catch((error) => {
                console.log(error);
            });
    }
    const handleChangeMaterialETA = (work_id,date) =>{
        console.log(date)
        let data = qs.stringify({
            'updated_date': date? date.toISOString():null,
            'workorder_id': work_id,
            'user_id': JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id']
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.REACT_APP_BIRCH_API_URL+ 'update_material_eta',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data
        };

        axios.request(config)
            .then((response) => {
                const updatedWorkOrders = updateObjectByIdInsideArray(workOrders,'id',work_id,{material_eta:response.data})
                setWorkOrders(updatedWorkOrders)
            })
            .catch((error) => {
                console.log(error);
            });
    }
    const handleChangePOD= (work_id,date) =>{
        let data = qs.stringify({
            'projected_out_date': date? date.toISOString():null,
            'workorder_id': work_id,
            'user_id': JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id']
        });
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.REACT_APP_BIRCH_API_URL+'update_pod',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data
        };

        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
                const updatedWorkOrders =updateObjectByIdInsideArray(workOrders,'id',work_id,{projected_out_date:response.data})
                setWorkOrders(updatedWorkOrders)
            })
            .catch((error) => {
                console.log(error);
            });
    }
    const handleMarkedFinalized= (work_id,is_checked) =>{
        const userId = JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id']
        let data = qs.stringify({
            'workorder_id': work_id,
            'user_id':is_checked?userId:null
        });
        let config = {
            method: 'post',
            url: process.env.REACT_APP_BIRCH_API_URL+'mark_as_finalized',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data
        };
        axios.request(config)
            .then((response) => {
                const updatedWorkOrders =updateObjectByIdInsideArray(workOrders,'id',work_id,{locked_by:is_checked?userId:null})
                setWorkOrders(updatedWorkOrders)
            })
            .catch((error) => {
                console.log(error);
            });
    }
    const handleMarkedShipped= (work_id,date) =>{
        let data = qs.stringify({
            'updated_date': date? date.toISOString():null,
            'workorder_id': work_id,
            'user_id': JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id'],
        });
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.REACT_APP_BIRCH_API_URL+'update_shipped_date',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data
        };

        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
                const updatedWorkOrders =updateObjectByIdInsideArray(workOrders,'id',work_id,{shipped_date:response.data})
                setWorkOrders(updatedWorkOrders)
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleUpdateReasonToCome= (work_id,reasonToCome) =>{
        console.log(work_id)
        console.log(reasonToCome)
        let data = qs.stringify({
            'reason_to_come': reasonToCome,
            'workorder_id': work_id,
            'user_id': JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id'],
        });
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.REACT_APP_BIRCH_API_URL+'update_reason_to_come',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data
        };

        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
                const updatedWorkOrders =updateObjectByIdInsideArray(workOrders,'id',work_id,{reason_to_come:response.data})
                setWorkOrders(updatedWorkOrders)
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const customStylesForCommentModal = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            width:'400px',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
        },
    };
    const submitTaskUpdate = () => {
        // On closing comment modal updating everything
        if(getValueById("statusUpdateMessage").length<1){
            return
        }
        let data = qs.stringify({
            'routing_step_code': completingTask["routing_code"],
            'work_id': completingTask["work_id"],
            'routing_matrix_id': completingTask["rm_id"],
            'user_id': JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["id"],
            'task_comment': getValueById("statusUpdateMessage"),
            'brc_status_code': completingTask["brc_code"]
        });
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.REACT_APP_BIRCH_API_URL+'mark_task_as_complete',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data
        };
        axios.request(config)
            .then((response) => {
                updateWorkUpdates(response.data["work_id"],response.data,completingTask["task_description"])
                //setActiveTask(removeObjectByProperty(activeTasks,"id",completingTask["id"]))
                console.log(response.data);
                setcompletingTask(null)
                setIsCommentModalOpen(false)
                getActiveTasks()
                showToastMessage("Task updated successful",1)
            })
            .catch((error) => {
                console.log(error);
                setcompletingTask(null)
                setIsCommentModalOpen(false)
            });
    };

    const cancelTaskUpdate =() =>{
        setcompletingTask(null)
        setIsCommentModalOpen(false)
    }

    const getValueById = (id) => {
        const element = routingStatusTextArea.current;
        if (element && element.id === id) {
            return element.value;
        }
        return null;
    };

    useEffect(() => {
        getActiveTasks();
    }, []);
    useEffect(() => {
        //getAllStatusCode()
        toastId.current = toast.loading("Loading...")
        getAllStatusCode()
            .then(() => getActiveWorkOrders())
            .then(() => getAllCommonData())
            .catch((error) => {
                // Handle any errors that occur during the sequence
                console.error("Error during sequential execution:", error);
            });
    }, []);

    return(
        <React.Fragment>
            {activeTasks.length>0 ? (
                <div className="font-inter ">
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
            <div className="font-inter">
                {workOrders.length>0 && statusCodes.length>0  && commonData?(
                    <WorkOrderDataTable
                        workOrders={workOrders}
                        statusCode ={statusCodes}
                        commonData = {commonData}
                        updateWorkUpdates={updateWorkUpdates}
                        updateArrivalDate={handleChangeArrivalDate}
                        updateInspectedDate={handleInspectedlDate}
                        updateCleanDate={handleChangeCleanDate}
                        updateRepairScheduleDate={handleChangeRepairScheduleDate}
                        updatePaintDate={handleChangePaintDate}
                        updateRepairDate={handleRepairDate}
                        updateFinalDate={handleFinalDate}
                        updateQADate={handleQADate}
                        updateMaterialETA={handleChangeMaterialETA}
                        updateMTI={handleMTI}
                        updatePOD={handleChangePOD}
                        updateMarkAsFinalized={handleMarkedFinalized}
                        updateMarkAsShipped={handleMarkedShipped}
                        updateReasonToCome={handleUpdateReasonToCome}
                    />
                ):null}
            </div>
            <Modal
                isOpen={isCommentModalOpen}
                contentLabel="POST COMMENT"
                style={customStylesForCommentModal}
            >
                    <textarea id="statusUpdateMessage" rows="2"  ref={routingStatusTextArea}
                              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 my-4"
                              placeholder="Write your comments here..."></textarea>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={submitTaskUpdate}>SUBMIT</button>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2" onClick={cancelTaskUpdate}>CANCEL</button>
            </Modal>
        </React.Fragment>
    )
}

export default Home