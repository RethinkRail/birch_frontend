
import {Toast} from "flowbite-react";

const ToastHandler = ({ onClose, data }) => {
    return (
        <Toast show={true} onClose={onClose} delay={9000} autohide>
            <Toast.Header>
                <img src={data.image} className="rounded me-2" alt="" />
                <strong className="me-auto">{data?.title}</strong>
                <small></small>
            </Toast.Header>
            <Toast.Body>
                <div className='p-2'>
                    {data?.body}
                </div>
            </Toast.Body>
        </Toast>
    )
}

export default ToastHandler;