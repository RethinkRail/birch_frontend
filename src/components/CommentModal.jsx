import React, {useRef, useState} from 'react';
import {convertSqlToFormattedDateTime} from "../utils/DateTimeHelper";
import qs from "qs";
import axios from "axios";

const CommentModal = ({data, work_id, updateWorkUpdates}) => {
    //data.sort((a, b) => new Date(a.update_date) - new Date(b.update_date));
    const groupedItems = {};
    const commentModal = document.getElementById('commentModal');
    const statusTextArea = useRef(null);
    const [disbaleSaveButton,setDisableSaveButton] = useState(false)
    data.forEach(item => {
        const statusKey = `${item.status_id}-${item.statuscode.title}`;
        if (!groupedItems[statusKey]) {
            groupedItems[statusKey] = {
                status_id: item.status_id,
                comment_date: convertSqlToFormattedDateTime(item.update_date),
                title: item.statuscode.title,
                names: [],
                comments: [],
            };
        }
        groupedItems[statusKey].names.push(item.user.name);
        groupedItems[statusKey].comments.push(item.comment);
    });
    // console.log(Object.values(groupedItems))
    // const sorted_grouped_items = Object.values(groupedItems).sort((a,b)=>a.status-b.status)
    // console.log(sorted_grouped_items)
    //console.log(groupedItems[groupedItems.length-1])
    const closeModal = () => {
        if (commentModal) {
            statusTextArea.current.value = ''
            commentModal.close();
        }
    }
    const saveNewComment = () => {
        setDisableSaveButton(true)
        const newComment = getValueById("new_comment")
        if (newComment.length > 0) {
            // Call API
            let data = qs.stringify({
                'work_id': work_id,
                'user_id': JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id'],
                'status_id': Object.values(groupedItems)[0].status_id,
                'source': "home_page",
                'comment': newComment
            });

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: process.env.REACT_APP_BIRCH_API_URL + 'post_work_updates',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: data
            };

            axios.request(config)
                .then((response) => {
                    updateWorkUpdates(work_id, response.data, Object.values(groupedItems)[0].status_id)
                    setDisableSaveButton(false)
                    if (commentModal) {
                        statusTextArea.current.value = ''
                        commentModal.close();
                    }
                })
                .catch((error) => {
                    console.log(error);
                    setDisableSaveButton(false)
                    if (commentModal) {
                        statusTextArea.current.value = ''
                        commentModal.close();
                    }
                });
        } else {
            setDisableSaveButton(false)
            if (commentModal) {
                statusTextArea.current.value = ''
                commentModal.close();
            }
        }
    }
    const getValueById = (id) => {
        const element = statusTextArea.current;
        if (element && element.id === id) {
            return element.value;
        }
        return null;
    };
    return (
        <dialog id="commentModal" className="modal rounded-md">
            <div className="bg-white  max-h-[95vh] w-[600px] pb-5 rounded-md overflow-auto">
                <div
                    className="w-[600px] fixed h-[60px]  bg-[#DCE5FF] px-6 py-[18px] text-xl font-semibold flex justify-between">
                    Comments
                    <form method="dialog">
                        <button className="">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="#464646" strokeWidth="2" strokeLinecap="round"
                                      strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </form>
                </div>
                <div className='mt-[65px]'/>
                {Object.values(groupedItems).map((groupedItem, index) => (
                    <div key={index} className="border my-2 rounded  border-[#D0D5DD] p-[14px] mx-[24px]">
                        <h2 className='font-semibold text-black-300'>{groupedItem.status_id + " : " + groupedItem.title}</h2>
                        {groupedItem.names.map((name, i) => (
                            <div className='flex justify-between my-1 text-[16px]'>
                                <span className='w-1/4'><h6 className='font-medium'>{name}</h6> <span
                                    className='font-normal italic '>{groupedItem.comment_date}</span></span>
                                <span className='w-3/4 font-light'> {groupedItem.comments[i]}</span>
                            </div>
                        ))}
                    </div>
                ))}

                <div className="mx-[24px] mb-[28px] mt-[24px] ">
                    <p className='text-[14px] font-medium mb-[3px]'>Add New Comment</p>
                    <input type="text" className='input w-full input-bordered' id="new_comment" ref={statusTextArea}/>
                </div>

                <div className="mx-[24px] flex justify-end">
                    <button
                        className="btn text-[#464646] bg-white hover:bg-white border border-[#464646] w-[106px] h-[40px] px-[30px] py-[10px]"
                        onClick={closeModal}>
                        close
                    </button>
                    <button
                        className={`btn text-white bg-[#002E54] hover:bg-[#002E54] ml-[12px] w-[106px] h-[40px] px-[30px] py-[10px] ${
                            disbaleSaveButton ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={saveNewComment}
                        disabled={disbaleSaveButton}
                    >
                        Save
                    </button>
                </div>
            </div>
        </dialog>
    );
};

export default CommentModal;