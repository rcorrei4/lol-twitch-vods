import { apiClient } from './api-client';

export type TwitchStreamer = {
  id: string;
  broadcaster_login: string;
  display_name: string;
  thumbnail_url: string;
  [key: string]: any;
};

export async function fetchStreamerId(username: string): Promise<TwitchStreamer | undefined> {
  try {
    const response = await apiClient.get<TwitchStreamer>(`/twitch/streamer`, {
      params: { username },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch Twitch streamer:', error);
    throw error;
  }
}
