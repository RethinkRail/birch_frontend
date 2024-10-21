/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 10/21/2024, Monday
 * Description:
 **/

import React from 'react';


export const ParentModal = ({ title, children, onClose }) => (
    <div className="modal-backdrop">
        <div className="modal-content">
            <h1>{title}</h1>
            {children}
            <button onClick={onClose}>Close</button>
        </div>
    </div>
);
