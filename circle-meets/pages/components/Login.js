import { useRef, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const Login = (props) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: props.id,
    });
    const [roomName, setRoomName] = useState("");

    const style = {
        // Outputs `translate3d(x, y, 0)`
        transform: CSS.Translate.toString(transform),
    };

    const joinRoom = () => {
        router.push(`/room/${roomName || Math.random().toString(36).slice(2)}`);
    };

    return (
        <div
            className='bg-communixYellow border-2 p-2 flex flex-col w-1/6'
            {...listeners}
            {...attributes}
            ref={setNodeRef}
            style={style}>
            <h2 className="font-dm text-3xl mb-2 ">Login</h2>
            <input
                id='login'
                onChange={(e) => setRoomName(e.target.value)}
                value={roomName}
                hidden
            />
            <label htmlFor="username" className="font-dm text-xl mb-2">Username</label>
            <input
                id='username'
                className='bg-communixWhite border-2 rounded-md p-1 font-dm mb-2 outline-none'
            />
            <label htmlFor="password" className="font-dm text-xl mb-2">Username</label>
            <input
                id='password'
                className='bg-communixWhite border-2 rounded-md p-1 font-dm mb-2 outline-none active:shadow-button '
                type='password'
            />
            <div className="flex flex-row justify-between ">
                <a href='#' className="underline font-dm">forgot password</a>
                <button
                    onClick={joinRoom}
                    type="button"
                    className="bg-communixGreen font-dm border-2 rounded-md p-1 px-2 shadow-button hover:mt-1 hover:shadow-none"
                >
                    Login
                </button>
            </div>
        </div>
    )
}

export default Login