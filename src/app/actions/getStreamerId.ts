"use server";

const CLIENT_ID = process.env.TWITCH_CLIENT_ID || "";
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET || "";

import {
  getTwitchAuthToken,
  insertTwitchAuthToken,
} from "@/prisma/tokenRepository";

async function getTwitchToken() {
  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
    {
      method: "POST",
    }
  );

  if (response.ok) {
    const data = await response.json();
    const acess_token: string = data.access_token;

    if (acess_token !== undefined) {
      await insertTwitchAuthToken(data.access_token);

      return acess_token;
    }

    throw Error("Error while fetching twitch token!");
  } else {
    throw new Error(
      `Failed to fetch token: ${response.status} ${response.statusText}`
    );
  }
}

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
        item?.broadcaster_login && item.broadcaster_login === username
    );

    if (!streamer) {
      streamer = responseData.data?.find((item: any) =>
        Object.values(item).some((value) => value === username)
      );
    }

    return streamer;
  }
}

export async function getStreamerId(streamerUsername: string) {
  if (CLIENT_ID === undefined || CLIENT_SECRET === undefined) {
    throw Error("Expected CLIENT_ID and CLIENT_SECRET env variables!");
  }

  let token = await getTwitchAuthToken();

  if (token === undefined) {
    token = await getTwitchToken();
  }

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
