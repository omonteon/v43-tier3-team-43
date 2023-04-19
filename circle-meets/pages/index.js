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

const inter = Inter({ subsets: ["latin"] });


export default function Home() {
  const [callId, setCallId] = useState("");
  const router = useRouter();


  const [parent, setParent] = useState(null);
  const [nickName, setName] = useState("");
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const servers = {
      iceServers: [
        {
          urls: [
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
          ],
        },
      ],
      iceCandidatePoolSize: 10,
    };


    peerConnection.current = new RTCPeerConnection(servers);

    return () => {
      // peerConnection.current.close();
      // firebase.app().delete();
    };
  }, []);

  // Setup media sources
  const startWebcam = async () => {
    const _localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const _remoteStream = new MediaStream();

    // Push tracks from local stream to peer connection
    _localStream.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, _localStream);
    });

    // Pull tracks from remote stream, add to video stream
    peerConnection.current.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        _remoteStream.addTrack(track);
      });
    };

    localVideoRef.current.srcObject = _localStream;
    remoteVideoRef.current.srcObject = _remoteStream;
    setLocalStream(_localStream);
    setRemoteStream(_remoteStream);
    // webcamVideo.srcObject = localStream;
    // remoteVideo.srcObject = remoteStream;

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
         
      </div>
      <div className="flex flex-col items-center mt-4">
        <button
          className="px-2 py-1 text-communixWhite bg-communixGreen rounded-lg shadow-lg hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
          onClick={startWebcam}
          disabled={localStream}
        >
          Start Webcam
        </button>
        <div className="flex mt-4">
          <button
            className="px-2 py-1 text-communixWhite bg-communixGreen rounded shadow-lg hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
            onClick={createCallId}
            disabled={!localStream}
          >
            Copy a new call ID
          </button>
        </div>
        <div className="flex mt-4">
          <label
            className="px-2 py-1 text-communixWhite bg-communixPurple rounded-l-lg"
            htmlFor="call-id"
          >
            Call ID
          </label>
          <input
            type="text"
            id="call-id"
            className="px-2 py-1 text-communixPurple bg-communixWhite focus:outline-none focus:ring-2 focus:ring-communixPurple focus:ring-offset-2 w-64"
            placeholder="Enter call ID"
            onChange={(e) => setCallId(event.target.value)}
          />
          <button
            className="px-2 py-1 text-communixWhite bg-communixGreen rounded-r-lg shadow-lg hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
            onClick={joinCall}
            disabled={!localStream}
          >
            Join Call
          </button>
        </div>
        <div className="flex mt-4">
          <button
            className="px-2 py-1 text-communixWhite bg-communixRed rounded shadow-lg hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
            onClick={endCall}
            disabled={!callId}
          >
            End Call
          </button>
        </div>
      </div>
      </main>

    </div>
  )
}


function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(
    function () {
      alert("Id was copied successfully!");
    },
    function (err) {
      alert("Error: Could not copy id");
    }
  )
}
