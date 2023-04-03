

export type UserType = {
    id: number,
    username: string,
    bio: string,
    displayName: string,
    imageUrl: string,
    status: string
}

export type MessageType = {
    id: number,
    sender: number,
    body: string,
    timestamp: Date,
    readBy: number[]
}