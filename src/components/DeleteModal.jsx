const DeleteModal = ({handleDelete, setDeleteModalShowing, setRowId, setRowCode}) => {
    return (
        <div className="absolute h-[100vh] w-full bg-[#2e2b2b40] flex flex-1 justify-center items-center"
             onClick={() => {
                 setRowId()
                 setRowCode()
                 setDeleteModalShowing((prev) => (!prev))
             }}>
            <div className="bg-white rounded-md flex flex-col gap-2 shadow-md p-4" onClick={(e) => e.stopPropagation()}>
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
