import { prisma } from "@/lib/prisma";
import { LolAccount, Position, Streamer } from "@prisma/client";
import { getApiRegion } from "../utils/get-region-from-server";
import { getTwitchAuthToken } from "./twitch/getTwitchToken";

const CLIENT_ID = process.env.TWITCH_CLIENT_ID || "";
const RIOT_GAMES_API_KEY = process.env.RIOT_GAMES_API_KEY;

type Participant = {
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  teamPosition: string;
  win: boolean;
  puuid: string;
  vodId?: string;
  matchStartVod?: string;
};

type MatchInfo = {
  gameStartTimestamp: number;
  gameEndTimestamp: number;
  gameId: number;
  participants: Participant[];
};

type Match = {
  info: MatchInfo;
};

type TwitchVideo = {
  id: string;
  streamer_id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  title: string;
  description: string;
  created_at: Date;
  published_at: Date;
  url: string;
  thumbnail_url: string;
  viewable: string;
  view_count: number;
  language: string;
  type: string;
  duration: string;
  muted_segments: [{ duration: number; offset: number }];
};

export async function listStreamerAccountMatches(
  lolAccount: LolAccount,
  endTime: number,
  matchesCount: number = 20
) {
  const region = getApiRegion(lolAccount.server);
  const response = await fetch(
    `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${lolAccount.puuid}/ids?api_key=${RIOT_GAMES_API_KEY}&endTime=${endTime}&count=${matchesCount}`
  );

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    console.error("Error while fetching player matches!");
  }
}

async function listStreamerVods(streamerId: string) {
  const token = await getTwitchAuthToken();

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

async function getMatch(
  matchId: string,
  region?: string
): Promise<Match | null> {
  const response = await fetch(
    `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${RIOT_GAMES_API_KEY}`
  );

  if (!response.ok) {
    console.error(`Failed to fetch match data for matchId=${matchId}`);
    return null;
  }

  const data = await response.json();
  const match: Match = {
    info: {
      gameStartTimestamp: data.info.gameStartTimestamp,
      gameEndTimestamp: data.info.gameEndTimestamp,
      gameId: data.info.gameId,
      participants: data.info.participants.map((participant: Participant) => ({
        championName: participant.championName,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        teamPosition: participant.teamPosition as Position,
        win: participant.win,
        puuid: participant.puuid,
      })),
    },
  };

  return match;
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

async function getMatchupVod(
  matchId: string,
  streamerVods: TwitchVideo[],
  streamerLolAccount: LolAccount
) {
  const apiRegion = getApiRegion(streamerLolAccount.server);
  const match = await getMatch(matchId, apiRegion);

  if (match === null) {
    console.error("Error while getting streamer match id=", matchId);
    return null;
  }

  const streamerParticipant = match.info.participants.find(
    (participant) => streamerLolAccount.puuid === participant.puuid
  );

  if (!streamerParticipant) {
    console.error("No matching participant found for match id=", matchId);
    return null;
  }

  for (const vod of streamerVods) {
    const vodStart = new Date(vod.created_at);
    const vodEnd = getVodEndDateTime(vodStart, vod.duration);
    const matchStart = new Date(match.info.gameStartTimestamp);
    const matchEnd = new Date(match.info.gameEndTimestamp);

    if (
      (vodStart <= matchStart && matchStart <= vodEnd) ||
      (vodStart <= matchEnd && matchEnd <= vodEnd)
    ) {
      let matchStartVod: string;
      if (vodStart > matchStart) {
        matchStartVod = `00h00m`;
      } else {
        const vodMatchStart = Math.abs(
          vodStart.getTime() - matchStart.getTime()
        );
        const hours = Math.floor(vodMatchStart / (1000 * 60 * 60));
        const minutes = Math.floor(
          (vodMatchStart % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((vodMatchStart % (1000 * 60)) / 1000);
        matchStartVod = `${hours}h${minutes}m${seconds}s`;
      }

      streamerParticipant.vodId = vod.id;
      streamerParticipant.matchStartVod = matchStartVod;
      return match;
    }
  }

  return null;
}

async function upsertStreamerMatchWithVod(
  match: Match,
  streamer: Streamer,
  streamerLolAccounts: LolAccount
) {
  try {
    const existingMatch = await prisma.match.findUnique({
      where: { id: BigInt(match.info.gameId) },
      include: { participants: true },
    });

    if (!existingMatch) {
      console.log("Inserting new match...");
      await prisma.match.create({
        data: {
          id: BigInt(match.info.gameId),
          gameStartDatetime: new Date(match.info.gameStartTimestamp),
          gameEndDatetime: new Date(match.info.gameEndTimestamp),
          participants: {
            create: match.info.participants.map((participant) => ({
              puuid: participant.puuid,
              championName: participant.championName,
              kills: participant.kills,
              deaths: participant.deaths,
              assists: participant.assists,
              position: participant.teamPosition as Position,
              win: participant.win,
              vodId: participant.vodId ? BigInt(participant.vodId) : undefined,
              matchStartVod: participant.matchStartVod,
              streamer: participant.vodId
                ? {
                    connect: {
                      id: streamer.id,
                    },
                  }
                : undefined,
            })),
          },
        },
      });

      console.log(`Inserted new match ${match.info.gameId} with participants.`);
      return;
    }

    const streamerParticipant = match.info.participants.find(
      (participant) => streamerLolAccounts.puuid === participant.puuid
    );

    if (streamerParticipant) {
      console.log("Updating existing match...");
      await prisma.participant.update({
        where: {
          puuid_matchId: {
            puuid: streamerParticipant.puuid,
            matchId: match.info.gameId,
          },
        },
        data: {
          vodId: streamerParticipant.vodId
            ? parseInt(streamerParticipant.vodId, 10)
            : null,
          matchStartVod: streamerParticipant.matchStartVod,
        },
      });

      console.log(`Updated VOD URL for streamer ${streamerParticipant.puuid}`);
    }
  } catch (error) {
    console.error(`Error upserting match ${match.info.gameId}:`, error);
  }
}

export async function createStreamerMatchupsVods(
  streamer: Streamer,
  lolAccounts: LolAccount[]
) {
  const streamerVods = await listStreamerVods(streamer.twitchId);
  //const firstVodStartTime = new Date(streamerVods[0].created_at);

  const lastVodEndTime = getVodEndDateTime(
    new Date(streamerVods.at(-1).created_at),
    streamerVods.at(-1).duration
  );

  for (const streamerLolAccount of lolAccounts) {
    const accountMatches: [] = await listStreamerAccountMatches(
      streamerLolAccount,
      lastVodEndTime.getTime()
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    for (const accountMatch of accountMatches) {
      const vodMatchup = await getMatchupVod(
        accountMatch,
        streamerVods,
        streamerLolAccount
      );
      if (vodMatchup) {
        await upsertStreamerMatchWithVod(
          vodMatchup,
          streamer,
          streamerLolAccount
        );
      }
    }
  }

  console.log("Finished");
}

export async function updateStreamerMatchupsVods(streamerId: string) {
  const streamer = await prisma.streamer.findUnique({
    where: {
      twitchId: streamerId,
    },
  });

  if (!streamer) {
    console.error("Streamer not found while trying to update matchups");
    return;
  }

  const streamerLolAccounts = await prisma.lolAccount.findMany({
    where: {
      streamerId: streamer.id,
    },
  });

  await createStreamerMatchupsVods(streamer, streamerLolAccounts);
}
