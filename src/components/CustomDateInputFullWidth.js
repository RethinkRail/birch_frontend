/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 2/13/2024, Tuesday
 * Description:
 **/
import React from "react";

const CustomDateInputFullWidth = ({value, onClick}) => (
    <div className="w-full mx-auto input-bordered rounded-l">
        <div onClick={onClick}
             className='flex items-center justify-between  border  rounded-[4px] w-full whitespace-nowrap overflow-hidden h-[32px] '>
            <p className='pl-[4px] py-[6px] input-bordered rounded-l'>{value}</p>


            <button className='mr-[1px]'>

            </button>
        </div>
    </div>
);

export default CustomDateInputFullWidth