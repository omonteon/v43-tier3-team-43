import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Home() {
  const [showError, setShowError] = useState(false);
  const [callId, setCallId] = useState("");
  const router = useRouter();

  const startNewCall = () => {
    router.push(`/video-call`);
  };

  const joinCall = () => {
    router.push(`/video-call?id=${callId}`);
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
      <div
        className={
          showError
            ? "bg-communixRed col-start-6 row-start-3 col-span-2 row-span-4 flex flex-col items-center border-2 border-communixPurple"
            : "bg-communixYellow col-start-6 row-start-3 col-span-2 row-span-4 flex flex-col items-center border-2 border-communixRed"
        }
      >
        <h1 className="font-dm text-2xl text-communixPurple mb-4 mt-8">
          Lets get started!
        </h1>
        <label
          htmlFor="username"
          className="text-communixPurple text-left mb-2"
        >
          Paste a room name
        </label>
        <div className="flex flex-row align-center">
          <div>
            <input
              onChange={(e) => setCallId(e.target.value)}
              className="bg-communixWhite border-2 rounded-l-md border-communixPurple p-2 py-1 outline-none w-3/4 h-full"
            />
            <button
              className="px-2 h-full bg-communixGreen rounded-r-lg disabled:bg-communixRed border-2 border-l-0 border-communixPurple"
              onClick={() => joinCall(callId)}
              disabled={callId?.length < 2}
            >
              Join
            </button>
          </div>
        </div>

        <p className="text-communixPurple bg-communixWhite mb-4">
          {showError && "longer!"}
        </p>
        <button
          type="button"
          onClick={startNewCall}
          className="bg-communixGreen border-2 rounded-md px-4 py-1 w-1/3 mb-4 boxShadow"
        >
          Create a new call
        </button>
      </div>
    </div>
  );
}
