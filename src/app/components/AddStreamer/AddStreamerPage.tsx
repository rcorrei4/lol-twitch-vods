"use client";

import { useState } from "react";
import { Button } from "../Button/Button";

export default function AddStreamerPage() {
  const [streamerUsername, setStreamerUsername] = useState("");
  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepTwo, setStepTwo] = useState(false);

  async function fetchStreamerId(streamerUsername: string) {
    setInputErrorMessage("");
    setLoading(true);
    const response = await fetch(
      `/api/twitch/get-streamer-id?username=${streamerUsername}`
    );
    const responseData = await response.json();

    if (!responseData.data) {
      setInputErrorMessage("Streamer not found!");
    }

    setStepTwo(true);
    setLoading(false);
  }

  return (
    <div className="p-3 flex flex-col justify-center gap-5">
      <h1 className="mt-5 text-3xl text-center sm:text-5xl">
        Add new streamer
      </h1>
      <form className="flex flex-col justify-center gap-5">
        <div className="flex flex-col gap-3 bg-gray-two p-5 rounded">
          <input
            className="h-[40px] text-[14px] w-full outline-none bg-gray-three px-3 py-1 rounded-[5px] border border-gray-three 
            focus:ring-1 focus:ring-gray-three focus:ring-offset-1 focus:ring-offset-gray-two transition-all duration-400 ease-in-out
            disabled:opacity-30"
            name="text"
            type="text"
            placeholder="Twitch account"
            onChange={(e) => {
              setStreamerUsername(e.target.value);
            }}
            disabled={stepTwo ? true : false}
          />
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              inputErrorMessage ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-sm text-red-400">{inputErrorMessage}</p>
          </div>
          <Button
            accentColor={"secondary"}
            onClick={() => fetchStreamerId(streamerUsername)}
            loading={loading}
            disabled={stepTwo ? true : false}
          >
            Next
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center -my-5">
          <span className="flex justify-center items-center w-5 h-5 border-gray-three border-2 rounded-full">
            <span
              className={`flex w-4 h-4 rounded-full bg-primary transition-all duration-500 ease-in-out ${
                stepTwo ? "opacity-0" : "opacity-100"
              }`}
            ></span>
          </span>

          <div className="h-[25px] w-[2px] bg-gray-three"></div>
          <span className="flex justify-center items-center w-5 h-5 border-gray-three border-2 rounded-full">
            <span
              className={`flex w-4 h-4 rounded-full bg-primary transition-all duration-500 ease-in-out ${
                stepTwo ? "opacity-100" : "opacity-0"
              }`}
            ></span>
          </span>
        </div>
        <div className="bg-gray-two p-5 rounded">
          <div className="grid grid-cols-3 gap-2">
            <input
              className="mb-5 h-[40px] text-[14px] placeholder-gray-six flex-1 outline-none bg-gray-three 
              px-3 py-1 rounded-[5px] border border-gray-three focus:ring-1 focus:ring-gray-three focus:ring-offset-1 
              focus:ring-offset-gray-two transition-all duration-400 ease-in-out disabled:opacity-30"
              name="username"
              type="text"
              placeholder="LOL Username"
              disabled={stepTwo ? false : true}
            />
            <input
              className="mb-5 h-[40px] text-[14px] flex-1 outline-none bg-gray-three  px-3 py-1 rounded-[5px] 
              border border-gray-three focus:ring-1 focus:ring-gray-three focus:ring-offset-1 focus:ring-offset-gray-two 
              transition-all duration-400 ease-in-out disabled:opacity-30"
              name="tag"
              type="text"
              placeholder="TAG"
              disabled={stepTwo ? false : true}
            />
            <select
              className="mb-5 h-[40px] text-[14px] flex-1 outline-none bg-gray-three  px-3 py-1 rounded-[5px] border 
              border-gray-three focus:ring-1 focus:ring-gray-three focus:ring-offset-1 focus:ring-offset-gray-two 
              transition-all duration-400 ease-in-out appearance-none disabled:opacity-30"
              name="servers"
              id="servers"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='white' d='M10 12l-4-4h8l-4 4z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.75rem center",
                backgroundSize: "1rem",
              }}
              disabled={stepTwo ? false : true}
            >
              <option value="br">BR</option>
              <option value="eune">EUNE</option>
              <option value="euw">EUW</option>
              <option value="jp">JP</option>
              <option value="kr">KR</option>
              <option value="lan">LAN</option>
              <option value="las">LAS</option>
              <option value="na">NA</option>
              <option value="oce">OCE</option>
              <option value="tr">TR</option>
              <option value="me">ME</option>
              <option value="ru">RU</option>
            </select>
          </div>

          <Button
            accentColor={"secondary"}
            onClick={() => setStepTwo(false)}
            disabled={stepTwo ? false : true}
          >
            Back
          </Button>
        </div>
        <Button type="submit" className="ml-auto">
          Add streamer
        </Button>
      </form>
    </div>
  );
}
