import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import avatarDefault from "../../assets/user-avatar.png";

function Header() {
  const router = useRouter();

  return (
    <header className="pt-3 pb-3 px-10 flex justify-between border-b-2">
      <div className="flex flex-1 gap-6">
        <input
          placeholder="search"
          className="bg-communixWhite border-2 rounded h-10 p-1 text-l w-1/3  xl:w-1/4"
        />
        <button
          type="button"
          className="border-2 rounded h-10 px-3 text-l bg-communixGreen"
          onClick={() => {
            router.push("/add-friend");
          }}
        >
          add a friend
        </button>
      </div>
      <div className="flex items-center gap-2 justify-self-end">
        <p className="text-l">
          Welcome,{" "}
          <a href="#" className="underline">
            Edward
          </a>
        </p>{" "}
        <Image src={avatarDefault} width={44} height={44} alt="Edward" />
      </div>
    </header>
  );
}

export default Header;
