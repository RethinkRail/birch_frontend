import React, {useEffect, useRef, useState} from "react";
import {round2Dec} from "../utils/NumberHelper";
import {convertSqlToFormattedDate, differenceBetweenTwoTimeStamp} from "../utils/DateTimeHelper";
import DatePicker from "react-datepicker";
import CommentModal from "./CommentModal";
import {NavLink} from "react-router-dom";
import {AiFillCaretDown} from "react-icons/ai";
import ActiveOrdersEditModal from "./ActiveOrdersEditModal";
import DataTable from "react-data-table-component";
import {CSSObject} from "styled-components";
import Modal from 'react-modal'; // Make sure to install react-modal
const WorkOrderDataTable =({workOrders,statusCode,updateWorkUpdates,updateMaterialETA,updatePOD,updateMarkAsFinalized,updateMarkAsShipped}) =>{
    const [commentObject, setCommentObject] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false);
    const workOrderData = [];
    workOrders.forEach((workOrder,index) =>{
        const laborHours = workOrder.joblist.reduce((acc, item) => acc + item.labor_time * item.quantity, 0);
        const durationHours = workOrder.timesheets.reduce((acc, item) => acc + item.duration / 3600, 0);
        const percentage = durationHours === 0 ? 0 : (durationHours / laborHours) * 100;
        var actual_dif= differenceBetweenTwoTimeStamp(new Date().toISOString().slice(0, 19),workOrder.arrival_date)["days"]
        const workOrderObject ={
            'lhr':!isNaN(percentage) && isFinite(percentage)?  round2Dec(percentage)+"%":"0.00%",
            'dif':actual_dif,
            'railcar_id':workOrder.railcar_id,
            'arrival_date':convertSqlToFormattedDate(workOrder.arrival_date),
            'last_content': workOrder.railcar.products.name,
            'status':workOrder.workupdates[0].status_id,
            'comment':workOrder.workupdates,
            'material_eta':workOrder.material_eta !== '1900-01-01T00:00:00.000Z'? convertSqlToFormattedDate(workOrder.material_eta):null,
            'projected_out_date': convertSqlToFormattedDate(workOrder.projected_out_date),
            'finalized':workOrder.locked_by,
            'shipped':workOrder.shipped_date,
            'work_id':workOrder.id,
            'index':index
        }
        workOrderData.push(workOrderObject)
    })


    const handleDropdownChange = (index,value) =>{
        openModal(index)
    }

    const openModal = (rowIndex) => {
        setIsModalOpen(true)
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const workOrdersTableColumn = [
        {
            name: "LHR",
            selector: row => row.lhr,
            sortable: true,
            width: '6%'

        },
        {
            name: "DIF",
            selector: row =>  row.dif,
            sortable: true,
            width: '5%',
            cell:(row)=>(
                <span className="whitespace-pre-line ">{row.dif>0?row.dif:"-"}</span>
            ),
        },
        {
            name: "CAR",
            selector: row =>  row.railcar_id,
            sortable: true,
            width: '9%'
        },
        {
            name: "ARR.DATE",
            selector: row =>  row.arrival_date,
            sortable: true,
            width: '8%',

        },
        {
            name: "LAST CONTENT",
            selector:  row => row.last_content,
            sortable: true,
            cell:(row)=>(
                <span className="whitespace-pre-line ">{row.last_content}</span>
            ),
            width: "10%"
        },
        {
            name: "STATUS",
            selector: row => row.status,
            width: "10%",
            cell: (row) => (
                <select onChange={(e) => handleDropdownChange(row.index, e.target.value)} disabled={row.finalized>0} className={`w-24 placeholder-opacity-90 mr-6 ${row.index % 2 === 0 ? '' : 'bg-[#F7F9FF]'}`}>
                    {statusCode.map((sc) => (
                        <option className={'w-18'} key={sc.code} selected={row.status === sc.code}>
                            {sc.code + ":" + sc.title}
                        </option>
                    ))}
                </select>
            ),
            sortable: true,

        },
        {
            name: "COMMENT",
            selector: row =>  row.comment,
            width: "10%",
            className: "p-2",
            cell: (row) => (
                <span onClick={ () =>{
                    document.getElementById('commentModal').showModal()
                    setCommentObject(row.comment)
                }} className="cursor-pointer  whitespace-pre-line  text-ellipsis">{row.comment[0].comment}</span>
            ),
            sortable: true
        },
        {
            name: "MATERIAL ETA",
            selector: row => row.material_eta,
            width: "10%",
            cell:(row) =>(
                <span>
                    <DatePicker
                        customInput={<CustomDateInput value={row.material_eta}  />}
                        selected={row.material_eta?new Date(row.material_eta):null}
                        onChange = {newDate =>updateMaterialETA(row.work_id,newDate)}
                        showYearDropdown
                        isClearable
                        disabled={row.finalized>0}
                        dateFormat="MM-dd-yyyy"
                    />
                </span>
            ),
            sortable: true,

        },
        {
            name: "POD",
            selector: row =>  row.projected_out_date,
            cell:(row) =>(
                <DatePicker
                    customInput={<CustomDateInput value={row.projected_out_date} />}
                    selected={new Date(row.projected_out_date)}
                    onChange = {newDate =>updatePOD(row.work_id,newDate)}
                    showYearDropdown
                    dateFormat="MM-dd-yyyy"
                    disabled={row.finalized>0}
                />
            ),
            sortable: true,
            width: "9%",
        },
        {
            name: "FINALIZED",
            selector: row =>  row.finalized,
            width: "8%",
            sortable: true,
            cell:(row) =>(
                <input
                    disabled={row.finalized>1}
                    type="checkbox"
                    onChange={(event) =>updateMarkAsFinalized(row.work_id,event.target.checked)}
                    checked={row.finalized !== null}
                    className=" checkbox checkbox-primary mt-[6px] ml-[29px] w-[20px] h-[20px]" />
            )
        },
        {
            name: "SHIPPED",
            selector: row =>  row.shipped,
            width: "9%",
            className: "justify-center",
            sortable: true,
            cell:(row)=>(
                    <DatePicker
                        customInput={<CustomDateInput value={row.shipped !=="1900-01-01T00:00:00.000Z"?row.shipped:null } />}
                        selected={row.shipped !=="1900-01-01T00:00:00.000Z"?new Date(row.shipped):null}
                        onChange = {newDate =>updateMarkAsShipped(row.work_id,newDate)}
                        showYearDropdown
                        isClearable
                        dateFormat="MM-dd-yyyy"
                    />
            )
        },
        {
            name: "ACTION",
            selector: row =>  row.work_id,
            width: "6%",
            sortable: false,
            padding:"0px",
            className: "mt-[10px]",
            cell: (row) => (
                <NavLink to="/d">
                    <span className='align-middle mt-[10px]'>
                        {/* svg for eye icon  */}
                        <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.42012 8.71318C1.28394 8.49754 1.21584 8.38972 1.17772 8.22342C1.14909 8.0985 1.14909 7.9015 1.17772 7.77658C1.21584 7.61028 1.28394 7.50246 1.42012 7.28682C2.54553 5.50484 5.8954 1 11.0004 1C16.1054 1 19.4553 5.50484 20.5807 7.28682C20.7169 7.50246 20.785 7.61028 20.8231 7.77658C20.8517 7.9015 20.8517 8.0985 20.8231 8.22342C20.785 8.38972 20.7169 8.49754 20.5807 8.71318C19.4553 10.4952 16.1054 15 11.0004 15C5.8954 15 2.54553 10.4952 1.42012 8.71318Z" stroke="#686868" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M11.0004 11C12.6573 11 14.0004 9.65685 14.0004 8C14.0004 6.34315 12.6573 5 11.0004 5C9.34355 5 8.0004 6.34315 8.0004 8C8.0004 9.65685 9.34355 11 11.0004 11Z" stroke="#686868" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </span>
                </NavLink>
            ),
        },
    ];
    const conditionalRowStyles = [
        {
            when: row =>  row.finalized >0,
            style: {
                backgroundColor: '#f4f4f6',
            },
            classNames:["py-2", "whitespace-nowrap", "font-bold" ,"text-xs"]
        },
        {
            when: row => row.finalized <1 && row.index %2 ==1,
            style: {
                backgroundColor: '#F7F9FF',
            },
            classNames:["py-2", "whitespace-nowrap", "font-bold" ,"text-xs"]
        },
        {
            when: row => row.finalized <1 && row.index %2 ==0,
            style: {
                backgroundColor: '#FFFFFFFF', // Yellow background for rows where age is less than 25
            },
            classNames:["py-2", "whitespace-nowrap", "font-bold" ,"text-xs"]
        },
    ];
    const myStyles = {
            headRow:{
                style: {"backgroundColor":"#DCE5FF","font-size":"11px","padding-right":"1px","font-family": 'Inter',"font-weight":"500"},
            },
            cells:{
                style: {"font-size":"11px","font-family": 'Inter',"font-weight":"500"},
            }
        }
    const handleSave = (text) => {
        // Handle saving the text (e.g., send it to an API)
        console.log('Text saved:', text);
    };
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
            <div className="mt-[20px] ml-[1px] mx-auto border rounded-[8px] mb-10 m-1.5">
                <DataTable
                    title=""
                    columns={workOrdersTableColumn}
                    data={workOrderData}
                    conditionalRowStyles={conditionalRowStyles}
                    striped={false}
                    dense={true}
                    responsive={true}
                    pagination={false}
                    highlightOnHover={true}
                    fixedHeader={false}
                    className="display nowrap compact stripe"
                    customStyles={myStyles}

                />
            </div>
            {/*<ActiveOrdersEditModal index={itemIndexForModal} />*/}
            {/*    <ActiveOrdersEditModal index={itemIndexForModal} />*/}
                <CommentModal data={commentObject} />
                <Modal
                    isOpen={isModalOpen}
                    onRequestClose={closeModal}
                    contentLabel="Example Modal"
                >
                    <h2>Dropdown Value Changed</h2>
                    <p></p>
                    <button onClick={closeModal}>Close Modal</button>
                </Modal>
        </div >


        </React.Fragment>
    )
}

