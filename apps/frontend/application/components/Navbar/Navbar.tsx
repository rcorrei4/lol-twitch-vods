"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="relative bg-gray-two text-white">
      <div className="md:w-11/12 max-w-screen-xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <Image
            src="/lol_image.png"
            alt="League of Legends Icon"
            width={30}
            height={30}
          />
          <span className="font-bold text-lg">LoL Vods</span>
        </div>

        <div className="hidden md:flex space-x-6">
          <Link href="/" className="hover:text-gray-400">
            Home
          </Link>
          <a href="/add-streamer" className="hover:text-gray-400">
            Add Streamer
          </a>
        </div>

        <button
          onClick={toggleMenu}
          className={`md:hidden focus:outline-none relative w-5 h-5 z-50`}
          aria-label="Toggle Menu"
        >
          <span
            className={`block absolute w-full h-[1px] bg-white transition-transform duration-300 ${
              isMenuOpen ? "rotate-45 top-[10px]" : "top-[6px]"
            }`}
          ></span>
          <span
            className={`block absolute w-full h-[1px] bg-white transition-transform duration-300 ${
              isMenuOpen ? "opacity-0" : "top-[10px]"
            }`}
          ></span>
          <span
            className={`block absolute w-full h-[1px] bg-white transition-transform duration-300 ${
              isMenuOpen ? "-rotate-45 top-[10px]" : "top-[14px]"
            }`}
          ></span>
        </button>
      </div>

      <div
        className={`fixed inset-0 bg-gray-900 bg-opacity-90 flex flex-col items-center justify-center space-y-6 text-lg transform ${
          isMenuOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        } transition-all duration-300 z-40`}
      >
        <Link
          href="/"
          className="text-white hover:text-gray-400"
          onClick={() => setIsMenuOpen(false)}
        >
          Home
        </Link>
        <Link
          href="/add-streamer"
          className="text-white hover:text-gray-400"
          onClick={() => setIsMenuOpen(false)}
        >
          Add Streamer
        </Link>
      </div>
    </nav>
  );
}
