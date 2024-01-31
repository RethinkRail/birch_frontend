import React, {useEffect, useRef, useState} from "react";
import {round2Dec} from "../utils/NumberHelper";
import {convertSqlToFormattedDate, differenceBetweenTwoTimeStamp} from "../utils/DateTimeHelper";
import DatePicker from "react-datepicker";
import $ from 'jquery';
import CommentModal from "./CommentModal";
import {NavLink} from "react-router-dom";
import 'datatables.net';

const WorkOrderDataTable =({workOrders,statusCode}) =>{
    const [commentObject, setCommentObject] = useState([])
    const [modifiedWorkOrder, setModifiedWorkOrder] = useState([])
    const workOrderData = [];
    workOrders.forEach(workOrder =>{
        const laborHours = workOrder.joblist.reduce((acc, item) => acc + item.labor_time * item.quantity, 0);
        const durationHours = workOrder.timesheets.reduce((acc, item) => acc + item.duration / 3600, 0);
        const percentage = durationHours === 0 ? 0 : (durationHours / laborHours) * 100;
        console.log(percentage)
        const workOrderObject ={
            'lhr':!isNaN(percentage) && isFinite(percentage)?  round2Dec(percentage)+"%":"0.00%",
            'dif':differenceBetweenTwoTimeStamp(new Date().toISOString().slice(0, 19),workOrder.arrival_date)["days"],
            'railcar_id':workOrder.railcar_id,
            'arrival_date':convertSqlToFormattedDate(workOrder.arrival_date),
            'last_content': workOrder.railcar.products.name,
            'status':workOrder.workupdates[0].status_id,
            'comment':workOrder.workupdates,
            'material_eta':workOrder.material_eta !== 'process.env.REACT_APP_DEFAULT_DATE'? convertSqlToFormattedDate(workOrder.material_eta):null,
            'projected_out_date': convertSqlToFormattedDate(workOrder.projected_out_date),
            'finalized':workOrder.locked_by,
            'shipped':workOrder.shipped_date,
            'work_id':workOrder.id
        }
        workOrderData.push(workOrderObject)
    })
    const tableRef = useRef();
    useEffect(()=>{
        setModifiedWorkOrder(workOrderData)

    },[])
    useEffect(() => {
        //Initialize DataTable on component mount
        $(tableRef.current).DataTable({
            paging:false,
            info:false,
            searching:false,
            deferRender:false,
            "language": {
                "emptyTable": "",
                "zeroRecords":""
            }
        });
        // // Destroy DataTable on component unmount to avoid memory leaks
        // return () => {
        //     $(tableRef.current).DataTable(
        //         {
        //             paging:false,
        //             info:false,
        //             searching:false,
        //             deferRender:false,
        //             autoWidth:true,
        //             "language": {
        //                 "emptyTable": "",
        //                 "zeroRecords":""
        //             }
        //         }
        //     ).destroy(true);
        // };

    }, []);

    // useEffect(() => {
    //     // Update DataTable data when 'data' prop changes
    //     $(tableRef.current)
    //         .DataTable()
    //         .clear()
    //         .rows.add(modifiedWorkOrder)
    //         .draw();
    // }, [modifiedWorkOrder]);


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
                <select className="text-[14px] font-mediumselect bg-transparent pl-[0px] border-0 max-w-[213px] focus:border-0 focus:ring-0">
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
            cell:(row) =>(
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
            cell:(row) =>(
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
            cell:(row) =>(
                <input
                    type="checkbox"
                    // onChange={() => handleOrderCheckboxChange(index, "FINALIZED")}
                    checked={row.locked_by > -1}
                    className=" checkbox checkbox-primary mt-[6px] ml-[29px] w-[20px] h-[20px]" />
            )

        },
        {
            name: "SHIPPED",
            selector: "shipped",
            cell:(row)=>(
                <input
                    type="checkbox"
                    // onChange={() => handleOrderCheckboxChange(index, "FINALIZED")}
                    checked={row.locked_by > -1}
                    className=" checkbox checkbox-primary mt-[6px] ml-[29px] w-[20px] h-[20px]" />
            )
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
    return(
        <React.Fragment>
            <div className="overflow-x-hidden w-full mx-auto  mt-[-1px] text-[14px] font-medium">
            <div className="flex justify-between items-center mt-[10px] uppercase">
                <h2 className="text-[18px]  font-semibold">Active Orders</h2>
                <button className='btn text-cetner normal-case  h-[24px] px-[18px] py-[5px] flex items-center justify-center bg-[#002E54] text-white text-[14px] font-medium hover:bg-[#002f54]'>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 4.16663V15.8333M4.16669 9.99996H15.8334" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <span className='mt-[]'>
                        NEW ORDER
                    </span>
                </button>

            </div>
            <div className="overflow-x-hidden w-full mt-[20px] ml-[1px] mx-auto border rounded-[8px] mb-10">
                <table className="overflow-x-hidden border-y py-[12px]   w-full  bg-white   text-[#686868]" ref={tableRef}>
                    <thead className="uppercase text-[12px] font-medium bg-[#DCE5FF] ">
                        <tr className='h-[44px]'>
                            <th className="h-[44px] p-0  flex justify-between ml-[16px] items-center cursor-pointer">LHR</th>
                            <th className="h-[44px] p-0  items-center"><div className="flex items-center cursor-pointer justify-between">DIF</div></th>
                            <th className="h-[44px]  p-5 flex items-center cursor-pointer justify-between pl-[1px]">CAR</th>
                            <th className="h-[44px]  w-[81px] "><div className="flex items-center cursor-pointer justify-between">ARR. DATE</div></th>
                            <th lassName="h-[44px]   px-[2px] ">
                                <div className="flex items-center cursor-pointer justify-between">
                                    LAST CONTENT
                                </div>
                            </th>
                            <th className="h-[44px] w-[233px] text-center pl-[5px] ">
                                <div className="flex items-center cursor-pointer justify-between">STATUS
                                </div>
                            </th>
                            <th className="h-[44px]   w-[220px] text-center ">
                                <div className="flex items-center cursor-pointer justify-between">
                                    COMMENT
                                </div>
                            </th>
                            <th className="h-[44px]   w-[154px] text-center ">
                                <div className="flex items-center cursor-pointer justify-between">MATERIAL ETA
                                </div>
                            </th>
                            <th className="h-[44px]   w-[156px] whitespace-nowrap" >
                                <div className="flex items-center cursor-pointer justify-between">
                                    POD
                                </div>
                            </th>
                            <th className="h-[44px]  w-[91px] text-center pl-[3px]">
                                <div className="flex items-center cursor-pointer justify-evenly">
                                    FINALIZED
                                </div>
                            </th>
                            <th className="h-[44px]  text-center pl-[18px] "   >
                                <div className="flex items-center cursor-pointer justify-between">
                                    SHIPPED
                                </div>
                            </th>
                            <th className="h-[44px] w-[72px] text-center pl-[18px] pr-[6px]">ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                    {modifiedWorkOrder.map((wo, index) => (
                        <tr key={index} className={`text-[12px] py-[20px] align-middle  uppercase font-medium  ${index % 2 === 1 ? 'bg-[#F5F9FF]' : ''}`}>
                            <td className="px-[10px] py-3 align-middle">{wo.lhr}</td>
                            <td className="pr-[2px] py-3 align-middle">{wo.dif>0?wo.dif:'-'}</td>
                            <td className="align-middle py-3">{wo.railcar_id}</td>
                            <td className="align-middle py-3">{wo.arrival_date}</td>
                            <td className="max-w-[113px] whitespace-pre-line " >{wo.last_content}</td>
                            <td className="w-[245px] px-[]">
                                <select className="text-[14px] font-mediumselect bg-transparent pl-[0px] border-0 max-w-[213px] focus:border-0 focus:ring-0">
                                    {statusCode.map((sc) => (
                                        <option key={sc.code} selected={wo.status === sc.code}>
                                            {sc.code + ":" + sc.title}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td
                                className="cursor-pointer w-[198px] max-w-[198px] overflow-hidden whitespace-pre-line  text-ellipsis"
                                onClick={() => {
                                    document.getElementById('commentModal').showModal()
                                    setCommentObject(wo.workupdates)
                                }
                                }
                            >{wo.comment[0].comment}</td>
                            <td className="cursor-pointer w-[152px] pr-[10px]  justify-center align-middle">
                                <DatePicker
                                    customInput={<CustomDateInput value={wo.material_eta} />}
                                    selected={wo.material_eta?new Date(wo.material_eta):null}
                                    showYearDropdown
                                    dateFormat="MM-dd-yyyy"
                                />
                            </td>
                            <td className="cursor-pointer  align-middle">
                                <DatePicker
                                    // selected={projected_out_date[index]}
                                    customInput={<CustomDateInput value={wo.projected_out_date} />}
                                    selected={new Date(wo.projected_out_date)}
                                    showYearDropdown
                                    dateFormat="MM-dd-yyyy"
                                />
                            </td>
                            <td className=" align-middle">
                                <input
                                    type="checkbox"
                                    checked={wo.finalized > -1}
                                    className=" checkbox checkbox-primary mt-[6px] ml-[29px] w-[20px] h-[20px]" />
                            </td>
                            <td className="align-middle">
                                <input
                                    type="checkbox"
                                    checked={wo.shipped !== "process.env.REACT_APP_DEFAULT_DATE"}
                                    className="checkbox checkbox-primary mt-[6px] ml-[29px] w-[20px] h-[20px]" />
                            </td>
                            <td className="pl-[31px] align-middle">
                                <NavLink to="/d">
                                        <span className=''
                                            // onClick={() => {
                                            //     document.getElementById('my_modal_5').showModal()
                                            //     setItemIndexForModal(index)
                                            // }}
                                        >
                                            {/* svg for eye icon  */}
                                            <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1.42012 8.71318C1.28394 8.49754 1.21584 8.38972 1.17772 8.22342C1.14909 8.0985 1.14909 7.9015 1.17772 7.77658C1.21584 7.61028 1.28394 7.50246 1.42012 7.28682C2.54553 5.50484 5.8954 1 11.0004 1C16.1054 1 19.4553 5.50484 20.5807 7.28682C20.7169 7.50246 20.785 7.61028 20.8231 7.77658C20.8517 7.9015 20.8517 8.0985 20.8231 8.22342C20.785 8.38972 20.7169 8.49754 20.5807 8.71318C19.4553 10.4952 16.1054 15 11.0004 15C5.8954 15 2.54553 10.4952 1.42012 8.71318Z" stroke="#686868" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                <path d="M11.0004 11C12.6573 11 14.0004 9.65685 14.0004 8C14.0004 6.34315 12.6573 5 11.0004 5C9.34355 5 8.0004 6.34315 8.0004 8C8.0004 9.65685 9.34355 11 11.0004 11Z" stroke="#686868" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>
                                        </span>
                                </NavLink>
                            </td>
                        </tr>
                    ))}
                    {
                        // $(tableRef.current).DataTable({
                        //     paging:false,
                        //     info:false,
                        //     searching:false,
                        //     deferRender:false,
                        //     autoWidth:true
                        // })
                    }
                    </tbody>
                </table>
            </div>
            {/*<ActiveOrdersEditModal index={itemIndexForModal} />*/}
            {/*    <ActiveOrdersEditModal index={itemIndexForModal} />*/}
                <CommentModal data={commentObject} />
        </div >
        </React.Fragment>
    )
}

const CustomDateInput = ({ value, onClick }) => (
    <div className="w-fit mx-auto">
        <div onClick={onClick} className='flex items-center justify-between  border  rounded-[4px] w-[116px] whitespace-nowrap overflow-hidden h-[32px] '>
            <p className='pl-[4px] py-[6px]'>{value}</p>
            <button className='mr-[5px]'>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.75 7.5H2.25M12 1.5V4.5M6 1.5V4.5M5.85 16.5H12.15C13.4101 16.5 14.0402 16.5 14.5215 16.2548C14.9448 16.039 15.289 15.6948 15.5048 15.2715C15.75 14.7902 15.75 14.1601 15.75 12.9V6.6C15.75 5.33988 15.75 4.70982 15.5048 4.22852C15.289 3.80516 14.9448 3.46095 14.5215 3.24524C14.0402 3 13.4101 3 12.15 3H5.85C4.58988 3 3.95982 3 3.47852 3.24524C3.05516 3.46095 2.71095 3.80516 2.49524 4.22852C2.25 4.70982 2.25 5.33988 2.25 6.6V12.9C2.25 14.1601 2.25 14.7902 2.49524 15.2715C2.71095 15.6948 3.05516 16.039 3.47852 16.2548C3.95982 16.5 4.58988 16.5 5.85 16.5Z" stroke="#686868" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>
        </div>
    </div>
);


export default WorkOrderDataTable