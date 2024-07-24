/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 2/13/2024, Tuesday
 * Description: Modal to put comment when status is being changed
 **/

import React from 'react';
import Modal from 'react-modal';

const StatusChangeDropDownModal = ({isOpen, onRequestClose, parentSelector, contentLabel}) => {

    const customStylesForCommentModal = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            width: '400px',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
        },
    };
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            parentSelector={parentSelector}
            contentLabel="POST COMMENT"
            style={customStylesForCommentModal}
        >
           <textarea
               id="statusUpdateMessageFromDropDownInDetails"
               rows="2"
               // ref={statusCommentDropDownInDetails}
               className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 my-4"
               placeholder="Write your comments here..."
           ></textarea>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">SUBMIT</button>
        </Modal>
    );
};

export default StatusChangeDropDownModal;
