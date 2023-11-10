import React from 'react';

const CommentModal = ({ data }) => {
    const groupedItems = {};

    data.forEach(item => {
        const statusKey = `${item.status_id}-${item.statuscode.title}`;
        if (!groupedItems[statusKey]) {
            groupedItems[statusKey] = {
                status_id: item.status_id,
                title: item.statuscode.title,
                names: [],
                comments: [],
            };
        }
        groupedItems[statusKey].names.push(item.user.name);
        groupedItems[statusKey].comments.push(item.comment);
    });

    return (
        <div>
            <dialog id="commentModal" className="modal">
                <div className="bg-white  max-h-[95vh] w-[900px] pb-5 rounded overflow-auto">
                    <div className="w-[900px] fixed h-[60px]  bg-[#F5F5F5] px-6 py-[18px] text-2xl font-semibold flex justify-between">
                        Comments
                        <form method="dialog">
                            <button className="">

                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="#464646" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button>
                        </form>
                    </div>
                    <div className='mt-[65px]' />
                    {Object.values(groupedItems).map((groupedItem, index) => (
                        <div key={index} className="border my-2 rounded  border-[#D0D5DD] p-[14px] mx-[24px]">
                            <h2 className='font-semibold text-2xl'>{groupedItem.status_id + ": " + groupedItem.title}</h2>

                            {groupedItem.names.map((name, i) => (
                                <div className='flex justify-between my-6 text-[16px]'>
                                    <span className='w-1/4'><h4 className='font-medium'>Created By</h4>{name}</span>
                                    <span className='w-3/4'><h4 className='font-medium'>Comment</h4> {groupedItem.comments[i]}</span>

                                </div>
                            ))}
                        </div>
                    ))}

                    <div className="mx-[24px] mb-[28px] mt-[24px] ">
                        <p className='text-[14px] font-medium mb-[3px]'>Add New Comment</p>
                        <input type="text" className='input w-full input-bordered' />
                    </div>

                    <div className="mx-[24px] flex justify-end">
                        <form method="dialog">
                            <button className="btn text-[#464646] bg-white hover:bg-white border border-[#464646] w-[106px] h-[40px] px-[30px] py-[10px]">
                                close
                            </button>
                            <button className="btn text-white bg-[#002E54] hover:bg-[#002E54] ml-[12px] w-[106px] h-[40px] px-[30px] py-[10px]">
                                save
                            </button>
                        </form>
                    </div>
                </div>
            </dialog>
        </div>
    );
};

export default CommentModal;