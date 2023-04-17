import Image from "next/image";
import { Inter } from "next/font/google";
import firebase from "firebase/app";
import "firebase/firestore";
import { useEffect, useRef, useState } from "react";

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
    <main className="flex flex-col items-center justify-center min-h-screen bg-communixPurple bg-opacity-75">
      <h1 className="text-3xl font-bold text-center text-communixWhite my-8">
        Communix Video Chat
      </h1>
      <div className="flex flex-wrap justify-center space-x-4">
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
          className="px-4 py-2 text-communixWhite bg-communixGreen rounded-lg shadow-lg hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
          onClick={startWebcam}
          disabled={localStream}
        >
          Start Webcam
        </button>
        <div className="flex mt-4">
          <button
            className="px-4 py-2 text-communixWhite bg-communixGreen rounded shadow-lg hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
            onClick={createCallId}
            disabled={!localStream}
          >
            Copy a new call ID
          </button>
        </div>
        <div className="flex mt-4">
          <label
            className="px-4 py-2 text-communixWhite bg-communixPurple rounded-l-lg"
            htmlFor="call-id"
          >
            Call ID
          </label>
          <input
            type="text"
            id="call-id"
            className="px-4 py-2 text-communixPurple bg-communixWhite focus:outline-none focus:ring-2 focus:ring-communixPurple focus:ring-offset-2 w-64"
            placeholder="Enter call ID"
            onChange={(e) => setCallId(event.target.value)}
          />
          <button
            className="px-4 py-2 text-communixWhite bg-communixGreen rounded-r-lg shadow-lg hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
            onClick={joinCall}
            disabled={!localStream}
          >
            Join Call
          </button>
        </div>
        <div className="flex mt-4">
          <button
            className="px-4 py-2 text-communixWhite bg-communixRed rounded shadow-lg hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
            onClick={endCall}
            disabled={!callId}
          >
            End Call
          </button>
        </div>
      </div>
    </main>
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
  );
}
