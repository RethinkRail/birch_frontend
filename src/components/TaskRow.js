import {differenceBetweenTwoTimeStamp} from "../utils/DateTimeHelper";

const TaskRow = ({task,onCheck,index}) =>{
    return(
        <tr key={index} className={` h-[71px] ${index % 2 === 1 ? 'bg-[#F7F9FF] text-[] border-y' : 'border-t'}`}>
            <td className=" whitespace-nowrap p-[24px]  ">{task.railcar_id}</td>
            <td className=" whitespace-nowrap p-[24px]  ">{task.task_description}</td>
            <td className=" whitespace-nowrap p-[24px]  ">{differenceBetweenTwoTimeStamp(new Date().toISOString().slice(0, 19),task.start_time)["days"]}</td>
            <td className="  text-center">
                <input
                    type="checkbox"
                    onChange={() => onCheck(task.id)}
                    className=" checkbox checkbox-primary w-5 h-5" />
            </td>
        </tr>
    )
}
export default TaskRow