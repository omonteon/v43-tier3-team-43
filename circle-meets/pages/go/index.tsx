import Chat from '../components/Chat'

const Conversation = () => {
    const user = {
        id: 'joe'
    }
    const users = [
        {name: 'joe', id: 2, imageUrl: 'https://i.imgur.com/8Km9tLL.png'},
        {name: 'sam', id: 1, imageUrl: 'https://i.imgur.com/8Km9tLL.png'}
    ]
    const conversation = [
        {
            id: 1,
            sender: 'sam',
            body: 'hey',
            timeStamp: new Date(),
            readBy: ['joe']
        },
        {
            id: 2,
            sender: 'joe',
            body: 'hey!',
            timeStamp: new Date(),
            readBy: ['sam']
        },
        {
            id: 1,
            sender: 'sam',
            body: 'how are you?',
            timeStamp: new Date(),
            readBy: []
        },
        {
            id: 1,
            sender: 'sam',
            body: 'I\'m good, but what about you?',
            timeStamp: new Date(),
            readBy: []
        },
        {
            id: 1,
            sender: 'sam',
            body: 'hellooooo?',
            timeStamp: new Date(),
            readBy: []
        },
        {
            id: 1,
            sender: 'sam',
            body: 'You\'re uly anyway',
            timeStamp: new Date(),
            readBy: []
        },
    ]
    return <Chat user={user} users={users} conversation={conversation} />
}

export default Conversation