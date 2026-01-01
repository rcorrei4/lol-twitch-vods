// Domain types derived from Prisma schema (without Prisma decorators)

export enum Position {
  TOP = "TOP",
  JUNGLE = "JUNGLE",
  MIDDLE = "MIDDLE",
  BOTTOM = "BOTTOM",
  UTILITY = "UTILITY",
}

export enum Server {
  BR = "br",
  EUNE = "eune",
  EUW = "euw",
  JP = "jp",
  KR = "kr",
  LAN = "lan",
  LAS = "las",
  NA = "na",
  OCE = "oce",
  TR = "tr",
  ME = "me",
  RU = "ru",
}

export type Token = {
  id: number;
  access_token: string;
  expires_at: Date;
};

export type LolAccount = {
  id: number;
  puuid: string;
  username: string;
  tag: string;
  server: Server;
  streamerId: number | null;
};

export type Streamer = {
  id: number;
  twitchId: string;
  displayName: string;
  login: string;
  profileImage: string;
  createdAt: Date | string;
};

export type Match = {
  id: string | number; // BigInt from DB, may come as string
  gameEndDatetime: Date | string;
  gameStartDatetime: Date | string;
  gameDuration?: number;
};

export type Participant = {
  id: number;
  puuid: string;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  position: Position | string;
  win: boolean;
  vodId: string | number | null; // BigInt from DB
  matchStartVod: string | null;
  matchId: string | number; // BigInt from DB
  streamerId: number | null;
};

// Extended types for search results
export type SearchResultMatch = Match & {
  participants: (Participant & { streamer: Streamer | null })[];
};

// Component types
export type GalleryElement = {
  id?: number;
  imageUrl: string;
  label: string;
};

export type GalleryForm = {
  champions: string[];
  enemyChampions: string[];
  streamers: string[];
};
