import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");

  const joinRoom = () => {
    router.push(`/room/${roomName || Math.random().toString(36).slice(2)}`);
  };

  return (
    <div className="flex flex-col min-h-screen ">
      <Head>
        <title>Communix</title>
        <meta
          name="description"
          content="Use Native WebRTC API for video conferencing"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-purple text-center flex-auto">
        <header>
          <h1
            className="text-4xl text-left m-4
        "
          >
            <span className="text-yellow">Com</span>
            <span className="text-cyan">mu</span>
            <span className="text-red">nix</span>
            <p className="text-right text-lg">
              <span className="m-2">Sign Up</span>
              <span className="m-2">Log In</span>
            </p>
          </h1>

          <p className="text-left m-4 text-yellow">
            {" "}
            A video or text chat. Sign up today.
          </p>
        </header>
        <h1 className="text-cyan text-4xl m-10">Lets join a room!</h1>
        <input onChange={(e) => setRoomName(e.target.value)} value={roomName} />
        <button onClick={joinRoom} type="button">
          Join Room
        </button>
      </main>
      <footer className=" mt-auto bg-lightpurple">
        <div class="w-full mx-auto container md:p-6 p-4 md:flex md:items-center md:justify-between">
          <span
            className="text-opacity-25 sm:text-cen
          "
          >
            {" "}
            Made with ❤️ by Ethan Lee & Tijana{" "}
          </span>
          <span className="text-sm text-gray-500 sm:text-center">
            © 2023 Communix is copyright 2023
          </span>
        </div>
      </footer>
    </div>
  );
}
