import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { Button } from "~/components/Button/Button";
import { TextBox } from "~/components/TextBox/TextBox";
import {
  getRiotGamesAccount,
  getTwitchStreamer,
  putApiStreamer,
  type CreateStreamer,
  type StreamerLolAccount,
} from "~/services/generated";
import { Server } from "~/types/domain";

type AddStreamerForm = {
  streamer: Omit<CreateStreamer, "lolAccounts">;
  lolAccounts: StreamerLolAccount[];
  streamerSearchQuery: string;
  lolUsername: string;
  lolTag: string;
  lolServer: Server;
};

function StepIndicator({ activeStep }: { activeStep: 1 | 2 }) {
  return (
    <div className="flex flex-col items-center justify-center -my-5">
      <span className="flex justify-center items-center w-5 h-5 border-gray-two border-2 rounded-full">
        <span
          className={`flex w-4 h-4 rounded-full bg-primary transition-all duration-500 ease-in-out ${
            activeStep === 1 ? "opacity-100" : "opacity-0"
          }`}
        />
      </span>
      <div className="h-6.25 w-0.5 bg-gray-three" />
      <span className="flex justify-center items-center w-5 h-5 border-gray-two border-2 rounded-full">
        <span
          className={`flex w-4 h-4 rounded-full bg-primary transition-all duration-500 ease-in-out ${
            activeStep === 2 ? "opacity-100" : "opacity-0"
          }`}
        />
      </span>
    </div>
  );
}

function ErrorMessage({ message, className }: { message?: string; className?: string }) {
  return (
    <div
      className={`overflow-hidden transition-all duration-500 ease-in-out ${
        message ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
      } ${className ?? ""}`}
    >
      <p className="text-sm text-red-400!">{message}</p>
    </div>
  );
}

