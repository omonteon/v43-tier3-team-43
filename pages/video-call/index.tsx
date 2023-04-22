import Image from "next/image";
import firebase from "firebase/app";
import "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

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

export default function VideoCall() {
  const router = useRouter();
  const peerConnection = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStream = useRef(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [remoteCameraActive, setRemoteCameraActive] = useState(false);
  const [callId, setCallId] = useState(router.query.id?.toString());

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

    startWebcam().then(() => {
      if (router.query.id) {
        joinCall();
      }
    });

    return () => {
      // Cleanup function to be called when the component is unmounted
      // 1. Stop all media tracks
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
      // 2. Close the RTCPeerConnection
      if (peerConnection.current) {
        peerConnection.current.close();
      }
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
        if (track.kind === "video") {
          // Handle video track mute/unmute events
          track.onmute = () => {
            console.log("Remote peer stopped their video");
            setRemoteCameraActive(false);
          };

          track.onunmute = () => {
            console.log("Remote peer restarted their video");
            setRemoteCameraActive(true);
          };
        }
      });
    };

    localVideoRef.current.srcObject = _localStream;
    remoteVideoRef.current.srcObject = _remoteStream;
    localStream.current = _localStream;
  };

  const toggleRemoteVideo = () => {
    setRemoteCameraActive(!remoteCameraActive);
  };

  const toggleVideo = () => {
    if (localVideoRef.current) {
      const stream = localVideoRef.current.srcObject;
      if (stream) {
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length > 0) {
          if (!cameraActive) {
            // Restart the video
            navigator.mediaDevices
              .getUserMedia({ video: true })
              .then((newStream) => {
                const newVideoTrack = newStream.getVideoTracks()[0];
                const sender = peerConnection.current.getSenders().find((s) => {
                  return s.track && s.track.kind === "video";
                });
                sender.replaceTrack(newVideoTrack);
                stream.removeTrack(videoTracks[0]);
                stream.addTrack(newVideoTrack);
                setCameraActive(true);
              })
              .catch((err) => console.error("Error restarting video:", err));
          } else {
            // Stop the video and the connection with the camera
            videoTracks[0].stop();
            setCameraActive(false);
          }
        }
      }
    }
  };

  const toggleMic = () => {
    setMicActive(!micActive);
    if (localVideoRef.current) {
      const stream = localVideoRef.current.srcObject;
      if (stream) {
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
          audioTracks[0].enabled = !audioTracks[0].enabled;
        }
      }
    }
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
        if (change.type === "added") {
          let data = change.doc.data();
          peerConnection.current.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  };

  const endCall = () => {
    router.back();
  };

  return (
    <div className="white-grid flex flex-col items-center">
      {/* TODO: Implement name sharing between peers */}
      {/* <h2 className="absolute font-dm text-communixPurple left-5 text-3xl">
          {name}
        </h2> */}
      {router.query.id ? null : (
        <div className="flex flex-col gap-2 mt-4">
          <button
            className={`border-2 border-communixPurple rounded-md bg-communixRed py-2 px-4`}
            onClick={createCallId}
          >
            Copy call ID
          </button>
        </div>
      )}
      <div className="flex flex-col justify-end relative left-80 top-32 gap-1">
        <button
          onClick={toggleMic}
          type="button"
          className="border-2 border-communixPurple rounded-md bg-communixRed"
        >
          {micActive ? (
            <img src="/mic.png" alt="toggle mic" className="h-8 p-2 py-1" />
          ) : (
            <img src="/mute.png" alt="toggle mic" className="h-8 p-2 py-1" />
          )}
        </button>
        <button
          onClick={endCall}
          type="button"
          className="border-2 border-communixPurple rounded-md bg-communixRed"
        >
          <img src="/logout.png" alt="leave chat" className="h-8 p-2 py-1" />
        </button>
        <button
          onClick={toggleVideo}
          type="button"
          className="border-2 border-communixPurple rounded-md bg-communixRed"
        >
          {cameraActive ? (
            <img
              src="/video-camera.png"
              alt="toggle camera"
              className="h-8 p-2 py-1"
            />
          ) : (
            <img
              src="/no-video.png"
              alt="toggle camera"
              className="h-8 p-2 py-1"
            />
          )}
        </button>
      </div>
      <video
        autoPlay
        muted
        ref={localVideoRef}
        className={
          cameraActive
            ? "bg-white border-2 border-communixRed h-80 aspect-video"
            : "hidden"
        }
      />
      {!cameraActive && (
        <div className="bg-white flex flex-col justify-end items-center border-2 border-communixRed h-80 aspect-video">
          <img src="/shy.png" alt="shy person" className="h-72" />
        </div>
      )}

      <div className="h-80 aspect-video bg-communixGreen border-2 border-communixPurple flex justify-center items-center">
        <video
          autoPlay
          ref={remoteVideoRef}
          className={`h-80 aspect-video bg-communixGreen border-2 border-communixPurple ${
            remoteCameraActive ? "" : "hidden"
          }`}
        />
        <img
          src="/shy2.png"
          alt="your partner is shy too"
          className={`h-72 rounded-full ${remoteCameraActive ? "hidden" : ""}`}
        />
      </div>
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
  );
}
