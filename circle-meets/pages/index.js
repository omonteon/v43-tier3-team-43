import Image from "next/image";
import { Inter } from "next/font/google";
import firebase from "firebase/app";
import "firebase/firestore";
import { useEffect, useRef, useState } from "react";

import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
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
  const peerConnection = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callId, setCallId] = useState("");


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

  // Create an offer
  const createCallId = async () => {
    // Reference Firestore collections for signaling
    const callDoc = firestore.collection("calls").doc();
    const offerCandidates = callDoc.collection("offerCandidates");
    const answerCandidates = callDoc.collection("answerCandidates");

    setCallId(callDoc.id);
    copyToClipboard(callDoc.id);

    // Get candidates for caller, save to db
    peerConnection.current.onicecandidate = (event) => {
      event.candidate && offerCandidates.add(event.candidate.toJSON());
    };

    // Create offer
    const offerDescription = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await callDoc.set({ offer });

    // Listen for remote answer
    callDoc.onSnapshot((snapshot) => {
      const data = snapshot.data();
      if (!peerConnection.current.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        peerConnection.current.setRemoteDescription(answerDescription);
      }
    });

    // When answered, add candidate to peer connection
    answerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          peerConnection.current.addIceCandidate(candidate);
        }
      });
    });
  };

  // Answer the call with the unique id
  const joinCall = async () => {
    const callDoc = firestore.collection("calls").doc(callId);
    const answerCandidates = callDoc.collection("answerCandidates");
    const offerCandidates = callDoc.collection("offerCandidates");

    peerConnection.current.onicecandidate = (event) => {
      event.candidate && answerCandidates.add(event.candidate.toJSON());
    };

    const callData = (await callDoc.get()).data();

    const offerDescription = callData.offer;
    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(offerDescription)
    );

    const answerDescription = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await callDoc.update({ answer });

    offerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        console.log(change);
        if (change.type === "added") {
          let data = change.doc.data();
          peerConnection.current.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  };

  const endCall = () => {
    location.reload(true);
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
      <div className={showError ? "bg-communixRed col-start-6 row-start-3 col-span-2 row-span-4 flex flex-col items-center border-2 border-communixPurple" : "bg-communixYellow col-start-6 row-start-3 col-span-2 row-span-4 flex flex-col items-center border-2 border-communixRed"}>
        <h1 className="font-dm text-2xl text-communixPurple mb-4 mt-8">Lets get started!</h1>
         <video
          className="w-96 h-72 rounded-lg border-2 border-communixWhite shadow-lg"
          ref={localVideoRef}
          autoPlay
          muted
        />
        <video
          className="w-96 h-72 rounded-lg border-2 border-communixWhite shadow-lg"
          ref={remoteVideoRef}
          autoPlay
          muted
        />
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
  );
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
}
