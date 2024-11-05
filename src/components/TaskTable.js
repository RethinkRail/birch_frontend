/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 8/13/2024, Tuesday
 * Description:
 **/

import React, { useEffect, useState } from 'react';
import axios from 'axios'; // assuming you use axios for fetching data

const TaskTable = ({work_id,workOrder}) => {
    const [tasks, setTasks] = useState([]);
    //console.log(work_id)
    const fetchData = async () => {
        try {
            const response = await axios.get(process.env.REACT_APP_BIRCH_API_URL+`get_all_task_by_work_id/`, {
                params: {
                    work_id: work_id, // Pass the work_id dynamically
                },
            });
            //console.log(response)
            const data = response.data;

            // Modify data according to task_status
            const mergedTasks = data.reduce((acc, currentTask) => {
                const existingTaskIndex = acc.findIndex(
                    task => task.routing_code === currentTask.routing_code
                );

                if (existingTaskIndex !== -1) {
                    // If the routing_code already exists, merge the assignees
                    acc[existingTaskIndex].user_routing_matrix_task_assignment_assigneeTouser = [
                        ...acc[existingTaskIndex].user_routing_matrix_task_assignment_assigneeTouser,
                        currentTask.user_routing_matrix_task_assignment_assigneeTouser,
                    ];
                } else {
                    // Otherwise, create a new entry with assignee as an array
                    acc.push({
                        ...currentTask,
                        user_routing_matrix_task_assignment_assigneeTouser: [
                            currentTask.user_routing_matrix_task_assignment_assigneeTouser,
                        ],
                    });
                }

                return acc;
            }, []);
            console.log(mergedTasks)
            setTasks(mergedTasks);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    useEffect(() => {
        // Fetch the data from the web service


        fetchData();
    }, [work_id]);

    // Handle checkbox click
    const handleCheckboxClick = async (isChecked, workId, routingCode,brc_code) => {
        if (routingCode > getLastCompletedRoutingCode(tasks)) {
            console.log("forward")
            try {
                const response = await axios.post(
                    process.env.REACT_APP_BIRCH_API_URL + `forward_routing/`,
                    {
                        user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["id"],
                        routing_code:parseInt(routingCode),
                        work_id:work_id

                    }
                );
                console.log('Response:', response.data);
                fetchData()
                return response.data;
            } catch (error) {
                console.error('Error calling forwardRouting:', error.response?.data || error.message);
                throw error;
            }
        } else {
            console.log("backward")
            try {
                const response = await axios.post(
                    process.env.REACT_APP_BIRCH_API_URL + `reverse_routing/`,
                    {
                        user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["id"],
                        routing_code:routingCode,
                        work_id:work_id,
                        brc_code:brc_code

                    }
                );
                console.log('Response:', response.data);
                fetchData()
                return response.data;
            } catch (error) {
                console.error('Error calling forwardRouting:', error.response?.data || error.message);
                throw error;
            }
        }

    };

    function getLastCompletedRoutingCode(tasks) {
        // Filter tasks with task_status = 2 (completed)
        const completedTasks = tasks.filter(task => task.task_status === 2);

        // If no completed tasks, return 0
        if (completedTasks.length === 0) {
            return 0;
        }

        // Sort completed tasks by end_time in descending order
        completedTasks.sort((a, b) => new Date(b.end_time) - new Date(a.end_time));

        // Return the routing_code of the most recent completed task
        return completedTasks[0].routing_code;
    }

    return (
        <div>
            <div className="flex justify-between mb-5 items-center ">
                <h6 className='font-semibold'>Task List</h6>
            </div>
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Select
                    </th>

                    <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Routing Code
                    </th>
                    <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        TASK description
                    </th>
                    <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Assignee
                    </th>
                    <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Time
                    </th>
                    <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task Status
                    </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map(task => (
                    <tr
                        key={task.work_id}
                        className={`${
                            task.task_status === 1 ? 'bg-yellow-100' : ''
                        }`}
                    >
                        <td className="px-4 py-2">
                            <input
                                type="checkbox"
                                checked={task.task_status === 2}
                                onChange={(e) => handleCheckboxClick(e.target.checked, task.work_id, task.routing_code,task.brc_code)}
                                disabled={workOrder.locaked_by != null} // Disable checkbox if status is 1 (In Progress)
                            />
                        </td>
                        <td className="px-6 py-2 text-sm font-medium text-gray-900">{task.routing_code}</td>
                        <td className="px-6 py-2 text-sm text-gray-500">{task.task_description}</td>
                        <td className="px-6 py-2 text-sm text-gray-500">{task.user_routing_matrix_task_assignment_assigneeTouser.map(item => item.name).join('/')}</td>
                        <td className="px-6 py-2 text-sm text-gray-500">{new Date(task.start_time).toLocaleString()}</td>
                        <td className="px-6 py-2 text-sm text-gray-500">{task.user_routing_matrix_task_assignment_completed_byTouser!=null?
                           "Cpmpleted by "+  task.user_routing_matrix_task_assignment_completed_byTouser.name+' at \n'+new Date(task.end_time).toLocaleString():''}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
        </div>
    );
};

export default TaskTable;
