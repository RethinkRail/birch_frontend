/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 10/18/2024, Friday
 * Description:
 **/

import React from "react";

function LogDetails({ logs, onClose }) {
    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Log Details</h2>
            <ul className="list-disc pl-5">
                {logs.map((log, index) => (
                    <li key={index} className="mb-2">
                        <strong>Description:</strong> {log.job_description} <br />
                        <strong>Start Time:</strong> {new Date(log.start_time).toLocaleString()} <br />
                        <strong>End Time:</strong> {new Date(log.end_time).toLocaleString()} <br />
                        <strong>Logged Time (seconds):</strong> {log.logged_time_in_seconds} <br />
                        <strong>Notes:</strong> {log.notes}
                    </li>
                ))}
            </ul>
            <button
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                onClick={onClose}
            >
                Close
            </button>
        </div>
    );
}

export default LogDetails;
