import Image from "next/image";
import React from "react";
import photoDefault from "../../assets/friend-photo-default.png";

function FriendCard({ name = "", photoURL = "", online = false }) {
  return (
    <div className="border-2 rounded bg-communixYellow p-3">
      <div className="relative">
        {online ? (
          <span className="absolute top-2 right-2 rounded-full border-2 w-3 h-3 sm:w-5 sm:h-5 bg-communixGreen text-opacity-0"></span>
        ) : null}
        <Image
          src={photoURL || photoDefault}
          width={240}
          height={320}
          layout="responsive"
          alt={name}
        />
      </div>
      <h3 className="mt-4 text-xl">{name}</h3>
    </div>
  );
}

export default FriendCard;
