import React, {useEffect, useState} from "react";
import {round2Dec} from "../utils/NumberHelper";
import {convertSqlToFormattedDate, differenceBetweenTwoTimeStamp} from "../utils/DateTimeHelper";
import DatePicker from "react-datepicker";
import DataTable from "react-data-table-component";

const WorkOrderDataTable = ({workOrders, statusCode}) => {
    const [commentObject, setCommentObject] = useState([])
    const [modifiedWorkOrder, setModifiedWorkOrder] = useState([])
    const workOrderData = [];
    workOrders.forEach(workOrder => {
        const laborHours = workOrder.joblist.reduce((acc, item) => acc + item.labor_time * item.quantity, 0);
        const durationHours = workOrder.timesheets.reduce((acc, item) => acc + item.duration / 3600, 0);
        const percentage = durationHours == 0 ? 0 : (durationHours / laborHours) * 100;
        const workOrderObject = {
            'lhr': round2Dec(percentage) + "%",
            'dif': differenceBetweenTwoTimeStamp(new Date().toISOString().slice(0, 19), workOrder.arrival_date)["days"],
            'railcar_id': workOrder.railcar_id,
            'arrival_date': convertSqlToFormattedDate(workOrder.arrival_date),
            'last_content': workOrder.railcar.products.name,
            'status': workOrder.workupdates[0].status_id,
            'comment': workOrder.workupdates,
            'material_eta': convertSqlToFormattedDate(workOrder.material_eta),
            'projected_out_date': convertSqlToFormattedDate(workOrder.projected_out_date),
            'finalized': workOrder.locked_by,
            'shipped': workOrder.shipped_date,
            'work_id': workOrder.id
        }
        console.log(workOrderObject)
        workOrderData.push(workOrderObject)
    })


    useEffect(() => {
        setModifiedWorkOrder(workOrderData)
    }, [])
    //setModifiedWorkOrder(workOrderData)
    const workOrdersTableColumn = [
        {
            name: "LHR",
            selector: "lhr",
            sortable: true,
            width: "10%"
        },
        {
            name: "DIF",
            selector: "dif",
            sortable: true
        },
        {
            name: "CAR",
            selector: "railcar_id",
            sortable: true
        },
        {
            name: "ARR. DATE",
            selector: "arrival_date",
            sortable: true
        },
        {
            name: "LAST CONTENT",
            selector: "last_content",
            sortable: true
        },
        {
            name: "STATUS",
            selector: "status",
            cell: (row) => (
                <select
                    className="text-[14px] font-mediumselect bg-transparent pl-[0px] border-0 max-w-[213px] focus:border-0 focus:ring-0">
                    {statusCode.map((sc) => (
                        <option key={sc.code} selected={row.status === sc.code}>
                            {sc.code + ":" + sc.title}
                        </option>
                    ))}
                </select>
            ),
            sortable: true
        },
        {
            name: "COMMENT",
            selector: "comment",
            cell: (row) => (
                <p>{row.comment[0].comment}</p>
            ),
            sortable: true
        },
        {
            name: "MATERIAL ETA",
            selector: "material_eta",
            cell: (row) => (
                <DatePicker
                    // selected={projected_out_date[index]}
                    selected={new Date(row.projected_out_date.slice(0, 10))}
                    showYearDropdown
                    dateFormat="dd/MM/yyyy"
                />
            ),
            sortable: true
        },
        {
            name: "PROJECTED OUT DATE",
            selector: "projected_out_date",
            cell: (row) => (
                <DatePicker
                    // selected={projected_out_date[index]}
                    selected={new Date(row.projected_out_date.slice(0, 10))}
                    showYearDropdown
                    dateFormat="dd/MM/yyyy"
                />
            ),
            sortable: true
        },
        {
            name: "FINALIZED",
            selector: "finalized",
            cell: (row) => (
                <input
                    type="checkbox"
                    // onChange={() => handleOrderCheckboxChange(index, "FINALIZED")}
                    checked={row.locked_by > -1}
                    className=" checkbox checkbox-primary mt-[6px] ml-[29px] w-[20px] h-[20px]"/>
            )

        },
        {
            name: "SHIPPED",
            selector: "shipped",
            cell: (row) => (
                <input
                    type="checkbox"
                    // onChange={() => handleOrderCheckboxChange(index, "FINALIZED")}
                    checked={row.locked_by > -1}
                    className=" checkbox checkbox-primary mt-[6px] ml-[29px] w-[20px] h-[20px]"/>
            )
        },
        {
            name: "ACTION",
            selector: 'work_id',
            width: "110px",
            sortable: false,
            padding: "0px",
            cell: (row) => (
                <p></p>
            ),
        },
    ];
    const workWorderTableOptions = {
        headerStyle: {
            backgroundColor: '#a11a1a', // Set the background color of the header row
        },
        header: {
            fontSize: '16px', // Set the font size of the header cells
            fontWeight: 'bold', // Set the font weight of the header cells
            color: '#333', // Set the text color of the header cells
            borderBottom: '2px solid #ddd', // Add a bottom border to the header cells
        },
    };

    const customHeadRow = {
        style: {
            backgroundColor: 'red',
            color: 'white',
            className: 'sss'
        },
    };
    const customHeader = (column) => {
        return <div className="custom-header">{column.name}</div>;
    };

    const customStyles = {
        table: {
            className: 'sssss'
        },
        headRow: {
            style: {
                backgroundColor: 'lightblue', // customize the background color of the header row
            },
            className: 'custom-header-class', // apply a custom class name to the header row
        },
    };
    return (
        <div className="overflow-x-auto w-full mt-[20px] ml-[-1px] mx-auto border rounded-[8px]">
            {modifiedWorkOrder.length > 0 ? (
                <DataTable
                    columns={workOrdersTableColumn}
                    data={modifiedWorkOrder}
                    customStyles={customStyles}
                    options={workWorderTableOptions}
                />
            ) : null}

        </div>
        //<CommentModal data={commentObject} />
    )
}

export default WorkOrderDataTable