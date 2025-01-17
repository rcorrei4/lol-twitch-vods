"use server";

import { prisma } from "@/lib/prisma";
import { getTwitchAuthToken } from "./twitch/getTwitchToken";

const CLIENT_ID = process.env.TWITCH_CLIENT_ID || "";
const RIOT_GAMES_API_KEY = process.env.RIOT_GAMES_API_KEY;

async function getStreamerAccountMatches(
  accountPuuid: string,
  endTime: number
) {
  const response = await fetch(
    `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${accountPuuid}/ids?api_key=${RIOT_GAMES_API_KEY}&endTime=${endTime}&count=20`
  );

  if (response.ok) {
    const data = await response.json();
    return data;
  }
}

async function getStreamerVods(streamerId: string) {
  let token = await getTwitchAuthToken();

  const request = await fetch(
    `https://api.twitch.tv/helix/videos?user_id=${streamerId}`,
    {
      headers: {
        "Client-Id": CLIENT_ID,
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (request.ok) {
    const data = await request.json();
    return data["data"];
  }
}

async function getMatch(matchId: string) {
  const response = await fetch(
    `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${RIOT_GAMES_API_KEY}`
  );

  if (response.ok) {
    const data = await response.json();
    return data;
  }
}

function getVodEndDateTime(vodStart: Date, duration: string) {
  const flexibleMatch = duration.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);

  if (!flexibleMatch) {
    throw Error("Error while parsing vod duration");
  }

  const hours = parseInt(flexibleMatch[1] || "0", 10);
  const minutes = parseInt(flexibleMatch[2] || "0", 10);
  const seconds = parseInt(flexibleMatch[3] || "0", 10);

  const totalMilliseconds =
    hours * 3600 * 1000 + minutes * 60 * 1000 + seconds * 1000;

  const vodEnd = new Date(vodStart.getTime() + totalMilliseconds);

  return vodEnd;
}

async function getMatchupVod(matchId: string, streamerVods: any[]) {
  const match = await getMatch(matchId);

  for (const vod of streamerVods) {
    const vodStart = new Date(vod.created_at);

    const vodEnd = getVodEndDateTime(vodStart, vod.duration);
    const matchStart = new Date(
      parseInt(match["info"].gameStartTimestamp as string)
    );
    const matchEnd = new Date(
      parseInt(match["info"].gameEndTimestamp as string)
    );

    if (
      (vodStart <= matchStart && matchStart <= vodEnd) ||
      (vodStart <= matchEnd && matchEnd <= vodEnd)
    ) {
      if (vodStart > matchStart) {
        return `${vod.url}?t=00h00h`;
      }

      const vodMatchStart = Math.abs(vodStart.getTime() - matchStart.getTime());
      const hours = Math.floor(vodMatchStart / (1000 * 60 * 60));
      const minutes = Math.floor(
        (vodMatchStart % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((vodMatchStart % (1000 * 60)) / 1000);
      return `${vod.url}?t=${hours}h${minutes}m${seconds}s`;
    }
  }
}

export async function getStreamerMatchupsVods(id: number) {
  const streamer = await prisma.streamer.findUnique({
    where: {
      id: id,
    },
  });

  if (streamer === null) {
    return [];
  }

  const streamerVods = await getStreamerVods(streamer.twitchId);
  const firstVodStartTime = new Date(streamerVods[0].created_at);

  const lastVodEndTime = getVodEndDateTime(
    new Date(streamerVods.at(-1).created_at),
    streamerVods.at(-1).duration
  );

  const streamerAccountMatches: [] = [];

  for (const streamerAccount of streamer.lolAccounts) {
    const accountMatches: [] = await getStreamerAccountMatches(
      streamerAccount,
      lastVodEndTime.getTime()
    );
    streamerAccountMatches.push(...accountMatches);
  }

  const vodMatchups: string[] = [];
  for (const streamerAccountMatch of streamerAccountMatches) {
    const vodMatchup = await getMatchupVod(streamerAccountMatch, streamerVods);
    if (vodMatchup) {
      vodMatchups.push(vodMatchup);
    }
  }

  console.log(vodMatchups);
}
