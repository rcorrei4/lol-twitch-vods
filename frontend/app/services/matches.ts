import { apiClient } from "./api-client";
import type { Streamer } from "./streamers";

export type Match = {
  id: string;
  gameStartDatetime: Date;
  gameDuration: number;
};

export type Participant = {
  id: number;
  matchId: string;
  streamerId: number | null;
  championName: string;
  position: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  vodId: string | null;
  matchStartVod: string | null;
};

export type SearchResultMatch = {
  participants: (Participant & { streamer: Streamer | null })[];
} & Match;

export type ListMatchesParams = {
  streamers?: string[];
  champions?: string[];
  enemyChampions?: string[];
};

export async function listMatches(
  params: ListMatchesParams
): Promise<SearchResultMatch[]> {
  const response = await apiClient.get<SearchResultMatch[]>("/matches", {
    params,
  });
  return response.data;
}
