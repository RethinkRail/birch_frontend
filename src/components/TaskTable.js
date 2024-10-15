/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 8/13/2024, Tuesday
 * Description:
 **/

import React, { useEffect, useState } from 'react';
import axios from 'axios'; // assuming you use axios for fetching data

const TaskTable = ({work_id}) => {
    const [tasks, setTasks] = useState([]);
    console.log(work_id)
    useEffect(() => {
        // Fetch the data from the web service
        const fetchData = async () => {
            try {
                const response = await axios.get(process.env.REACT_APP_BIRCH_API_URL+`get_all_task_by_work_id/`, {
                    params: {
                        work_id: work_id, // Pass the work_id dynamically
                    },
                });
                console.log(response)
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

                setTasks(mergedTasks);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    // Handle checkbox click
    const handleCheckboxClick = (isChecked, workId, routingCode) => {
        console.log(`Checkbox clicked: ${isChecked ? 'Checked' : 'Unchecked'}, Work ID: ${workId}, Routing Code: ${routingCode}`);
        // Handle further logic for checkbox click event
    };

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
                        Work ID
                    </th>
                    <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Routing Code
                    </th>
                    <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task Name
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
                                onChange={(e) => handleCheckboxClick(e.target.checked, task.work_id, task.routing_code)}
                                disabled={task.task_status === 1} // Disable checkbox if status is 1 (In Progress)
                            />
                        </td>
                        <td className="px-6 py-2 text-sm font-medium text-gray-900">{task.work_id}</td>
                        <td className="px-6 py-2 text-sm text-gray-500">{task.routing_code}</td>
                        <td className="px-6 py-2 text-sm text-gray-500">{task.task_name}</td>
                        <td className="px-6 py-2 text-sm text-gray-500">{task.statusText}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
        </div>
    );
};

export default TaskTable;
