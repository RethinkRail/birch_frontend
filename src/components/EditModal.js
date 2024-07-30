import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const EditModal = ({ setModalShowing, fields, selectedTable, setTable, editRowData, setEditRowData, tableSchema }) => {
  const [inputValues, setInputValues] = useState({});
  const [relatedData, setRelatedData] = useState()


  // Setting the initial value of the input field when the modal appears
  useEffect(() => {
    if (editRowData) {
      setInputValues(editRowData);
    } else {
      const initialState = {};
      fields.filter(field => field.Field.toLowerCase() !== "id").forEach(field => {
        initialState[field.Field.toLowerCase()] = ''; // Initial values can be set here
      });
      setInputValues(initialState);
    }
  }, [editRowData, fields]);

  useEffect(() => {
    const fetchRelatedData = async () => {
      const relatedDataPromises = tableSchema
          .filter(fld => fld.isForeignKey)
          .map(async field => {
            const response = await axios.get(`${process.env.REACT_APP_BIRCH_API_URL}table?table=${field.foreignKeyInfo.referencedTable}`);
            return { field: field.name, data: response.data.data };
          });

      const relatedDataResults = await Promise.all(relatedDataPromises);
      console.log(relatedDataResults, "This is the related data results")
      const relatedDataMap = relatedDataResults.reduce((acc, { field, data }) => {
        acc[field] = data;
        return acc;
      }, {});

      setRelatedData(relatedDataMap);
    };

    fetchRelatedData();
  }, [tableSchema]);

  // Function to set the type of the field to the one in the backend
  const getInputType = (type) => {
    switch (type.toLowerCase()) {
      case 'float':
      case 'double':
      case 'decimal':
        return 'number';
      case 'int':
      case 'integer':
      case 'tinyint':
      case 'smallint':
      case 'mediumint':
      case 'bigint':
        return 'number';
      case 'date':
        return 'date';
      case 'datetime':
      case 'timestamp':
        return 'datetime-local';
      case 'time':
        return 'time';
      default:
        return 'text';
    }
  };

  // function to handle setting inputValue when input changes
  const handleInputChange = (e, fieldName, type) => {
    const { value } = e.target;
    let parsedValue;

    if (type === 'number') {
      parsedValue = parseFloat(value);
    } else if (type === 'select') {
      parsedValue = parseInt(value);
      console.log("this is a select field", parseInt(value))
    } else if (type === 'datetime-local') {
      parsedValue = value;
    } else {
      parsedValue = value;
    }

    setInputValues(prevState => ({
      ...prevState,
      [fieldName]: parsedValue,
    }));
  };

  // Function to filter out empty strings
  const filterEmptyStrings = (data) => {
    const filteredData = {};
    for (const key in data) {
      if (data[key] !== '') {
        filteredData[key] = data[key];
      }
    }
    return filteredData;
  };

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return date.toISOString()
    // const offset = date.getTimezoneOffset();
    // const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    // const isoString = adjustedDate.toISOString();
    // console.log(isoString.split('.')[0] + 'Z')
    // return isoString.split('.')[0] + 'Z'; // Remove milliseconds and ensure the format ends with 'Z'
  };


  // Function to make the request to the backend when the save button is clicked
  const handleSave = async () => {
    console.log(inputValues, "This is the object before the removal of the empty strings");
    const filteredValue = filterEmptyStrings(inputValues);
    console.log(filteredValue, "This is the object when the empty strings are removed");
    const transformedValues = { ...filteredValue };

    for (const key in transformedValues) {
      console.log(key)
      const field = fields.find(field => field.Field.toLowerCase() === key);
      if (field && field.Field.toLowerCase() === 'last_update') {
        transformedValues[key] = new Date();
        console.log(transformedValues[key], "found one with type datetime");
      }
      console.log(field)
      if (field && field.Field.toLowerCase() === 'updated_by') {
        transformedValues[key] = JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id'];
        console.log(transformedValues[key], "found one with type datetime");
      }
    }
    console.log(transformedValues, "This is the transformed value");

    try {
      let response;
      if (!editRowData) {
        console.log("Reached the create field");
        response = await axios.post(`${process.env.REACT_APP_BIRCH_API_URL}table?table=${selectedTable}`, transformedValues);

      } else {
        response = await axios.patch(`${process.env.REACT_APP_BIRCH_API_URL}table?table=${selectedTable}`, transformedValues);
      }
      console.log(response, "This is the response from the data creation/update");

      const newData = { ...response.data };

      tableSchema
          .filter(field => field.isForeignKey)
          .forEach(field => {
            const foreignKeyField = field.name.toLowerCase();
            const referencedColumn = field.foreignKeyInfo.referencedColumn.toLowerCase();
            const relatedItem = relatedData[foreignKeyField].find(item => item[referencedColumn] === newData[foreignKeyField]);

            if (relatedItem) {
              if (referencedColumn === 'id') {
                newData[foreignKeyField] = relatedItem.name;
              } else {
                newData[foreignKeyField] = relatedItem[referencedColumn];
              }
            }
          });

      if (!editRowData) {
        setTable((prev) => [...prev, newData]);
      } else {
        if (newData.id) {
          setTable((prev) => prev.map((pr) => pr.id === newData.id ? newData : pr));
        } else if (newData.code) {
          setTable((prev) => prev.map((pr) => pr.code === newData.code ? newData : pr));
        }
      }

      setModalShowing(false);
      setEditRowData();
      setRelatedData()
    } catch (error) {
      console.log(error);
      console.log(error.response.data.message, "This is the error")
      toast.error(error.response.data.message)
    }
  };


  return (
      <div
          className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col h-[100vh] bg-[#2e2b2b40] w-full justify-center items-center z-[10]'
          onClick={() => {
            setModalShowing((prev) => !prev);
            setEditRowData();
            setRelatedData();
          }}
      >
        <div className='bg-white rounded-md shadow-md grid grid-cols-2 gap-1.5 p-3' onClick={(e) => e.stopPropagation()}>
          {relatedData && fields.filter(field => field.Field.toLowerCase() !== "id").map((field, index) => (
              <div key={`field--edit--${index}`} className={`${field.Field.toLowerCase() === "id" || (editRowData && field.Field.toLowerCase() === "updated_by") || (field.Field.toLowerCase() === "last_update") ? "hidden" : ""} col-span-1 flex justify-center gap-1 flex-col`}>
                <label htmlFor={field.Field.toLowerCase()} className='capitalize text-[12px]'>{field.Field.split("_").join(" ").toUpperCase()}:</label>
                {tableSchema.find(schema => schema.name === field.Field && schema.isForeignKey) ? (
                    <select
                        className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2'
                        // value={""}
                        // defaultValue={editRowData && tableSchema.find(schema => schema.name === field.Field && schema.isForeignKey) ? editRowData[field.Field.toLowerCase()] : ''}
                        value={editRowData && relatedData[field.Field] ? relatedData[field.Field].find((obj) => Object.values(obj).some(value => String(value).toLowerCase() === String(inputValues[field.Field.toLowerCase()]).toLowerCase()))[tableSchema.find(schema => schema.name === field.Field).foreignKeyInfo.referencedColumn] : inputValues[field.Field.toLowerCase()]}
                        onChange={(e) => handleInputChange(e, field.Field.toLowerCase(), getInputType(field.Type))}
                    >
                      <option value=''>Select an option</option>
                      {relatedData[field.Field] && relatedData[field.Field].map(option => {
                        console.log(option, "This is the option")
                        const foreignKeyField = tableSchema.find(schema => schema.name === field.Field).foreignKeyInfo.referencedColumn;
                        console.log("Referenced field is", foreignKeyField)
                        return (
                            <option key={option[foreignKeyField]} value={option[foreignKeyField]}>{foreignKeyField === "id" ? option?.name : option[foreignKeyField]}</option>
                        );
                      })}
                    </select>
                ) : (
                    <input
                        type={getInputType(field.Type)}
                        placeholder={field.Field.split("_").join(" ").toLowerCase()}
                        className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2'
                        value={inputValues[field.Field.toLowerCase()]}
                        onChange={(e) => handleInputChange(e, field.Field.toLowerCase(), getInputType(field.Type))}
                    />
                )}
              </div>
          ))}
          <div className='col-span-2 w-full flex items-center gap-2 mt-3'>
            <button className='bg-[#002e54] text-white text-[12px] px-2.5 py-1.5 flex rounded-md justify-center items-center' onClick={handleSave}>
              {editRowData ? "Save" : "Add"}
            </button>
            <button className='bg-[#002e54] text-white text-[12px] px-2.5 py-1.5 flex rounded-md justify-center items-center' onClick={() => {
              setModalShowing(false)
              setEditRowData()
              setRelatedData()
            }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
  );
};

export default EditModal;