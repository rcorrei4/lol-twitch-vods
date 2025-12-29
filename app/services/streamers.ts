import { apiClient } from './api-client';

export type Streamer = {
  id: number;
  twitchId: string;
  displayName: string;
  login: string;
  profileImage: string;
  createdAt: string;
};

export type UpsertStreamerDTO = Omit<Streamer, 'id' | 'createdAt'>;

export type UpsertLolAccountDTO = {
  username: string;
  tag: string;
  puuid: string;
  server: string;
};

export type UpsertStreamerInput = {
  streamer: UpsertStreamerDTO;
  lolAccounts: UpsertLolAccountDTO[];
};

export async function listStreamers(): Promise<Streamer[]> {
  const response = await apiClient.get<Streamer[]>('/streamers');
  return response.data;
}

export async function upsertStreamer(data: UpsertStreamerInput): Promise<Streamer> {
  const response = await apiClient.post<Streamer>('/streamers', data);
  return response.data;
}
