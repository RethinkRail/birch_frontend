/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 1/25/2024, Thursday
 * Description: This files contains  reusable  js method , that might be used across the project
 **/

import {useState} from "react";
import {toast} from "react-toastify";

/**
 * This method will  update an object inside array of object by object property
 * @param array
 * @param idToUpdate
 * @param updatedProperties
 * @returns update array
 */
export function updateObjectById(array, idToUpdate, updatedProperties) {
    // Find the index of the object with the specified id
    let modifiedArray = []
    const index = array.findIndex(obj => obj.id === idToUpdate);
    // If the object with the specified id is found
    if (index !== -1) {
        // Update the object with the new properties
        array[index] = {...array[index], ...updatedProperties};
    }
    modifiedArray.push(...array)
    return modifiedArray
}

/**
 * This method will  update an object inside array of object by object property and return modified array
 * @param array
 * @param property
 * @param id
 * @param update
 * @returns {*}
 */
export function updateObjectByIdInsideArray(array, property, id, update) {
    return array.map(obj => {
        if (obj[property] === id) {
            // If the property matches the desired value, update the object
            return {...obj, ...update};
        }
        // If the property doesn't match, return the original object
        return obj;
    });
}

/**
 * remove an object inside array of object by object property
 * @param array
 * @param idToRemove
 * @returns {*}
 */
export function removeObjectByProperty(array, propertyName, propertyValue) {
    // Use filter to create a new array excluding objects with the specified property value
    const newArray = array.filter(obj => obj[propertyName] !== propertyValue);
    array.length = 0; // Clear the existing array
    array.push(...newArray); // Push elements from the new array into the existing one
    return newArray;
}

export function arraysAreEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}

/**
 * This method is used for solving lag in text input
 * @param onUpdate
 * @returns {JSX.Element}
 * @constructor
 */
export function ControlledTextArea({id, rows, className, placeholder, onChange, onUpdate}) {
    const [value, setState] = useState('');

    const handleChange = e => {
        setState(e.target.value);
        onUpdate(e.target.value, id); // Pass id to onUpdate
        // Call the provided onChange function if available
        if (onChange) {
            onChange(e); // Pass id to onChange
        }
    };

    return (
        <textarea
            id={id}
            placeholder={placeholder}
            rows={rows}
            value={value}
            onChange={handleChange}
            className={className}
        />
    );
}

/**
 *
 * @param message message to display as toast
 * @param type should be an integer for success 1, for error 2 , for warning 3
 */
export const showToastMessage = (message, type) => {

    switch (type) {
        case 1:
            toast.success(message, {
                autoClose: 2000,
                hideProgressBar: true,
            });
            break;

        case 2:
            toast.error(message, {
                autoClose: 3000,
                hideProgressBar: true,
            });
            break;
        case 3:
            toast.warning(message, {
                autoClose: 2000,
                hideProgressBar: true,
            });
            break;
    }
};