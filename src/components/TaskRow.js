import {differenceBetweenTwoTimeStamp} from "../utils/DateTimeHelper";
import {useState} from "react";

const TaskRow = ({task, onCheck, index}) => {
    const [taskCompletionComment, setTaskCompletionComment] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <tr key={index} className={`${index % 2 === 1 ? 'bg-[#F7F9FF] text-[] border-y' : 'border-t'}`}>
            <td className=" whitespace-nowrap px-[10px] p-[8px] font-medium text-xs">{task.railcar_id}</td>
            <td className=" whitespace-nowrap p-[5px]  font-medium text-xs">{task.task_description}</td>
            <td className=" whitespace-nowrap p-[5px] flex justify-center  font-medium text-xs">{differenceBetweenTwoTimeStamp(new Date().toISOString().slice(0, 19), task.start_time)["days"]}</td>
            <td className="text-center">
                <input
                    type="checkbox"
                    onChange={() => onCheck(task)}
                    checked={false}
                    className=" checkbox checkbox-primary w-3 h-3"/>
            </td>
        </tr>
    )
}
export default TaskRow