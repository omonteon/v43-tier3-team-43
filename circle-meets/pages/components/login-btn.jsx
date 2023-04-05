import { useSession, signIn, signOut, getSession } from "next-auth/react";
import React from "react";

export default function Login() {
  const { data: session, status } = useSession();
  if (status === "authenticated") {
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
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  //   if (!session) {
  //     return {
  //       redirect: {
  //         destination: "./Login",
  //       },
  //     };
  //   }
  return {
    props: { session },
  };
};
