/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 8/8/2024, Thursday
 * Description:
 **/

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DataTable from 'react-data-table-component';

const ReorderableTable = ({ workOrderData, columns,myStyles,conditionalRowStyles }) => {
    const [data, setData] = useState(workOrderData);

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;

        const reorderedData = Array.from(data);
        const [movedItem] = reorderedData.splice(result.source.index, 1);
        reorderedData.splice(result.destination.index, 0, movedItem);

        setData(reorderedData);
    };

    const CustomRow = ({ row, index, provided }) => (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
                ...provided.draggableProps.style,
                backgroundColor: 'white', // Adjust as needed
                padding: '8px',
                margin: '4px 0',
                borderRadius: '4px',
                border: '1px solid #ddd',
            }}
        >
            <DataTable
                columns={columns}
                data={[row]}
                noHeader={true}
                customStyles={myStyles}
            />
        </div>
    );

    return (
        <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="droppable-table">
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                        <DataTable
                            columns={columns}
                            data={data}
                            customStyles={myStyles}
                            noHeader={false} // Show header only once
                            dense={true} // Optional: Adjust based on your needs
                            highlightOnHover={true}
                        />
                        {data.map((item, index) => (
                            <Draggable key={item.dif} draggableId={String(item.dif)} index={index}>
                                {(provided) => (
                                    <CustomRow row={item} index={index} provided={provided} />
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default ReorderableTable;



