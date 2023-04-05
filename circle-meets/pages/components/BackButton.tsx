import React from "react";
import { useRouter } from "next/router";

export default function BackButton() {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className="absolute top-0 left-0 space-x-2 m-4">
      <button className="flex items-center" onClick={handleBackClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        <span className="text-lg">Go Back</span>
      </button>
    </div>
  );
}
