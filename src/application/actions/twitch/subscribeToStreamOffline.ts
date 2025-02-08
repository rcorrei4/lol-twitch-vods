import { getTwitchAuthToken } from "./getTwitchToken";

const CLIENT_ID = process.env.TWITCH_CLIENT_ID || "";
const APP_BASE_URL = process.env.APP_BASE_URL;
const TWITCH_EVENTSUB_SECRET = process.env.TWITCH_EVENTSUB_SECRET;

export async function subscribeToStreamOfflineNotification(streamerId: string) {
  if (!APP_BASE_URL || APP_BASE_URL === "") {
    throw Error("Missing APP_BASE_URL env variable!");
  }

  if (!TWITCH_EVENTSUB_SECRET || TWITCH_EVENTSUB_SECRET === "") {
    throw Error("Secret is missing from TWITCH_EVENTSUB_SECRET env variable!");
  }

  const token = await getTwitchAuthToken();

  console.log(
    `Subscribing to stream offline notification for streamerId: ${streamerId}...`
  );
  const body = {
    type: "stream.offline",
    version: "1",
    condition: { broadcaster_user_id: streamerId },
    transport: {
      method: "webhook",
      callback: APP_BASE_URL + "/api/update-streamer-matchups",
      secret: TWITCH_EVENTSUB_SECRET,
    },
  };

  await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions`, {
    headers: {
      "Client-Id": CLIENT_ID,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
