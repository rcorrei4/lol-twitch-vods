import {
  getTwitchAuthToken,
  insertTwitchAuthToken,
} from "@/prisma/tokenRepository";
import { NextRequest } from "next/server";

async function getTwitchToken(client_id: string, client_secret: string) {
  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${client_id}&client_secret=${client_secret}&grant_type=client_credentials`,
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

async function searchStreamer(
  username: string,
  client_id: string,
  twitchToken: string
) {
  const result = await fetch(
    `https://api.twitch.tv/helix/search/channels?query=${username}`,
    {
      headers: {
        "Client-Id": client_id,
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

export async function GET(request: NextRequest) {
  const client_id = process.env.TWITCH_CLIENT_ID;
  const client_secret = process.env.TWITCH_CLIENT_SECRET;

  if (client_id === undefined || client_secret === undefined) {
    throw Error("Expected CLIENT_ID and CLIENT_SECRET env variables!");
  }

  let token = await getTwitchAuthToken();

  if (token === undefined) {
    token = await getTwitchToken(client_id, client_secret);
  }

  const streamerUsername = request.nextUrl.searchParams.get("username");

  if (streamerUsername === null) {
    throw Error("Missing streamer username!");
  }

  try {
    const result = await searchStreamer(streamerUsername, client_id, token);

    return Response.json({ data: result });
  } catch (error) {
    console.log(error);
  }
}
