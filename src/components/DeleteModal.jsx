const DeleteModal = ({ handleDelete, setDeleteModalShowing, setRowId, setRowCode }) => {
    return (
        <div className="fixed inset-0 top-0 left-0 w-full h-full  flex justify-center items-center backdrop-blur-sm"
             onClick={() => {
                 setRowId()
                 setRowCode()
                 setDeleteModalShowing((prev) => (!prev))
             }}>
            <div className="bg-white rounded-md flex flex-col gap-2 shadow-md p-4"
                 onClick={(e) => e.stopPropagation()}
                 style={{ transform: 'translate(-50%, -50%)', position: 'absolute', top: '50%', left: '50%' }}>
                <p>Are you sure you want to delete this entry?</p>
                <div className="flex items-center flex-row gap-2 justify-start">
                    <button className="bg-[#002e54] text-[#ffffff] px-2 py-1.5 rounded-md" onClick={() => {
                        setRowCode()
                        setRowId()
                        setDeleteModalShowing(false)
                    }}>
                        Cancel
                    </button>
                    <button className="bg-[#002e54] text-[#ffffff] px-2 py-1.5 rounded-md" onClick={handleDelete}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}



export default DeleteModal
