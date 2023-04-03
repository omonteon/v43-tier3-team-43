import ProfilePic from './ProfilePic'

const LeftMessage = ({ message, sender, readCount }) => {
    console.log(readCount, message)
    return (
                <li className='self-start w-3/4 mb-4 ml-4'>
                    <ProfilePic user={sender} />
                    <div className='border-2 rounded-md  bg-communixYellow p-1'>
                        <p>{message}</p>
                    </div>
                    <p className='text-right text-xs'>{readCount == 0 ? ' ' : readCount}</p>
                </li>
    )
}

export default LeftMessage