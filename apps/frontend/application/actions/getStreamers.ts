import { Match, Participant, Streamer } from '@prisma/client';
import { prisma } from '~/lib/prisma';

export async function listStreamers() {
  const streamers = await prisma.streamer.findMany();

  return streamers;
}

export type SearchResultMatch = {
  participants: ({
    streamer: Streamer | null;
  } & Participant)[];
} & Match;

export async function listMatches(
  streamers?: string[],
  champions?: string[],
  enemyChampions?: string[]
): Promise<SearchResultMatch[]> {
  const matches = await prisma.match.findMany({
    where: {
      participants: {
        some: {
          AND: [
            streamers && streamers.length > 0
              ? { streamer: { displayName: { in: streamers } } }
              : {},

            champions && champions.length > 0
              ? { championName: { in: champions } }
              : {},

            {
              streamer: {
                isNot: null,
              },
            },
          ],
        },
      },
    },
    include: {
      participants: {
        include: {
          streamer: true,
        },
      },
    },
    orderBy: {
      gameStartDatetime: 'desc',
    },
  });

  if (!enemyChampions) {
    return matches;
  }

  const filteredMatches = matches.filter((match) =>
    match.participants.some((participant) => {
      if (participant.streamerId) {
        const streamerLane = participant.position;

        const enemy = match.participants.find(
          (p) =>
            p.position === streamerLane &&
            p.streamerId !== participant.streamerId
        );

        return enemy && enemyChampions.includes(enemy.championName);
      }
      return false;
    })
  );

  return filteredMatches;
}
