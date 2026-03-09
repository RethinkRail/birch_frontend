import React, {useEffect, useState} from 'react'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import Key from './Key'
import String from './String'
import Code from './Code'
import handleGetColumn from '../utils/getColumn'
import EditModal from './EditModal'
import Plus from './Plus'
import {toast} from 'react-toastify'
import DeleteModal from './DeleteModal'
import {hasRole, showToastMessage} from "../utils/CommonHelper";
import DataTableSearch from "./DataTableSearch";
import {Input} from "postcss";

const DatabaseTable = () => {

    const [table, setTable] = useState()
    const [tableSchema, setTableSchema] = useState()
    const [allTables, setAllTables] = useState()
    const [selectedTable, setSelectedTable] = useState("")
    const [modalShowing, setModalShowing] = useState(false)
    const [editRowData, setEditRowData] = useState()
    const [searchTerm, setSearchTerm] = useState("")
    const [deleteModalShowing, setDeleteModalShowing] = useState(false)
    const [rowId, setRowId] = useState()
    const [rowCode, setRowCode] = useState()
    const [filteredTable, setFilteredTable] = useState([]);
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);


    useEffect(() => {
        const handleFetchAllTables = async () => {
            try {
                const allTablesRes = await axios.get(`${process.env.REACT_APP_BIRCH_API_URL}all-tables`)
                setAllTables(allTablesRes.data)
                setSelectedTable(Object.keys(allTablesRes.data)[0])
            } catch (error) {
                console.log(error, "An error occured when trying to fetch product")
            }
        }
        handleFetchAllTables()
    }, [])

    useEffect(() => {
        if (searchTerm === '') {
            setFilteredTable(table);
        } else {
            const lowercasedFilter = searchTerm.toLowerCase();
            const filteredData = table.filter(item => {
                return Object.keys(item).some(key => {
                    const value = item[key];
                    console.log(value)
                    // Check if the value is a string before trying to call toLowerCase
                    if (typeof value === 'string') {
                        return value.toLowerCase().includes(lowercasedFilter);
                    }
                    // Optionally handle other types, like numbers, if needed:
                    if (typeof value === 'number') {
                        return value.toString().includes(lowercasedFilter);
                    }
                    // Ignore other types like objects or arrays
                    return false;
                });
            });
            setFilteredTable(filteredData);
        }
    }, [searchTerm, table]);
    useEffect(() => {
        console.log("fetching table")
        const handleFetchTable = async () => {
            try {
                if (!selectedTable || selectedTable === null) {
                    return
                } else {
                    const response = await axios.get(`${process.env.REACT_APP_BIRCH_API_URL}table?table=${selectedTable}&searchTerm=${searchTerm}`)
                    console.log(response)
                    setTable(response.data.data)
                    setTableSchema(response.data.schema)
                }
            } catch (error) {
                console.log(error, "An error occured when fetching table ")
            }
        }
        handleFetchTable()
    }, [selectedTable])

    const handleAddRow = (newRow) => {
        setTable((prevTable) => [...prevTable, newRow]);
    };

    const myStyles = {
        headRow: {
            style: {
                "backgroundColor": "#DCE5FF",
                "font-size": "10px",
                "padding": "1px",
                "font-family": 'Inter',
                "font-weight": "500"
            },
        },
        headCells: {
            style: {
                paddingLeft: '10px',
                paddingRight: '2px',
            },
        },
        cells: {
            style: {"font-size": "10px", "font-family": 'Inter', "font-weight": "500", "padding": "5px"},
        },

    }
    const conditionalRowStyles = [
        {
            when: row => row.updated_by > 0,
            style: {
                backgroundColor: '#f4f4f6',
            },
            classNames: ["py-1", "whitespace-nowrap", "font-bold", "text-xs"]
        },
        {
            when: row => row.finalized < 1 && row.index % 2 == 1,
            style: {
                backgroundColor: '#F7F9FF',
            },
            classNames: ["py-1", "whitespace-nowrap", "font-bold", "text-xs"]
        },
        {
            when: row => row.finalized < 1 && row.index % 2 == 0,
            style: {
                backgroundColor: '#FFFFFFFF', // Yellow background for rows where age is less than 25
            },
            classNames: ["py-1", "whitespace-nowrap", "font-bold", "text-xs"]
        },
    ];

    const handleEditRow = (row) => {
        setEditRowData(row)
        setModalShowing(true)
    }

    const handleDelete = async () => {
        try {
            console.log(`row id is ${rowId} and rowCode is ${rowCode}`)
            if (!rowId && rowCode) {
                console.log("Deleting based on code")
                const response = await axios.delete(`${process.env.REACT_APP_BIRCH_API_URL}table?table=${selectedTable}&code=${rowCode}&user_id=${JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id']}`)
                console.log(response, "This is the response from the delete request")
                setTable((prev) => prev.filter((prev) => prev.code !== rowCode))
                setDeleteModalShowing(false)
                return
            }
            console.log("Deleting by id")
            const response = await axios.delete(`${process.env.REACT_APP_BIRCH_API_URL}table?table=${selectedTable}&id=${rowId}&user_id=${JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id']}`)
            console.log(response, "This is the response from the delete request")
            setTable((prev) => prev.filter((prev) => prev.id !== rowId))
            setDeleteModalShowing(false)
        } catch (error) {
            setDeleteModalShowing(false)
            console.log(error.response.data.message, "This is the error")
            toast.error("This entity is being used,hence can't be deleted")
            showToastMessage(error.response.data.message, 2)
        }
    }

    return (
        <div className='flex justify-center items-center w-full px-12 flex-col'>
            {allTables &&
                <div className='flex flex-row w-full gap-10 py-5'>
                    <div className='flex-1 flex flex-col gap-2'>
                        <h3>Select Table</h3>
                        <select name="table" id="table" defaultValue={selectedTable}
                                onChange={(e) => setSelectedTable(e.target.value)} placeholder='Select Table'
                                className='text-[12px] p-1 rounded-md uppercase'>
                            {Object.keys(allTables).map((table, index) => {
                                // Determine the correct excluded tables list based on role
                                const excludedTables = hasRole('CFO')
                                    ? process.env.REACT_APP_DB_OPERATION_EXCLUDED_TABLES_CFO
                                    : process.env.REACT_APP_DB_OPERATION_EXCLUDED_TABLES;

                                // Parse the excluded tables safely
                                let excludedTablesArray = [];
                                try {
                                    excludedTablesArray = JSON.parse(excludedTables || "[]");
                                } catch (error) {
                                    console.error("Failed to parse excluded tables:", error);
                                }

                                // Render options conditionally
                                return !excludedTablesArray.includes(table) ? (
                                    <option key={index} value={table}>
                                        {table.split("_").join(" ")}
                                    </option>
                                ) : null;
                            })}

                        </select>
                    </div>
                    <div className='flex-1'>
                        <h3>Schema</h3>
                        <div className='text-[12px] grid grid-cols-2 gap-1.5'>
                            {allTables[selectedTable].map((field, index) => (
                                <div key={`field--${index}`} className='flex items-center gap-2 col-span-1'>
                                    <div className='flex justify-center items-center h-4 w-4'>
                                        {field.Field.toLowerCase() === "id" ?
                                            <Key/> : field.Field.toLowerCase() === "code" ? <Code/> : <String/>}
                                    </div>
                                    <p>
                                        {field.Field}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            }
            <div className='w-full flex flex-row justify-between items-center'>
                <button
                    className='bg-[#002e54] px-3 py-1.5 rounded-md flex justify-center items-center gap-2 text-white'
                    onClick={() => setModalShowing((prev) => (!prev))}>
                    <span className='flex w-4 h-4 items-center justify-center'><Plus/></span><span
                    className='text-[12px]'>Add a new entry</span>
                </button>
                {/*<div className='border-[#002e54] border-[1px] px-3 py-1.5 w-[200px] rounded-md'>*/}
                {/*    <input type="text" className='h-full w-full flex-1 outline-none' placeholder='Search...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />*/}
                {/*</div>*/}
                <DataTableSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
            </div>
            {table && allTables && selectedTable ? (

                <div className="mt-[20px] ml-[1px] mx-auto border rounded-[8px] mb-10 m-1.5 w-full">
                    <DataTable
                        title=""
                        columns={handleGetColumn(allTables[selectedTable], handleEditRow, setRowId, setRowCode, setDeleteModalShowing)}
                        data={filteredTable}
                        conditionalRowStyles={conditionalRowStyles}
                        striped={false}
                        dense={true}
                        responsive={true}
                        pagination
                        paginationPerPage={50}
                        paginationRowsPerPageOptions={[50, 100, 150, 200]}
                        highlightOnHover={true}
                        className="display nowrap compact stripe"
                        customStyles={myStyles}

                    />
                </div>
            ) : (
                <div>Loading...</div>
            )}
            {deleteModalShowing &&
                <DeleteModal setDeleteModalShowing={setDeleteModalShowing} handleDelete={handleDelete}
                             setRowId={setRowId} setRowCode={setRowCode}/>}
            {modalShowing &&
                <EditModal setModalShowing={setModalShowing} fields={allTables[selectedTable]} setTable={setTable}
                           setEditRowData={setEditRowData} editRowData={editRowData} selectedTable={selectedTable}
                           tableSchema={tableSchema}/>}
        </div>
    )
}

export default DatabaseTable
