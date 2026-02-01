import { ListMatchesPage } from "~/pages/Results/ResultsPage";
import { getMatches } from "~/services/generated";
import type { Route } from "./+types/results";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const streamers = url.searchParams.get("streamers")?.split(",");
  const champions = url.searchParams.get("champions")?.split(",");
  const enemyChampions = url.searchParams.get("enemyChampions")?.split(",");

  const { data: matches } = await getMatches({
    query: {
      streamers,
      champions,
      enemyChampions,
    },
    throwOnError: true,
  });

  return {
    matches,
    streamers,
    champions,
    enemies: enemyChampions,
  };
}

export function meta() {
  return [
    { title: "Results - LoL Vods" },
    {
      name: "description",
      content: "Search results for League of Legends VODs",
    },
  ];
}

export default function Results({ loaderData }: Route.ComponentProps) {
  return <ListMatchesPage {...loaderData} />;
}
