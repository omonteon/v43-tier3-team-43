import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default function Users({ users }) {
    return (
        <div>
            <h1>Users</h1>
            <ul>
                {users.map(user => (
                    <li key={user.id}>{user.email}</li>
                ))}
            </ul>
        </div>
    )
}


export async function getStaticProps() {
    const users = await prisma.user.findMany()
    return {
        props: {
            users
        }
    }
}
