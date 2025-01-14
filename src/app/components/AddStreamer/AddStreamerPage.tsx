"use client";

import getLolAccountPuuid from "@/app/actions/getLolAccountPuuid";
import { getStreamerId } from "@/app/actions/getStreamerId";
import updateOrCreateStreamer from "@/app/actions/upsertStreamer";
import { UpsertStreamerDTO } from "@/prisma/streamerRepository";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "../Button/Button";

type LolAccount = {
  username: string;
  tag: string;
  puuid: string;
};

type AddStreamerForm = Omit<UpsertStreamerDTO, "lolAccounts"> & {
  lolAccounts: LolAccount[];
};

export default function AddStreamerPage() {
  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const [lolUsername, setLolUsername] = useState("");
  const [lolTag, setLolTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepTwo, setStepTwo] = useState(false);

  const {
    register,
    getValues,
    setValue,
    control,
    formState: { errors },
    trigger,
    setError,
    handleSubmit,
    clearErrors,
  } = useForm<AddStreamerForm>();
  const lolAccounts = useFieldArray({
    control,
    name: "lolAccounts",
  });

  async function fetchStreamerId() {
    setLoading(true);
    await trigger("twitchUsername");

    if (errors.twitchUsername) {
      setLoading(false);
      return;
    }
    const twitchUsername = getValues("twitchUsername");

    const streamer = await getStreamerId(twitchUsername);

    if (!streamer) {
      setError("twitchUsername", {
        type: "validate",
        message: "Invalid streamer!",
      });
      setLoading(false);
      return;
    }

    setValue("twitchId", streamer["id"]);

    setLoading(false);
    setStepTwo(true);
  }

  async function fetchLolAccount() {
    setLoading(true);
    clearErrors("lolAccounts");

    const accountExists = lolAccounts.fields.some(
      (lolAccount) =>
        lolAccount.username.toLowerCase() === lolUsername.toLowerCase() &&
        lolAccount.tag.toLowerCase() === lolTag.toLowerCase()
    );

    if (accountExists) {
      setLoading(false);
      return;
    }

    if (!lolUsername) {
      setError("lolAccounts", {
        type: "required",
        message: "LoL Username is required!",
      });
      setLoading(false);
      return;
    }

    if (!lolTag) {
      setError("lolAccounts", {
        type: "required",
        message: "Tag is required!",
      });

      setLoading(false);
      return;
    }

    const data = await getLolAccountPuuid(lolUsername, lolTag);

    if (data["message"]) {
      setError("lolAccounts", {
        type: "custom",
        message: data["message"],
      });
      setLoading(false);
      return;
    }

    lolAccounts.append({
      username: data["gameName"],
      tag: data["tagLine"],
      puuid: data["puuid"],
    });
    setLoading(false);
  }

  async function handleSubmitForm(data: AddStreamerForm) {
    await updateOrCreateStreamer({
      twitchId: data.twitchId,
      twitchUsername: data.twitchUsername,
      lolAccounts: data.lolAccounts.map((lolAccount) => {
        return lolAccount.puuid;
      }),
    });
  }

  return (
    <div className="p-3 flex flex-col justify-center gap-5">
      <h1 className="mt-5 text-3xl text-center sm:text-5xl">
        Add new streamer
      </h1>
      <form
        className="flex flex-col justify-center gap-5"
        onSubmit={handleSubmit(handleSubmitForm)}
      >
        <div className="flex flex-col gap-3 border border-gray-two p-5 rounded">
          <input
            className="h-[40px] text-[14px] w-full outline-none bg-gray-two px-3 py-1 rounded-[5px] border border-gray-three
            focus:ring-1 focus:ring-gray-three focus:ring-offset-1 focus:ring-offset-gray-two transition-all duration-400 ease-in-out
            disabled:opacity-30 border-opacity-5"
            type="text"
            placeholder="Twitch account"
            disabled={stepTwo ? true : false}
            {...register("twitchUsername", { required: "Invalid streamer!" })}
          />
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              errors.twitchUsername
                ? "max-h-20 opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-sm text-red-400">
              {errors.twitchUsername?.message}
            </p>
          </div>
          <Button
            accentColor={"secondary"}
            onClick={fetchStreamerId}
            loading={!stepTwo && loading}
            disabled={stepTwo ? true : false}
          >
            Next
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center -my-5">
          <span className="flex justify-center items-center w-5 h-5 border-gray-two border-2 rounded-full">
            <span
              className={`flex w-4 h-4 rounded-full bg-primary transition-all duration-500 ease-in-out ${
                stepTwo ? "opacity-0" : "opacity-100"
              }`}
            ></span>
          </span>

          <div className="h-[25px] w-[2px] bg-gray-three"></div>
          <span className="flex justify-center items-center w-5 h-5 border-gray-two border-2 rounded-full">
            <span
              className={`flex w-4 h-4 rounded-full bg-primary transition-all duration-500 ease-in-out ${
                stepTwo ? "opacity-100" : "opacity-0"
              }`}
            ></span>
          </span>
        </div>
        <div className="border border-gray-two p-5 rounded">
          <div className="grid grid-cols-5 gap-3">
            <input
              className="col-span-3 h-[40px] text-[14px] placeholder-gray-six flex-1 outline-none bg-gray-two 
              px-3 py-1 rounded-[5px] border border-gray-three border-opacity-5 focus:ring-1 focus:ring-gray-three focus:ring-offset-1 
              focus:ring-offset-gray-two transition-all duration-400 ease-in-out disabled:opacity-30"
              type="text"
              onChange={(e) => {
                setLolUsername(e.target.value);
              }}
              value={lolUsername}
              placeholder="LOL Username"
              disabled={stepTwo ? false : true}
              maxLength={16}
            />
            <input
              className="col-span-2 h-[40px] text-[14px] flex-1 outline-none bg-gray-two px-3 py-1 rounded-[5px] 
              border border-gray-two focus:ring-1 focus:ring-gray-three focus:ring-offset-1 focus:ring-offset-gray-two 
              transition-all duration-400 ease-in-out disabled:opacity-30"
              type="text"
              onChange={(e) => {
                setLolTag(e.target.value);
              }}
              value={lolTag}
              placeholder="TAG"
              disabled={stepTwo ? false : true}
              maxLength={4}
            />
            <div
              className={`col-span-full transition-all duration-500 ease-in-out ${
                errors.lolAccounts
                  ? "max-h-20 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-sm text-red-400">
                {errors.lolAccounts?.message}
              </p>
            </div>
            <Button
              className="h-[40px] col-span-full "
              accentColor={"secondary"}
              onClick={fetchLolAccount}
              disabled={stepTwo ? false : true}
              loading={stepTwo && loading}
            >
              Add
            </Button>
            <div className="col-span-full">
              <ul className="flex flex-wrap gap-2 ">
                {lolAccounts.fields.map((item, index) => (
                  <li
                    key={item.id}
                    className="flex gap-2 items-center justify-center bg-gray-five px-4 py-[2px] rounded-full"
                  >
                    <span>
                      {item.username}#{item.tag}
                    </span>
                    <button
                      type="button"
                      onClick={() => lolAccounts.remove(index)}
                      className="text-red-500 hover:text-red-700 transition-colors duration-300"
                    >
                      X
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Button
            className="mt-5"
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
