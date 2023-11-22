import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Modal from 'react-modal';

const DatePickerDialog = ({ isOpen, onClose }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="DatePicker Dialog"
        >
            <h2>Select a Date</h2>
            <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="MM/dd/yyyy"
            />
            <button onClick={() => onClose(selectedDate)}>Select</button>
        </Modal>
    );
};

export default DatePickerDialog;
