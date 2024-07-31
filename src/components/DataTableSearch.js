/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 7/31/2024, Wednesday
 * Description:
 **/

import React from 'react';

const DataTableSearch = ({ searchTerm, setSearchTerm }) => {
    return (
        <input className="p-1"
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
        />
    );
};

export default DataTableSearch;
