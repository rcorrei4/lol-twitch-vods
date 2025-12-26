import { getApiRegion } from "@/application/utils/get-region-from-server";
import { NextRequest } from "next/server";

const RIOT_GAMES_API_KEY = process.env.RIOT_GAMES_API_KEY;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const accountPuuid = searchParams.get("puuid");
  if (!accountPuuid) {
    return new Response(null, {
      status: 400,
      statusText: "URL param {server} is missing!",
    });
  }

  const accountServer = searchParams.get("server");

  if (!accountServer) {
    return new Response(null, {
      status: 400,
      statusText: "URL param {puuid} is missing!",
    });
  }

  const region = getApiRegion(accountServer);

  const response = await fetch(
    `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${accountPuuid}/ids?api_key=${RIOT_GAMES_API_KEY}&count=0`
  );

  if (response.ok) {
    const data: string[] = await response.json();
    if (data.length > 0) {
      return new Response(null, {
        status: 204,
      });
    }

    return new Response(null, {
      status: 404,
    });
  }

  return new Response(null, {
    status: 500,
  });
}
