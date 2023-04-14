import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Login from "./components/login-btn";

export default function Home() {
  const [parent, setParent] = useState(null);
  const [nickName, setName] = useState("");
  const [showError, setShowError] = useState(false);

  const router = useRouter();

  useEffect(() => {
    localStorage.setItem("nickname", nickName);
  }, [nickName]);
  const joinRoom = () => {
    router.push(`/room/${nickName || Math.random().toString(36).slice(2)}`);
  };

  function errorMessage() {
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
    }, 3000);
    
  }

  return (
    <div className="flex flex-col min-h-screen white-grid">
      <Head>
        <title>Communix</title>
        <meta name="description" content="Video chatting for nerds" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col p-4 justify-around text-center md:p-0 md:grid md:grid-rows-12 md:grid-cols-8 h-screen">
        <header className="bg-communixPurple padding-8 col-start-2 row-start-1 col-span-3 row-span-2 py-8 border-2 border-communixRed flex flex-col justify-center items-center">
          <h1 className="font-dm text-5xl tracking-wider ">
            <span className="text-communixYellow">Com</span>
            <span className="text-communixGreen">mu</span>
            <span className="text-communixRed">nix</span>
          </h1>
        </header>
        <div className={showError ? "bg-communixRed col-start-6 row-start-3 col-span-2 row-span-4 flex flex-col items-center border-2 border-communixPurple" : "bg-communixYellow col-start-6 row-start-3 col-span-2 row-span-4 flex flex-col items-center border-2 border-communixRed"}>
          <h1 className="font-dm text-2xl text-communixPurple mb-4 mt-8">Lets get started!</h1>
          <label htmlFor="username" className="text-communixPurple text-left mb-2">Nick name</label>
          <input
            onChange={(e) => setName(e.target.value)}
            className="bg-communixWhite border-2 rounded-md border-communixPurple p-2 py-1 outline-none w-3/4"
          />
          <p className="text-communixPurple bg-communixWhite mb-4">{showError && "longer!"}</p>
          <button type="button" onClick={() => nickName.length > 2 ? joinRoom() : errorMessage()} className="bg-communixGreen border-2 rounded-md px-4 py-1 w-1/3 mb-4 boxShadow">
            Chat
          </button>
        </div>
        <div className="col-start-2 row-start-5 col-span-2 p-2 bg-communixRed flex flex-col justify-center border-2 border-communixGreen">
          <p>
          Communix is a video chat app that allows you to chat with your friends and family. Totally free, no cookies, no email, no nothing.
          </p>
        </div>

        <footer className="bg-communixWhite col-start-1 col-span-11 row-start-7 flex flex-row justify-evenly items-center py-6">
            <p className="text-opacity-25 sm:text-center text-sm text-gray-500">
              Made with ❤️ by Ethan Lee, Omar & Tijana</p>
            <p className="hidden md:text-communixPurple">
              © 2023 Communix is copyright 2023
            </p>
        </footer>
      </main>

    </div>
  );

  function handleDragEnd({ over }) {
    setParent(over ? over.id : null);
  }
}
