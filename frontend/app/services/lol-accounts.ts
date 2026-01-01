import { apiClient } from "./api-client";

export type LolAccountResponse = {
  gameName: string;
  tagLine: string;
  puuid: string;
};

export async function getLolAccountPuuid(
  username: string,
  tag: string
): Promise<LolAccountResponse> {
  try {
    const response = await apiClient.get<LolAccountResponse>(
      `/riot/lol-account`,
      {
        params: { username, tag },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch LoL account:", error);
    throw error;
  }
}
