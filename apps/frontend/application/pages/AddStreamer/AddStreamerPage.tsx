'use client';

import { LolAccount, Server } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { fetchStreamerId } from '~/application/actions/twitch/fetchStreamerId';
import updateOrCreateStreamer, {
  UpsertStreamerDTO,
} from '~/application/actions/upsertStreamer';
import { Button } from '~/application/components/Button/Button';
import { TextBox } from '~/application/components/TextBox/TextBox';

type UpsertLolAccount = Omit<LolAccount, 'id' | 'streamerId'>;

type AddStreamerForm = {
  streamer: Omit<UpsertStreamerDTO, 'lolAccounts'>;
  lolAccounts: UpsertLolAccount[];
  streamerSearchQuery: string;
};

export default function AddStreamerPage() {
  const { push } = useRouter();

  const [lolUsername, setLolUsername] = useState('');
  const [lolTag, setLolTag] = useState('');
  const [lolServer, setLolServer] = useState<Server>('br');
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
    name: 'lolAccounts',
  });

  async function fetchStreamer() {
    setLoading(true);
    await trigger('streamerSearchQuery');

    if (errors.streamerSearchQuery) {
      setLoading(false);
      return;
    }

    const streamerSearchQuery = getValues('streamerSearchQuery');
    const streamer = await fetchStreamerId(streamerSearchQuery);

    if (!streamer) {
      setError('streamerSearchQuery', {
        type: 'validate',
        message: 'Invalid streamer!',
      });
      setLoading(false);
      return;
    }

    setValue('streamer.twitchId', streamer['id']);
    setValue('streamer.displayName', streamer['display_name']);
    setValue('streamer.profileImage', streamer['thumbnail_url']);
    setValue('streamer.login', streamer['broadcaster_login']);

    setLoading(false);
    setStepTwo(true);
  }

  async function fetchLolAccount() {
    setLoading(true);
    clearErrors('lolAccounts');

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
      setError('lolAccounts', {
        type: 'required',
        message: 'LoL Username is required!',
      });
      setLoading(false);
      return;
    }

    if (!lolTag) {
      setError('lolAccounts', {
        type: 'required',
        message: 'Tag is required!',
      });

      setLoading(false);
      return;
    }

    if (!lolServer) {
      setError('lolAccounts', {
        type: 'required',
        message: 'LoL Account Server is required!',
      });
      setLoading(false);
      return;
    }

    const result = await fetch(
      `/api/get-lol-account-puuid?username=${lolUsername}&tag=${lolTag}`
    );

    if (result.ok) {
      const data = await result.json();
      lolAccounts.append({
        username: data.data['gameName'],
        tag: data.data['tagLine'],
        puuid: data.data['puuid'],
        server: lolServer,
      });
    } else {
      const responseText = await result.text();
      console.log(responseText);
      setError('lolAccounts', {
        type: 'custom',
        message: responseText || result.statusText,
      });
    }
    setLoading(false);
  }

  async function handleSubmitForm(data: AddStreamerForm) {
    await updateOrCreateStreamer({
      streamer: {
        twitchId: data.streamer.twitchId,
        displayName: data.streamer.displayName,
        login: data.streamer.login,
        profileImage: data.streamer.profileImage,
      },
      lolAccounts: data.lolAccounts,
    });

    push('/');
  }

  return (
    <div className="p-3 flex flex-col justify-center gap-5 max-w-[500px]">
      <h1 className="mt-5 text-3xl text-center sm:text-4xl">
        Add new streamer
      </h1>
      <form
        className="flex flex-col justify-center gap-5"
        onSubmit={handleSubmit(handleSubmitForm)}
      >
        <div className="flex flex-col gap-3 border border-gray-two p-5 rounded">
          <TextBox
            placeholder="Twitch account"
            disabled={stepTwo ? true : false}
            {...register('streamerSearchQuery', {
              required: 'Invalid streamer!',
            })}
          />
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              errors.streamerSearchQuery
                ? 'max-h-20 opacity-100'
                : 'max-h-0 opacity-0'
            }`}
          >
            <p className="text-sm text-red-400">
              {errors.streamerSearchQuery?.message}
            </p>
          </div>
          <Button
            accentColor={'secondary'}
            onClick={fetchStreamer}
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
                stepTwo ? 'opacity-0' : 'opacity-100'
              }`}
            ></span>
          </span>

          <div className="h-[25px] w-[2px] bg-gray-three" />
          <span className="flex justify-center items-center w-5 h-5 border-gray-two border-2 rounded-full">
            <span
              className={`flex w-4 h-4 rounded-full bg-primary transition-all duration-500 ease-in-out ${
                stepTwo ? 'opacity-100' : 'opacity-0'
              }`}
            ></span>
          </span>
        </div>
        <div className="border border-gray-two p-5 rounded">
          <div className="grid grid-cols-5 gap-3">
            <TextBox
              className="col-span-3"
              onChange={(e) => {
                setLolUsername(e.target.value);
              }}
              value={lolUsername}
              placeholder="LOL Username"
              disabled={stepTwo ? false : true}
              maxLength={16}
            />
            <TextBox
              className="col-span-1"
              onChange={(e) => {
                setLolTag(e.target.value);
              }}
              value={lolTag}
              placeholder="TAG"
              disabled={stepTwo ? false : true}
              maxLength={5}
            />
            <select
              id="server"
              className="col-span-1 h-[40px] text-[14px] placeholder-gray-six outline-none bg-gray-two px-3 py-1 rounded-[5px] border border-gray-three border-opacity-5 focus:ring-1 focus:ring-gray-three focus:ring-offset-1 focus:ring-offset-gray-two transition-all duration-400 ease-in-out disabled:opacity-30"
              onChange={(e) => {
                setLolServer(e.target.value as Server);
              }}
            >
              {Object.values(Server).map((server) => (
                <option key={server} value={server}>
                  {server.toUpperCase()}
                </option>
              ))}
            </select>
            <div
              className={`col-span-full transition-all duration-500 ease-in-out ${
                errors.lolAccounts
                  ? 'max-h-20 opacity-100'
                  : 'max-h-0 opacity-0'
              }`}
            >
              <p className="text-sm text-red-400">
                {errors.lolAccounts?.message}
              </p>
            </div>
            <Button
              className="h-[40px] col-span-full "
              accentColor={'secondary'}
              onClick={fetchLolAccount}
              disabled={stepTwo ? false : true}
              loading={stepTwo && loading}
              type="button"
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
            accentColor={'secondary'}
            onClick={() => setStepTwo(false)}
            disabled={stepTwo ? false : true}
            type="button"
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
