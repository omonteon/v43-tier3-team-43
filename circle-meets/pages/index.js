import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Home() {
  const [callId, setCallId] = useState("");
  const router = useRouter();

  const startNewCall = () => {
    router.push(`/video-call`);
  };

  const joinCall = () => {
    router.push(`/video-call?id=${callId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-communixPurple ">
      <Head>
        <title>Communix</title>
        <meta name="description" content="Video chatting for nerds" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className=" text-center flex-auto pt-5">
        <h1 className="text-4xl m-4 text-center">
          <span className="text-communixYellow">Com</span>
          <span className=" text-communixGreen">mu</span>
          <span className="text-communixRed">nix</span>
        </h1>
        <h2 className="text-2xl my-3 text-communixWhite">
          Start or join a video call
        </h2>
        <div className="flex justify-center items-center space-x-6">
          <button
            className="px-2 py-1 text-communixWhite bg-communixGreen rounded-lg shadow-lg hover:bg-green-500 outline-none"
            type="button"
            onClick={startNewCall}
          >
            New call
          </button>
          <form className="flex items-center">
            <input
              type="text"
              id="call-id"
              className="px-2 py-1 text-communixPurple bg-communixWhite rounded-l outline-none w-64"
              placeholder="Enter call ID"
              aria-label="Call id"
              onChange={(e) => setCallId(event.target.value)}
            />
            <button
              type="button"
              className={`px-2 py-1 text-communixWhite bg-communixGreen rounded-r-lg shadow-lg hover:bg-green-500 ${
                !callId ? "bg-opacity-25 text-opacity-25" : ""
              }`}
              onClick={joinCall}
              disabled={!callId}
            >
              Join Call
            </button>
          </form>
        </div>
      </main>
      <footer className=" mt-auto bg-lightpurple">
        <div className="w-full mx-auto container md:p-6 p-4 md:flex md:items-center md:justify-between">
          <span className="sm:text-center text-communixWhite">
            {" "}
            Made with ❤️ by Ethan Lee, Omar & Tijana{" "}
          </span>
          <span className="text-sm sm:text-center text-communixWhite">
            © 2023 Communix is copyright 2023
          </span>
        </div>
      </footer>
    </div>
  );
}
