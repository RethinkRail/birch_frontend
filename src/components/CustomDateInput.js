/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 2/13/2024, Tuesday
 * Description:
 **/
import React from "react";

const CustomDateInput = ({value, onClick}) => (
    <div className="w-fit ">
        <div onClick={onClick}
             className='flex items-center justify-between  border  rounded-[4px] w-[90px] whitespace-nowrap overflow-hidden h-[32px] '>
            <p className='pl-[4px] py-[6px]'>{value}</p>
        </div>
    </div>
);

export default CustomDateInput