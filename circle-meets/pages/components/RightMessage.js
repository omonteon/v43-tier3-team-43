import ProfilePic from './ProfilePic'


const RightMessage = ({ message, sender, readCount }) => {
    return (
        <li className='self-end w-3/4 mb-4 mr-4'>
            <div className='border-2 rounded-md  bg-communixGreen p-1'>
                <p>{message}</p>
            </div>
            
            <p className='text-right text-xs'>{readCount == 0 ? ' ' : readCount}</p>
        </li>
    )
}

export default RightMessage