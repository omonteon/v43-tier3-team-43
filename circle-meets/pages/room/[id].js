import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import useSocket from "../../hooks/useSocket";
import firebase from "firebase/app";
import "firebase/firestore";
import { start } from "repl";

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

const ICE_SERVERS = {
  iceServers: [
    {
      urls: "stun:openrelay.metered.ca:80",
    },
  ],
};

const Room = () => {

  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [name, setName] = useState("");

  const peerConnection = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

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
    createCallId()

  }, []);

  const createCallId = async () => {
    // Reference Firestore collections for signaling
    const callDoc = firestore.collection("calls").doc();
    const offerCandidates = callDoc.collection("offerCandidates");
    const answerCandidates = callDoc.collection("answerCandidates");
  
    //setCallId(callDoc.id);
    //copyToClipboard(callDoc.id);
  
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



  const router = useRouter();
  const userVideoRef = useRef();
  const peerVideoRef = useRef();
  const rtcConnectionRef = useRef(null);
  const socketRef = useRef();
  const userStreamRef = useRef();
  const hostRef = useRef(false);

  const { id: roomName } = router.query;

  useEffect(() => {
    window ? localStorage.getItem("nickname") : ""
    console.log(remoteStream)

  }, [remoteStream]);



  const handleRoomCreated = () => {
    hostRef.current = true;
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: { width: 500, height: 500 },
      })
      .then((stream) => {
        /* use the stream */
        userStreamRef.current = stream;
        userVideoRef.current.srcObject = stream;
        userVideoRef.current.onloadedmetadata = () => {
          userVideoRef.current.play();
        };
      })
      .catch((err) => {
        /* handle the error */
        console.log(err);
      });
  };

  const initiateCall = () => {
    if (hostRef.current) {
      rtcConnectionRef.current = createPeerConnection();
      rtcConnectionRef.current.addTrack(
        userStreamRef.current.getTracks()[0],
        userStreamRef.current
      );
      rtcConnectionRef.current.addTrack(
        userStreamRef.current.getTracks()[1],
        userStreamRef.current
      );
      rtcConnectionRef.current
        .createOffer()
        .then((offer) => {
          rtcConnectionRef.current.setLocalDescription(offer);
          socketRef.current.emit("offer", offer, roomName);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const onPeerLeave = () => {
    // This person is now the creator because they are the only person in the room.
    hostRef.current = true;
    if (peerVideoRef.current.srcObject) {
      peerVideoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop()); // Stops receiving all track of Peer.
    }

    // Safely closes the existing connection established with the peer who left.
    if (rtcConnectionRef.current) {
      rtcConnectionRef.current.ontrack = null;
      rtcConnectionRef.current.onicecandidate = null;
      rtcConnectionRef.current.close();
      rtcConnectionRef.current = null;
    }
  };

  /**
   * Takes a userid which is also the socketid and returns a WebRTC Peer
   *
   * @param  {string} userId Represents who will receive the offer
   * @returns {RTCPeerConnection} peer
   */

  const createPeerConnection = () => {
    // We create a RTC Peer Connection
    const connection = new RTCPeerConnection(ICE_SERVERS);

    // We implement our onicecandidate method for when we received a ICE candidate from the STUN server
    connection.onicecandidate = handleICECandidateEvent;

    // We implement our onTrack method for when we receive tracks
    connection.ontrack = handleTrackEvent;
    return connection;
  };

  const handleReceivedOffer = (offer) => {
    if (!hostRef.current) {
      rtcConnectionRef.current = createPeerConnection();
      rtcConnectionRef.current.addTrack(
        userStreamRef.current.getTracks()[0],
        userStreamRef.current
      );
      rtcConnectionRef.current.addTrack(
        userStreamRef.current.getTracks()[1],
        userStreamRef.current
      );
      rtcConnectionRef.current.setRemoteDescription(offer);

      rtcConnectionRef.current
        .createAnswer()
        .then((answer) => {
          rtcConnectionRef.current.setLocalDescription(answer);
          socketRef.current.emit("answer", answer, roomName);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const handleAnswer = (answer) => {
    rtcConnectionRef.current
      .setRemoteDescription(answer)
      .catch((err) => console.log(err));
  };

  const handleICECandidateEvent = (event) => {
    if (event.candidate) {
      socketRef.current.emit("ice-candidate", event.candidate, roomName);
    }
  };

  const handlerNewIceCandidateMsg = (incoming) => {
    // We cast the incoming candidate to RTCIceCandidate
    const candidate = new RTCIceCandidate(incoming);
    rtcConnectionRef.current
      .addIceCandidate(candidate)
      .catch((e) => console.log(e));
  };

  const handleTrackEvent = (event) => {
    // eslint-disable-next-line prefer-destructuring
    peerVideoRef.current.srcObject = event.streams[0];
  };

  async function toggleMediaStream(type, state) {
    console.log("hello??")
    if (localStream) {
      localStream.current.getTracks().forEach((track) => {
        if (track.kind === type) {
          console.log("track", track)  
          // eslint-disable-next-line no-param-reassign
          track.enabled = !state;
        }
      });
    } /*else { 
      console.log("no local stream")
      const options = {type: state}
      const _localStream = await navigator.mediaDevices.getUserMedia({...options});
      _localStream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, _localStream);
      });
      localVideoRef.current.srcObject = _localStream;
      setLocalStream(_localStream);

    }
    */
    
  };

  const toggleMic = () => {
    toggleMediaStream("audio", micActive);
    setMicActive((prev) => !prev);
    console.log("mic is now", micActive)
  };

  async function toggleCamera() {
    // toggleMediaStream("video", cameraActive);
    // setCameraActive((prev) => !prev);
    //if (!cameraActive) startWebcam()
    toggleMediaStream("video", cameraActive);
    /* else {
      localVideoRef.current.srcObject.getTracks().forEach((track) => {
        track.stop();
      });

    }
    */
    setCameraActive((prev) => !prev)
  };


  const startWebcam = async () => {
    const _localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
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
    if (remoteVideoRef && remoteVideoRef.current) remoteVideoRef.current.srcObject = _remoteStream;
    setLocalStream(_localStream);
    setRemoteStream(_remoteStream);
    // webcamVideo.srcObject = localStream;
    // remoteVideo.srcObject = remoteStream;
  };




  const leaveRoom = () => {
    socketRef.current.emit("leave", roomName); // Let's the server know that user has left the room.

    if (userVideoRef.current.srcObject) {
      userVideoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop()); // Stops receiving all track of User.
    }
    if (peerVideoRef.current.srcObject) {
      peerVideoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop()); // Stops receiving audio track of Peer.
    }

    // Checks if there is peer on the other side and safely closes the existing connection established with the peer.
    if (rtcConnectionRef.current) {
      rtcConnectionRef.current.ontrack = null;
      rtcConnectionRef.current.onicecandidate = null;
      rtcConnectionRef.current.close();
      rtcConnectionRef.current = null;
    }
    router.push("/");
  };




  return (
    <div className="white-grid flex flex-col items-center">
      <h1>{cameraActive ? "true" : "false"}</h1>
      <h2 className="absolute font-dm text-communixPurple left-5 text-3xl">{name}</h2>
      <div className="flex flex-col justify-end relative left-80 top-32">
        <button onClick={toggleMic} type="button" className="border-2 border-communixPurple rounded-md bg-communixRed">
          {micActive ? <img src="/mute.png" alt="toggle mic" className="h-8 p-2 py-1" /> : <img src="/mic.png" alt="toggle mic" className="h-8 p-2 py-1" />}
        </button>
        <button onClick={leaveRoom} type="button" className="border-2 border-communixPurple rounded-md bg-communixRed">
          <img src="/logout.png" alt="leave chat" className="h-8 p-2 py-1" />
        </button>
        <button onClick={toggleCamera} type="button" className="border-2 border-communixPurple rounded-md bg-communixRed">
          {cameraActive ? <img src="/no-video.png" alt="toggle camera" className="h-8 p-2 py-1" /> : <img src="/video-camera.png" alt="toggle camera" className="h-8 p-2 py-1" />}
        </button>

      </div>
      <video
        autoPlay
        ref={localVideoRef}
        className={cameraActive ? "bg-white border-2 border-communixRed h-80 aspect-video rounded-xl" : "hidden"} />
      {!cameraActive &&
        <div className="bg-white flex flex-col justify-end items-center border-2 border-communixRed h-80  aspect-video">
          <img
            src="/shy.png"
            alt="shy person"
            className="h-72"
          />
        </div>}

        <div className="h-80 aspect-video bg-communixGreen border-2 border-communixPurple flex justify-center items-center">
        {remoteStream ?       
          <video autoPlay ref={remoteVideoRef} className="h-80 aspect-video bg-communixGreen border-2 border-communixPurple" />
          : <img src="/shy2.png" alt="your partner is shy too" className="h-72 rounded-full" />
        }
</div>

    </div>
  );
};

export default Room;
