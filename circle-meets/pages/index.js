import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import styles from "../styles/Home.module.css";

//we'll have to set the conversation id as the room name I think

export default function Home() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");

  const joinRoom = () => {
    router.push(`/room/${roomName || Math.random().toString(36).slice(2)}`);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Communix</title>
        <meta
          name="description"
          content="Video chatting for nerds"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className="text-green-600"><span className='text-communix-green'>Com</span>mu<span className='communix-red'>nix</span></h1>
        <input
          onChange={(e) => setRoomName(e.target.value)}
          value={roomName}
          className={styles["room-name"]}
        />
        <button
          onClick={joinRoom}
          type="button"
          className={styles["join-room"]}
        >
          Join Room
        </button>
      </main>
    </div>
  );
}
