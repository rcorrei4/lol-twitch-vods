import { NextRequest } from "next/server";

const RIOT_GAMES_API_KEY = process.env.RIOT_GAMES_API_KEY;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const username = searchParams.get("username");
  if (!username) {
    return new Response(null, {
      status: 400,
      statusText: "URL param {username} is missing!",
    });
  }

  const tag = searchParams.get("tag");

  if (!tag) {
    return new Response(null, {
      status: 400,
      statusText: "URL param {tag} is missing!",
    });
  }

  const response = await fetch(
    `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${username}/${tag}?api_key=${RIOT_GAMES_API_KEY}`
  );

  if (response.ok) {
    const data = await response.json();
    return Response.json({ data });
  } else {
    if (response.status === 403) {
      return new Response(null, {
        status: 500,
      });
    } else if (response.status === 404) {
      return new Response("Account not found!", {
        status: 404,
      });
    }
  }
}