export function AddStreamerPage() {
  const navigate = useNavigate();

  const {
    register,
    getValues,
    setValue,
    watch,
    control,
    formState: { errors },
    trigger,
    setError,
    handleSubmit,
    clearErrors,
  } = useForm<AddStreamerForm>({
    defaultValues: {
      lolUsername: "",
      lolTag: "",
      lolServer: Server.BR,
    },
  });

  const lolAccounts = useFieldArray({
    control,
    name: "lolAccounts",
  });

  const lolUsername = watch("lolUsername");
  const lolTag = watch("lolTag");
  const lolServer = watch("lolServer");
  const stepTwo = watch("streamer.twitchId") !== undefined;

  const streamerMutation = useMutation({
    mutationFn: async () => {
      const isValid = await trigger("streamerSearchQuery");
      if (!isValid) return;

      const streamerSearchQuery = getValues("streamerSearchQuery");
      const { data: streamer } = await getTwitchStreamer({
        query: { username: streamerSearchQuery },
      });

      if (!streamer) {
        throw new Error("Invalid streamer!");
      }

      return streamer;
    },
    onSuccess: (streamer) => {
      if (!streamer) return;
      setValue("streamer.twitchId", streamer.id);
      setValue("streamer.displayName", streamer.display_name);
      setValue("streamer.profileImage", streamer.thumbnail_url);
      setValue("streamer.login", streamer.broadcaster_login);
    },
    onError: (error: Error) => {
      setError("streamerSearchQuery", {
        type: "validate",
        message: error.message,
      });
    },
  });

  const lolAccountMutation = useMutation({
    mutationFn: async () => {
      clearErrors("lolAccounts");

      const accountExists = lolAccounts.fields.some(
        (lolAccount) =>
          lolAccount.username.toLowerCase() === lolUsername.toLowerCase() &&
          lolAccount.tag.toLowerCase() === lolTag.toLowerCase(),
      );

      if (accountExists) {
        throw new Error("Account already added!");
      }

      if (!lolUsername) {
        throw new Error("LoL Username is required!");
      }

      if (!lolTag) {
        throw new Error("Tag is required!");
      }

      const { data: lolAccount } = await getRiotGamesAccount({
        query: { username: lolUsername, tag: lolTag, server: lolServer },
      });

      if (!lolAccount) {
        throw new Error("Account not found!");
      }

      return lolAccount;
    },
    onSuccess: (lolAccount) => {
      lolAccounts.append({
        username: lolAccount.gameName,
        tag: lolAccount.tagLine,
        puuid: lolAccount.puuid,
        server: lolServer,
      });
      setValue("lolUsername", "");
      setValue("lolTag", "");
    },
    onError: (error: Error) => {
      setError("lolAccounts", {
        type: "custom",
        message: error.message,
      });
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: AddStreamerForm) => {
      await putApiStreamer({
        body: {
          twitchId: data.streamer.twitchId,
          displayName: data.streamer.displayName,
          login: data.streamer.login,
          profileImage: data.streamer.profileImage,
          lolAccounts: data.lolAccounts,
        },
      });
    },
    onSuccess: () => {
      navigate("/");
    },
    onError: (error: Error) => {
      setError("root", {
        type: "custom",
        message: error.message || "Failed to add streamer",
      });
    },
  });

  function handleBack() {
    setValue("streamer.twitchId", undefined as unknown as string);
    setValue("streamer.displayName", undefined as unknown as string);
    setValue("streamer.profileImage", undefined as unknown as string);
    setValue("streamer.login", undefined as unknown as string);
  }

  const canSubmit = stepTwo && lolAccounts.fields.length > 0 && !submitMutation.isPending;

  return (
    <div className="p-3 flex flex-col justify-center gap-5 max-w-125">
      <h1 className="mt-5 text-3xl text-center sm:text-4xl">
        Add new streamer
      </h1>
      <form
        className="flex flex-col justify-center gap-5"
        onSubmit={handleSubmit((data) => submitMutation.mutate(data))}
      >
        <div className="flex flex-col gap-3 border border-gray-two p-5 rounded">
          <TextBox
            placeholder="Twitch account"
            disabled={stepTwo}
            {...register("streamerSearchQuery", {
              required: "Invalid streamer!",
            })}
          />
          <ErrorMessage message={errors.streamerSearchQuery?.message} />
          <Button
            accentColor="secondary"
            onClick={() => streamerMutation.mutate()}
            loading={streamerMutation.isPending}
            disabled={stepTwo}
            type="button"
          >
            Next
          </Button>
        </div>

        <StepIndicator activeStep={stepTwo ? 2 : 1} />

        <div className="border border-gray-two p-5 rounded">
          <div className="grid grid-cols-5 gap-3">
            <TextBox
              className="col-span-3"
              placeholder="LOL Username"
              disabled={!stepTwo}
              maxLength={16}
              {...register("lolUsername")}
            />
            <TextBox
              className="col-span-1"
              placeholder="TAG"
              disabled={!stepTwo}
              maxLength={5}
              {...register("lolTag")}
            />
            <select
              id="server"
              className="col-span-1 h-10 text-[14px] placeholder-gray-six outline-none bg-gray-two px-3 py-1 rounded-[5px] border border-gray-three border-opacity-5 focus:ring-1 focus:ring-gray-three focus:ring-offset-1 focus:ring-offset-gray-two transition-all duration-400 ease-in-out disabled:opacity-30"
              disabled={!stepTwo}
              {...register("lolServer")}
            >
              {Object.values(Server).map((server) => (
                <option key={server} value={server}>
                  {server.toUpperCase()}
                </option>
              ))}
            </select>
            <ErrorMessage message={errors.lolAccounts?.message} className="col-span-full" />
            <Button
              className="h-10 col-span-full"
              accentColor="secondary"
              onClick={() => lolAccountMutation.mutate()}
              disabled={!stepTwo}
              loading={lolAccountMutation.isPending}
              type="button"
            >
              Add
            </Button>
            <div className="col-span-full">
              <ul className="flex flex-wrap gap-2">
                {lolAccounts.fields.map((item, index) => (
                  <li
                    key={item.id}
                    className="flex gap-2 items-center justify-center bg-gray-five px-4 py-0.5 rounded-full"
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
            accentColor="secondary"
            onClick={handleBack}
            disabled={!stepTwo}
            type="button"
          >
            Back
          </Button>
        </div>

        <ErrorMessage message={errors.root?.message} />

        <Button
          type="submit"
          className="ml-auto"
          disabled={!canSubmit}
          loading={submitMutation.isPending}
        >
          Add streamer
        </Button>
      </form>
    </div>
  );
}
