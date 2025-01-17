"use server";

import { getTwitchAuthToken } from "./getTwitchToken";

const CLIENT_ID = process.env.TWITCH_CLIENT_ID || "";
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET || "";

async function searchStreamer(username: string, twitchToken: string) {
  const result = await fetch(
    `https://api.twitch.tv/helix/search/channels?query=${username}`,
    {
      headers: {
        "Client-Id": CLIENT_ID,
        Authorization: `Bearer ${twitchToken}`,
      },
    }
  );

  if (result.ok) {
    const responseData = await result.json();

    let streamer = responseData.data?.find(
      (item: any) =>
        (item?.broadcaster_login &&
          item.broadcaster_login.toLowerCase() === username.toLowerCase()) ||
        Object.values(item).some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase() === username.toLowerCase()
        )
    );

    return streamer;
  }
}

export async function getStreamerId(streamerUsername: string) {
  if (CLIENT_ID === undefined || CLIENT_SECRET === undefined) {
    throw Error("Expected CLIENT_ID and CLIENT_SECRET env variables!");
  }

  let token = await getTwitchAuthToken();

  if (streamerUsername === undefined) {
    throw Error("Missing streamer username!");
  }

  try {
    const result = await searchStreamer(streamerUsername, token);

    return result;
  } catch (error) {
    console.log(error);
  }
}
