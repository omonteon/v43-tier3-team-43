import { PrismaClient } from "@prisma/client"
import { useState } from 'react'
import { DebounceInput } from 'react-debounce-input'

const prisma = new PrismaClient()

export default function Users({ users }) {
    const [search, setSearch] = useState('')
    const filteredUsers = search == '' ? [] : users.filter(user => user.displayName.toLowerCase().includes(search.toLowerCase()))

    console.log(filteredUsers, search, users[0].displayName.toLowerCase().includes(search.toLowerCase()))

    function filterUsers(e) {
        setSearch(e.target.value)
    }
 
    return (
        <div>
            <h1>Users</h1>
           <DebounceInput 
                type="text" 
                placeholder="Search for users..." 
                value={search} 
                onChange={(e) => filterUsers(e)} 
                minLength={1}
                debounceTimeout={300}
            />
        
            <ul>
                {filteredUsers.map(user => (
                    <li key={user.id}>{user.displayName}</li>
                ))}
            </ul>
        </div>
    )
}


export async function getStaticProps() {
    const users = await prisma.user.findMany()
    return {
        props: { users: users}
    }
}
