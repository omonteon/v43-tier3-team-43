import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import useSocket from "../../hooks/useSocket";

const Room = () => {
  useSocket();

  const router = useRouter();
  const userVideoRef = useRef();
  const peerVideoRef = useRef();
  const rtcConnectionRef = useRef(null);
  const socketRef = useRef();
  const userStreamRef = useRef();
  const hostRef = useRef(false);

  const { id: roomName } = router.query;
  useEffect(() => {
    socketRef.current = io();
    // First we join a room
    socketRef.current.emit("join", roomName);

    socketRef.current.on("created", handleRoomCreated);

    socketRef.current.on("joined", handleRoomJoined);
    // If the room didn't exist, the server would emit the room was 'created'

    // Whenever the next person joins, the server emits 'ready'
    socketRef.current.on("ready", initiateCall);

    // Emitted when a peer leaves the room
    socketRef.current.on("leave", onPeerLeave);

    // If the room is full, we show an alert
    socketRef.current.on("full", () => {
      window.location.href = "/";
    });

    // Events that are webRTC speccific
    socketRef.current.on("offer", handleReceivedOffer);
    socketRef.current.on("answer", handleAnswer);
    socketRef.current.on("ice-candidate", handlerNewIceCandidateMsg);

    // clear up after
    return () => socketRef.current.disconnect();
  }, [roomName]);

  return (
    <div>
      <video autoPlay ref={userVideoRef} />
      <video autoPlay ref={peerVideoRef} />
    </div>
  );
};

export default Room;
