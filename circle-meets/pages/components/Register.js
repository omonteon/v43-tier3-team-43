

const Register = () => {

    return (
        <div
            className="bg-communixRed w-5/12 border-2 p-2 flex flex-col"
        >
            <h2 className="font-dm text-3xl mb-2 ">Register</h2>
            <label htmlFor="username-register" className="font-dm text-xl mb-2">Username</label>
            <input
                id='username-register'
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
                    type="button"
                    className="bg-communixGreen font-dm border-2 rounded-md p-1 px-2 shadow-button hover:mt-1 hover:shadow-none"
                >
                    Login
                </button>
            </div>
        </div>
    )
}

export default Register