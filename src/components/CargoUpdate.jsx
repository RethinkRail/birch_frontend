import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CargoUpdate = ({ editRowData, tableSchema, inputValues, setInputValues, relatedData, setRelatedData, cargoNumber }) => {

  const fields = [{Field: "rfid", Type: "string"}, {Field: "type_id", Type: "int"}, {Field: "owner_id", Type: "int"}, {Field: "lessee_id", Type: "int"}, {Field: "last_product_id", Type: "int"}]
  const selectedTable = "cargo"


    // Setting the initial value of the input field when the modal appears
  useEffect(() => {
    if (editRowData) {
      console.log(editRowData, "This is the edit row data")

      const inputValueCopy = {...editRowData}
      if(relatedData) {
        for(const key in inputValueCopy) {
          const field = fields.find(field => field.Field.toLowerCase() === key);
          if (field && tableSchema.some(schema => schema.name === field.Field && schema.isForeignKey) && inputValues[key] !== null) {
            inputValueCopy[key] = relatedData[field.Field].find((obj) => Object.values(obj).some(value => String(value).toLowerCase() === String(inputValues[field.Field.toLowerCase()]).toLowerCase()))[tableSchema.find(schema => schema.name === field.Field).foreignKeyInfo.referencedColumn]
          }
        }
      }
      setInputValues(inputValueCopy);
    } else {
      const initialState = {};
      fields.filter(field => field.Field.toLowerCase() !== "id").forEach(field => {
            if(field.Field.toLowerCase() === "rfid") {
                console.log(`The rfid field is set to ${cargoNumber}`)
                initialState[field.Field.toLowerCase()] = cargoNumber;
            } else {
                initialState[field.Field.toLowerCase()] = '';
            }
        // Initial values can be set here
      });
      setInputValues(initialState);
    }
  }, [editRowData, relatedData]);

  useEffect(() => {
    const fetchRelatedData = async () => {
      const relatedDataPromises = tableSchema
        .filter(fld => fld.isForeignKey)
        .map(async field => {
          const response = await axios.get(`${process.env.REACT_APP_BB_API_URL}table?table=${field.foreignKeyInfo.referencedTable}`);
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
    console.log("Input changed", value, fieldName, type)
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

  return (
      <div className='bg-white rounded-md shadow-md grid grid-cols-2 gap-1.5 p-3' onClick={(e) => e.stopPropagation()}>
        {relatedData && fields.filter(field => field.Field.toLowerCase() !== "rfid").map((field, index) => (
          <div key={`field--edit--${index}`} className={`${field.Field.toLowerCase() === "id" || (editRowData && field.Field.toLowerCase() === "updated_by") || (field.Field.toLowerCase() === "last_update") ? "hidden" : ""} col-span-1 flex justify-center gap-1 flex-col`}>
            <label htmlFor={field.Field.toLowerCase()} className='capitalize text-[12px]'>{field.Field.split("_").join(" ").toUpperCase()}:</label>
            {tableSchema.find(schema => schema.name === field.Field && schema.isForeignKey) ? (
              <select
                className='p-1 rounded-md border-[1px] border-solid border-[#002e54] outline-none text-[12px] px-2'
                value={inputValues[field.Field] !== null ? inputValues[field.Field.toLowerCase()] : ""}
                onChange={(e) => handleInputChange(e, field.Field.toLowerCase(), getInputType(field.Type))}
              >
                <option value=''>Select an option</option>
                {relatedData[field.Field] && relatedData[field.Field].map(option => {
                  console.log(option, "This is the option")
                  console.log("Recent value is", inputValues[field.Field.toLowerCase()])
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

        </div>
  );
};

export default CargoUpdate;