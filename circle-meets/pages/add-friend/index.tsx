import React, { useState } from "react";
import Head from "next/head";
import BackButton from "../components/BackButton";
import { PrismaClient } from "@prisma/client"
import { DebounceInput } from 'react-debounce-input'

const prisma = new PrismaClient()

export default function AddFriend({ users }) {
  const [friendId, setFriendId] = useState("");

  const [search, setSearch] = useState('')
    const filteredUsers = search == '' ? [] : users.filter(user => user.displayName.toLowerCase().includes(search.toLowerCase()))

    console.log(filteredUsers, search, users[0].displayName.toLowerCase().includes(search.toLowerCase()))

    function filterUsers(e) {
        setSearch(e.target.value)
    }

  const handleAddFriend = () => {
    console.log("Add new friend");
    // TODO: Validate if friendId is valid
    // TODO: Implement call to backend to add new friend
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === " " || event.key === "Enter") {
      handleAddFriend();
    }
  };

  const handleChangeFriendId = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFriendId(event.target.value);
  };

  return (
    <>
      <Head>
        <title>Communix</title>
        <meta name="description" content="Video chatting for nerds" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="font-dm flex flex-col text-center min-h-screen bg-communixRed p-2 justify-center  items-center md:block md:items-start md:text-left">
        <BackButton />
        <div className="md:mt-12 md:ml-4">
          <h1 className="text-cyan text-4xl mb-1">Add a friend</h1>
          <label htmlFor="friendId" className="inline-block">
            Enter their id or email:
          </label>
          <div className="relative mt-6 sm:w-64">
            <div className="border-2 border-black rounded-md px-2 flex items-center">
              
              <DebounceInput 
                className="bg-communixRed outline-none flex-1 h-8"
                type="text" 
                placeholder="Search for users..." 
                value={search} 
                onChange={(e) => filterUsers(e)} 
                minLength={1}
                debounceTimeout={300}
            />
              <div
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={handleAddFriend}
                onKeyUp={handleKeyDown}
                aria-label="Add a friend"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              
            </div>
            <ul>
                {filteredUsers.map(user => (
                    <li key={user.id}>{user.displayName}</li>
                ))}
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}

export async function getStaticProps() {
  const users = await prisma.user.findMany()
  return {
      props: { users: users}
  }
}





