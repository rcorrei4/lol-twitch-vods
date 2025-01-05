"use server";

const RIOT_GAMES_API_KEY = process.env.RIOT_GAMES_API_KEY;

export default async function getLolAccountPuuid(
  username: string,
  tag: string
) {
  const response = await fetch(
    `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${username}/${tag}?api_key=${RIOT_GAMES_API_KEY}`
  );

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    if (response.status === 403) {
      return {
        message: "Internal server error!",
      };
    } else if (response.status === 404) {
      return {
        message: "Account not found!",
      };
    }
  }
}
