import { useState } from "react";

const TaskTable = ({ tasks,onCheccked }) => {
    const [modifyedTasks, setModifyedTasks] = useState(tasks)  //modifyedTasks will save modifyed list after changing checkbox
    const handleTaskCheckboxChange = (index) => {
        const updatedTasks = [...modifyedTasks];
        updatedTasks[index].checked = !updatedTasks[index].checked;
        setModifyedTasks(updatedTasks);
    };

    return (
        <div className="overflow-x-auto w-full mt-[26px] mx-auto border rounded-[8px]">
            <table className="  mx-auto   w-full font-inter bg-white  text-[#686868] font-semibold">
                <thead className="uppercase text-[12px]  ">
                    <tr>
                        <th className="bg-[#DCE5FF] px-[24px] w-[360px] text-left  h-[46px]  whitespace-nowrap rounded-l ">Car Number</th>
                        <th className="bg-[#DCE5FF] px-[24px] w-[383px] text-left  h-[46px] whitespace-nowrap   ">Task</th>
                        <th className="bg-[#DCE5FF] px-[24px] w-[308px] text-left  h-[46px] whitespace-nowrap  ">Time Duration</th>
                        <th className="bg-[#DCE5FF] px-[24px] w-[308px] text-center h-[46px] whitespace-nowrap   rounded-r ">MARK AS COMPLETE</th>
                    </tr>
                </thead>
                <tbody className="text-[13.7px] font-medium   ">
                    {modifyedTasks.map((task, index) => (
                        <tr key={index} className={` h-[71px] ${index % 2 === 1 ? 'bg-[#F7F9FF] text-[] border-y' : 'border-t'}`}>
                            <td className=" whitespace-nowrap p-[16px]  ">{task.CAR_NUMBER}</td>
                            <td className=" whitespace-nowrap p-[16px]  ">{task.TASK}</td>
                            <td className=" whitespace-nowrap p-[16px]  ">{task.TIME_DURATION}</td>
                            <td className="  text-center">
                                <input
                                    type="checkbox"
                                    onChange={() => handleTaskCheckboxChange(index)}
                                    checked={task.checked}
                                    className=" checkbox checkbox-primary w-5 h-5" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TaskTable;