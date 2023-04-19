import Image from "next/image";
import { Inter } from "next/font/google";
import firebase from "firebase/app";
import "firebase/firestore";
import { useEffect, useRef, useState } from "react";

import Head from "next/head";
import { useRouter } from "next/router";
import Login from "./components/login-btn";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();


export default function Home() {
  const [showError, setShowError] = useState(false);
  const [roomId, setRoomId] = useState("");

  const router = useRouter();


  function copyRoomId(text) {
    navigator.clipboard.writeText(text).then(
      function () {
        alert("Id was copied successfully!");
      },
      function (err) {
        alert("Error: Could not copy id");
      }
    )

  }

  const joinRoom = () => {
    if (!roomId) {
      
    }
    router.push(`/room/${roomId || Math.random().toString(36).slice(2)}`);
  };

  return (
    <div className="flex flex-col min-h-screen white-grid">
      <Head>
        <title>Communix</title>
        <meta name="description" content="Video chatting for nerds" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="bg-communixPurple padding-8 col-start-2 row-start-1 col-span-3 row-span-2 py-8 border-2 border-communixRed flex flex-col justify-center items-center">
        <h1 className="font-dm text-5xl tracking-wider ">
          <span className="text-communixYellow">Com</span>
          <span className="text-communixGreen">mu</span>
          <span className="text-communixRed">nix</span>
        </h1>
      </header>
      <div className={showError ? "bg-communixRed col-start-6 row-start-3 col-span-2 row-span-4 flex flex-col items-center border-2 border-communixPurple" : "bg-communixYellow col-start-6 row-start-3 col-span-2 row-span-4 flex flex-col items-center border-2 border-communixRed"}>
        <h1 className="font-dm text-2xl text-communixPurple mb-4 mt-8">Lets get started!</h1>
        <label htmlFor="username" className="text-communixPurple text-left mb-2">Paste a room name</label>
        <div className="flex flex-row align-center">
          <div>
          <input
            onChange={(e) => setRoomId(e.target.value)}
            className="bg-communixWhite border-2 rounded-l-md border-communixPurple p-2 py-1 outline-none w-3/4 h-full"
          />
          <button
            className="px-2 h-full bg-communixGreen rounded-r-lg disabled:bg-communixRed border-2 border-l-0 border-communixPurple"
            onClick={() => joinRoom(roomId)}
            disabled={roomId.length > 2 ? false : true}> 
          Join
          </button>

        </div>
        <button
          className="px-2 h-full rounded-r-lg h-10 self-center"
          onClick={() => copyRoomId(roomId)}
        ><img src="/copy.png" alt="copy" className="h-6" /></button>
        </div>
        
        <p className="text-communixPurple bg-communixWhite mb-4">{showError && "longer!"}</p>
        <button type="button" onClick={() => roomId.length > 2 ? joinRoom() : errorMessage()} className="bg-communixGreen border-2 rounded-md px-4 py-1 w-1/3 mb-4 boxShadow">
          Create a new room
        </button>

      </div>


    </div>
  )
}