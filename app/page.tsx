"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.ChangeEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      const normalizedUser = username.toLowerCase();
      if (normalizedUser === "admin" && password === "password123") {
        router.push("/nurse");
      } else if (normalizedUser === "patient" && password === "password123") {
        const DEMO_ID = "aaaaaaaa-0000-0000-0000-000000000002";
        router.push(`/patient/${DEMO_ID}`);
      } else {
        setError("LOGIN FAILED: UNAUTHORIZED CREDENTIALS.");
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="flex min-h-screen flex-col items-center  font-serif text-[#333] pt-0">
      <div className="w-full bg-[#003366]  py-6 text-center shadow-md">
        <h1 className="text-2xl font-bold text-white tracking-widest uppercase">
          Care Companion AI
        </h1>
        <p className="text-xs text-gray-300">
          Care Companion Access Portal v1.0.0
        </p>
      </div>

      <div className="w-full max-w-md mt-16 px-4">
        <form
          onSubmit={handleLogin}
          className="bg-[#e1e1e1] border-2 border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] p-8 space-y-4"
        >
          <h2 className="text-lg font-bold border-b border-[#808080] pb-2 mb-4">
            Secure User Sign-On
          </h2>

          {error && (
            <div className="bg-white border-2 border-[#cc0000] p-3 text-xs font-bold text-[#cc0000] text-center uppercase">
              {error}
            </div>
          )}

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold uppercase">User ID:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-2 border-t-[#808080] border-l-[#808080] border-r-[#ffffff] border-b-[#ffffff] px-2 py-1 text-sm bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold uppercase">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-t-[#808080] border-l-[#808080] border-r-[#ffffff] border-b-[#ffffff] px-2 py-1 text-sm bg-white focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#cccccc] border-2 border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] px-6 py-1 text-sm font-bold active:border-t-[#808080] active:border-l-[#808080] active:border-r-[#ffffff] active:border-b-[#ffffff]"
            >
              {isLoading ? "Verifying..." : "Submit"}
            </button>
          </div>
        </form>

        <div className="mt-10 border-t border-[#cccccc] pt-4">
          <p className="text-[10px] text-gray-500 text-center uppercase">
            ID: <span className="font-mono text-black">add text here</span> |
            add text here{" "}
            <span className="font-mono text-black">add text here</span>
          </p>
        </div>
      </div>

      <footer className="mt-auto pb-10 text-[11px] text-gray-500 italic text-center">
        <Link
          href="https://shpelmu.org/"
          className="text-blue-700 underline hover:text-blue-900 not-italic font-bold"
        >
          Contact Us
        </Link>
      </footer>
    </div>
  );
}