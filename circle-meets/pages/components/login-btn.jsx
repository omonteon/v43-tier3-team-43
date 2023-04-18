import { useSession, signIn, signOut } from "next-auth/react";
import React, {useEffect, useState} from "react";
import { redirect } from 'next/navigation';

export default function Login() {
  const { data: session } = useSession();
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    if (!registered) {
      if (session && session.user && session.user.email) {
        createUser(session.user.name, session.user.email)
        setRegistered(true)
        //
        //redirect('/')
      }
    }
  }, [session])


  function handleLogin() {
    signIn()
    if (session && session.user && session.user.email) {
      console.log("user exists already")
    }
  }

  if (session) {
    return (
      <>
        Signed in as {session.user.name} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return (
    <>
      You are not signed in <br />
      <button onClick={() => handleLogin()}>Sign in</button>
    </>
  );

}

async function createUser(name, email) {
  const myName = await fetch(
    '/api/register',
    {
      method: 'POST',
      body: JSON.stringify({ email, displayName: name }),
      headers: {
        //'Content-Type': 'application/json',
        Accept: 'application/json'
      }

    })
    .then((res) => res.json())
    .then(res => console.log("user exists already"))
}

