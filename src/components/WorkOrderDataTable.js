import React, {useState} from "react";
import {round2Dec} from "../utils/NumberHelper";
import {convertSqlToFormattedDate, differenceBetweenTwoTimeStamp} from "../utils/DateTimeHelper";
import {element} from "prop-types";

const WorkOrderDataTable =(workOrders,statusCode) =>{
    const [commentObject, setCommentObject] = useState([])
    const [modifiedWorkOrder, setModifiedWorkOrder] = useState([])
    const workOrderData = [];
    workOrders.forEach(workOrder =>{
        const laborHours = workOrder.joblist.reduce((acc, item) => acc + item.labor_time * item.quantity, 0);
        const durationHours = workOrder.timesheets.reduce((acc, item) => acc + item.duration / 3600, 0);
        const percentage = durationHours === 0 ? 0 : (durationHours / laborHours) * 100;
        const workOrderObject ={
            'lhr':round2Dec(percentage)+"%",
            'dif':differenceBetweenTwoTimeStamp(new Date().toISOString().slice(0, 19),workOrder.arrival_date)["days"],
            'railcar_id':workOrder.railcar_id,
            'arrival_date':convertSqlToFormattedDate(workOrder.arrival_date),
            'last_content': workOrder.railcar.products.name,
            'status':workOrder.workupdates[0].status_id,
            'comment':workOrder.workupdates,
            'material_eta':convertSqlToFormattedDate(workOrder.material_eta),
            'projected_out_date': convertSqlToFormattedDate(workOrder.projected_out_date),
            'finalized':workOrder.locked_by,
            'shipped':workOrder.shipped_date,
            'work_id':workOrder.id
        }
        workOrderData.push(workOrderObject)
    })
    setModifiedWorkOrder(workOrderData)
    const workOrdersTableColumn = [
        {
            name: "LHR",
            selector: "lhr"
        },
        {
            name: "DIF",
            selector: "dif"
        },
        {
            name: "CAR",
            selector: "railcar_id"
        },
        {
            name: "ARR. DATE",
            selector: "arrival_date"
        },
        {
            name: "LAST CONTENT",
            selector: "last_content"
        },
        {
            name: "STATUS",
            selector: "status",
            cell: (row) => (
                <select className="text-[14px] font-mediumselect bg-transparent pl-[0px] border-0 max-w-[213px] focus:border-0 focus:ring-0">
                    {statusCode.map((sc) => (
                        <option key={sc.code} selected={row.status === sc.code}>
                            {sc.code + ":" + sc.title}
                        </option>
                    ))}
                </select>
            )
        },
        {
            name: "COMMENT",
            selector: "comment",
            cell: (row) => (
               <span onClick={()=>{
                   document.getElementById('commentModal').showModal()
                   setCommentObject(row.comment)
               }
               }>{row.comment[0]}</span>
            )
        },
        {
            name: "MATERIAL ETA",
            selector: "material_eta",
        },
        {
            name: "PROJECTED OUT DATE",
            selector: "projected_out_date",
        },
        {
            name: "FINALIZED",
            selector: "finalized",

        },
        {
            name: "SHIPPED",
            selector: "shipped",
        },
        {
            name: "ACTION",
            selector: 'work_id',
            width:"110px",
            sortable: false,
            padding:"0px",
            cell: (row) => (
                <p></p>
            ),
        },
    ];
}

export default WorkOrderDataTable