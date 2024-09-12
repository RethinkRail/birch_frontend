/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 9/5/2024, Thursday
 * Description:
 **/

import React, {useMemo, useState} from 'react';
import {MaterialReactTable, useMaterialReactTable} from "material-react-table";






const DataTableComponent = ({ tableData }) => {
    const [columnVisibility, setColumnVisibility] = useState({
        id:false
    });
    const columns = useMemo([
        { accessorKey: 'id', header: 'Id', size: 3, sortable: true, omit: true },
        { accessorKey: 'railcar_id', header: 'RFID', size: 3, sortable: true },
        { accessorKey: 'owner', header: 'Owner', size: 3, sortable: true },
        { accessorKey: 'lessee', header: 'Lessee', size: 3, sortable: true },
        { accessorKey: 'type', header: 'Type', size: 3, sortable: true },
        { accessorKey: 'products', header: 'Products', size: 3, sortable: true },
        { accessorKey: 'workupdate_code', header: 'Status', size: 3, sortable: true },
        { accessorKey: 'inspected_date', header: 'Inspected Date', size: 3, sortable: true },
        { accessorKey: 'material_eta', header: 'Material Eta', size: 3, sortable: true },
        { accessorKey: 'clean_date', header: 'Clean Date', size: 3, sortable: true },
        { accessorKey: 'repair_schedule_date', header: 'Repair Schedule Date', size: 3, sortable: true },
        { accessorKey: 'paint_date', header: 'Paint Date', size: 3, sortable: true },
        { accessorKey: 'valve_date', header: 'Valve Date', size: 3, sortable: true },
        { accessorKey: 'pd_date', header: 'Pd Date', size: 3, sortable: true },
        { accessorKey: 'final_date', header: 'Final Date', size: 3, sortable: true },
        { accessorKey: 'qa_date', header: 'Qa Date', size: 3, sortable: true },
        { accessorKey: 'projected_out_date', header: 'Projected Out Date', size: 3, sortable: true },
        { accessorKey: 'month_to_invoice', header: 'Month to Invoice', size: 3, sortable: true },
        { accessorKey: 'mo_wk', header: 'Mo Wk', size: 3, sortable: true },
        { accessorKey: 'sp', header: 'Sp', size: 3, sortable: true },
        { accessorKey: 'tq', header: 'Tq', size: 3, sortable: true },
        { accessorKey: 're', header: 'Re', size: 3, sortable: true },
        { accessorKey: 'exterior_paint', header: 'Exterior Paint', size: 3, sortable: true },
        { accessorKey: 'indirect_labor_man_hour_estimated', header: 'Indirect Labor Man Hour Estimated', size: 3, sortable: true },
        { accessorKey: 'indirect_labor_man_hour_applied', header: 'Indirect Labor Man Hour Applied', size: 3, sortable: true },
        { accessorKey: 'indirect_switching_man_hour_estimated', header: 'Indirect Switching Man Hour Estimated', size: 3, sortable: true },
        { accessorKey: 'indirect_switching_man_hour_applied', header: 'Indirect Switching Man Hour Applied', size: 3, sortable: true },
        { accessorKey: 'maintenance_man_hour_estimated', header: 'Maintenance Man Hour Estimated', size: 3, sortable: true },
        { accessorKey: 'maintenance_man_hour_applied', header: 'Maintenance Man Hour Applied', size: 3, sortable: true },
        { accessorKey: 'pd_man_hour_estimated', header: 'Pd Man Hour Estimated', size: 3, sortable: true },
        { accessorKey: 'pd_man_hour_applied', header: 'Pd Man Hour Applied', size: 3, sortable: true },
        { accessorKey: 'clean_man_hour_estimated', header: 'Clean Man Hour Estimated', size: 3, sortable: true },
        { accessorKey: 'clean_man_hour_applied', header: 'Clean Man Hour Applied', size: 3, sortable: true },
        { accessorKey: 'valve_man_hour_estimated', header: 'Valve Man Hour Estimated', size: 3, sortable: true },
        { accessorKey: 'valve_man_hour_applied', header: 'Valve Man Hour Applied', size: 3, sortable: true },
        { accessorKey: 'paint_man_hour_estimated', header: 'Paint Man Hour Estimated', size: 3, sortable: true },
        { accessorKey: 'paint_man_hour_applied', header: 'Paint Man Hour Applied', size: 3, sortable: true },
        { accessorKey: 'repair_man_hour_estimated', header: 'Repair Man Hour Estimated', size: 3, sortable: true },
        { accessorKey: 'repair_man_hour_applied', header: 'Repair Man Hour Applied', size: 3, sortable: true },
        { accessorKey: 'admin_man_hour_estimated', header: 'Admin Man Hour Estimated', size: 3, sortable: true },
        { accessorKey: 'admin_man_hour_applied', header: 'Admin Man Hour Applied', size: 3, sortable: true },
        { accessorKey: 'total_cost', header: 'Total Cost', size: 3, sortable: true },

    ],[]);
    const table = useMaterialReactTable({
        columns,
        data: tableData,
        enablePagination: false,
        enableFilters: false,
        enableColumnFilters:false,
        enableSorting:false,
        enableExpandAll:false,
        enableColumnActions:false,
        enableDensityToggle:false,
        enableExpanding:false,
        enableFullScreenToggle:false,
        enableGrouping:false,
        enableRowOrdering:true,
        enableTopToolbar:false,
        enableStickyHeader: true,
        enableStickyFooter: true,
        enableColumnPinning: true,
        initialState: { columnVisibility: { id: false } ,columnPinning: { left: ['railcar_id'] } },
        state: { columnVisibility },
        onColumnVisibilityChange: setColumnVisibility,
    });

    return (

        <MaterialReactTable
            table={table}
            className="custom-table"
        />
    );
};

export default DataTableComponent;