const CustomDateInput = ({ value, onClick }) => (
    <div className="w-fit mx-auto">
        <div onClick={onClick} className='flex items-center justify-between  border  rounded-[4px] w-[95px] whitespace-nowrap overflow-hidden h-[32px] '>
            <p className='pl-[4px] py-[6px]'>{value}</p>
            {/*{ showButton &&*/}
            {/*    <button className='mr-[5px]'>*/}
            {/*        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">*/}
            {/*            <path d="M15.75 7.5H2.25M12 1.5V4.5M6 1.5V4.5M5.85 16.5H12.15C13.4101 16.5 14.0402 16.5 14.5215 16.2548C14.9448 16.039 15.289 15.6948 15.5048 15.2715C15.75 14.7902 15.75 14.1601 15.75 12.9V6.6C15.75 5.33988 15.75 4.70982 15.5048 4.22852C15.289 3.80516 14.9448 3.46095 14.5215 3.24524C14.0402 3 13.4101 3 12.15 3H5.85C4.58988 3 3.95982 3 3.47852 3.24524C3.05516 3.46095 2.71095 3.80516 2.49524 4.22852C2.25 4.70982 2.25 5.33988 2.25 6.6V12.9C2.25 14.1601 2.25 14.7902 2.49524 15.2715C2.71095 15.6948 3.05516 16.039 3.47852 16.2548C3.95982 16.5 4.58988 16.5 5.85 16.5Z" stroke="#686868" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />*/}
            {/*        </svg>*/}
            {/*    </button>*/}
            {/*}*/}

        </div>
    </div>
);




export default WorkOrderDataTable