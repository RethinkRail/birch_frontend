// /**
//  * @author : Mithun Sarker
//  * @mailto : mithun@ihrail.com
//  * @created : 10/28/2024, Monday
//  * Description:
//  **/
//
// import React, { useState } from "react";
// import {MaterialReactTable} from "material-react-table";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css"; // Import CSS for DatePicker
//
// const railcarData = [
//     {
//         id: 2488,
//         railcar_id: "TILX281772",
//         dis: 3,
//         type: "TANK",
//         owner: "TRINITY INDUSTRIES",
//         lessee: "MARATHON PETROLEUM COMPANY LP",
//         products: "TALLOW",
//         status_code: 200,
//         comment: [
//             {
//                 status_id: 200,
//                 update_date: "2024-10-25T20:44:56.000Z",
//                 comment: "INITIAL ESTIMATE COMPLETE",
//                 user: { name: "jsanders", id: 41 },
//                 statuscode: { title: "WAITING CLEANING", code: 200 },
//             },
//         ],
//         inspected_date: "10/24/2024",
//         clean_date: "10/29/2024",
//         repair_schedule_date: null,
//         paint_date: null,
//         valve_date: null,
//         qa_date: null,
//         projected_out_date: null,
//         total_cost: "4796.91",
//         sp: "",
//         tq: "",
//         re: "",
//         ep: "",
//     },
//     {
//         id: 2488,
//         railcar_id: "TILX281772",
//         dis: 3,
//         type: "TANK",
//         owner: "TRINITY INDUSTRIES",
//         lessee: "MARATHON PETROLEUM COMPANY LP",
//         products: "TALLOW",
//         status_code: 200,
//         comment: [
//             {
//                 status_id: 200,
//                 update_date: "2024-10-25T20:44:56.000Z",
//                 comment: "INITIAL ESTIMATE COMPLETE",
//                 user: { name: "jsanders", id: 41 },
//                 statuscode: { title: "WAITING CLEANING", code: 200 },
//             },
//         ],
//         inspected_date: "10/24/2024",
//         clean_date: "10/29/2024",
//         repair_schedule_date: null,
//         paint_date: null,
//         valve_date: null,
//         qa_date: null,
//         projected_out_date: null,
//         total_cost: "4796.91",
//         sp: "",
//         tq: "",
//         re: "",
//         ep: "",
//     },
//     {
//         id: 2488,
//         railcar_id: "TILX281772",
//         dis: 3,
//         type: "TANK",
//         owner: "TRINITY INDUSTRIES",
//         lessee: "MARATHON PETROLEUM COMPANY LP",
//         products: "TALLOW",
//         status_code: 200,
//         comment: [
//             {
//                 status_id: 200,
//                 update_date: "2024-10-25T20:44:56.000Z",
//                 comment: "INITIAL ESTIMATE COMPLETE",
//                 user: { name: "jsanders", id: 41 },
//                 statuscode: { title: "WAITING CLEANING", code: 200 },
//             },
//         ],
//         inspected_date: "10/24/2024",
//         clean_date: "10/29/2024",
//         repair_schedule_date: null,
//         paint_date: null,
//         valve_date: null,
//         qa_date: null,
//         projected_out_date: null,
//         total_cost: "4796.91",
//         sp: "",
//         tq: "",
//         re: "",
//         ep: "",
//     },
//     {
//         id: 2488,
//         railcar_id: "TILX281772",
//         dis: 3,
//         type: "TANK",
//         owner: "TRINITY INDUSTRIES",
//         lessee: "MARATHON PETROLEUM COMPANY LP",
//         products: "TALLOW",
//         status_code: 200,
//         comment: [
//             {
//                 status_id: 200,
//                 update_date: "2024-10-25T20:44:56.000Z",
//                 comment: "INITIAL ESTIMATE COMPLETE",
//                 user: { name: "jsanders", id: 41 },
//                 statuscode: { title: "WAITING CLEANING", code: 200 },
//             },
//         ],
//         inspected_date: "10/24/2024",
//         clean_date: "10/29/2024",
//         repair_schedule_date: null,
//         paint_date: null,
//         valve_date: null,
//         qa_date: null,
//         projected_out_date: null,
//         total_cost: "4796.91",
//         sp: "",
//         tq: "",
//         re: "",
//         ep: "",
//     }
// ];
//
// const RailcarTable = () => {
//     const [data, setData] = useState(railcarData);
//
//     const handleDateChange = (date, row, column) => {
//         const newData = [...data];
//         newData[row.index][column.id] = date;
//         setData(newData);
//     };
//
//     const handleTextChange = (e, row, column) => {
//         const newData = [...data];
//         newData[row.index][column.id] = e.target.value;
//         setData(newData);
//     };
//
//     const columns = React.useMemo(
//         () => [
//             { accessorKey: "id", header: "ID" },
//             { accessorKey: "railcar_id", header: "Railcar ID" },
//             { accessorKey: "dis", header: "DIS" },
//             { accessorKey: "type", header: "Type" },
//             { accessorKey: "owner", header: "Owner" },
//             { accessorKey: "lessee", header: "Lessee" },
//             { accessorKey: "products", header: "Products" },
//             { accessorKey: "status_code", header: "Status Code" },
//             {
//                 accessorKey: "comment",
//                 header: "Comment",
//                 Cell: ({ row }) => <span>{row.original.comment[0]?.comment}</span>,
//             },
//             { accessorKey: "total_cost", header: "Total Cost" },
//             {
//                 accessorKey: "sp",
//                 header: "SP",
//                 Cell: ({ row, column }) => (
//                     <input
//                         type="text"
//                         value={row.original.sp || ""}
//                         onChange={(e) => handleTextChange(e, row, column)}
//                         className="border p-1 rounded w-full"
//                     />
//                 ),
//             },
//             {
//                 accessorKey: "tq",
//                 header: "TQ",
//                 Cell: ({ row, column }) => (
//                     <input
//                         type="text"
//                         value={row.original.tq || ""}
//                         onChange={(e) => handleTextChange(e, row, column)}
//                         className="border p-1 rounded w-full"
//                     />
//                 ),
//             },
//             {
//                 accessorKey: "re",
//                 header: "RE",
//                 Cell: ({ row, column }) => (
//                     <input
//                         type="text"
//                         value={row.original.re || ""}
//                         onChange={(e) => handleTextChange(e, row, column)}
//                         className="border p-1 rounded w-full"
//                     />
//                 ),
//             },
//             {
//                 accessorKey: "ep",
//                 header: "EP",
//                 Cell: ({ row, column }) => (
//                     <input
//                         type="text"
//                         value={row.original.ep || ""}
//                         onChange={(e) => handleTextChange(e, row, column)}
//                         className="border p-1 rounded w-full"
//                     />
//                 ),
//             },
//             // Date fields with Date Picker
//             {
//                 accessorKey: "inspected_date",
//                 header: "Inspected Date",
//                 Cell: ({ row, column }) => (
//                     <DatePicker
//                         selected={new Date(row.original.inspected_date)}
//                         onChange={(date) => handleDateChange(date, row, column)}
//                         className="border p-1 rounded w-full"
//                         popperClassName="z-50" // Ensure it has a higher z-index
//                         portalId="root-portal"
//                     />
//                 ),
//             },
//             {
//                 accessorKey: "clean_date",
//                 header: "Clean Date",
//                 Cell: ({ row, column }) => (
//                     <DatePicker
//                         selected={new Date(row.original.clean_date)}
//                         onChange={(date) => handleDateChange(date, row, column)}
//                         className="border p-1 rounded w-full"
//                         popperClassName="z-50" // Ensure it has a higher z-index
//                     />
//                 ),
//             },
//             {
//                 accessorKey: "repair_schedule_date",
//                 header: "Repair Schedule Date",
//                 Cell: ({ row, column }) => (
//                     <DatePicker
//                         selected={
//                             row.original.repair_schedule_date
//                                 ? new Date(row.original.repair_schedule_date)
//                                 : null
//                         }
//                         onChange={(date) => handleDateChange(date, row, column)}
//                         className="border p-1 rounded w-full"
//                     />
//                 ),
//             },
//             {
//                 accessorKey: "paint_date",
//                 header: "Paint Date",
//                 Cell: ({ row, column }) => (
//                     <DatePicker
//                         selected={
//                             row.original.paint_date ? new Date(row.original.paint_date) : null
//                         }
//                         onChange={(date) => handleDateChange(date, row, column)}
//                         className="border p-1 rounded w-full"
//                     />
//                 ),
//             },
//             {
//                 accessorKey: "valve_date",
//                 header: "Valve Date",
//                 Cell: ({ row, column }) => (
//                     <DatePicker
//                         selected={
//                             row.original.valve_date ? new Date(row.original.valve_date) : null
//                         }
//                         onChange={(date) => handleDateChange(date, row, column)}
//                         className="border p-1 rounded w-full"
//                     />
//                 ),
//             },
//         ],
//         [data]
//     );
//
//     return (
//         <div className="p-4">
//             <MaterialReactTable columns={columns} data={data} />
//         </div>
//     );
// };
//
// export default RailcarTable;
