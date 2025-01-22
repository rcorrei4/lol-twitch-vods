import { listMatches } from "../actions/getStreamers";
import { ListMatchesPage } from "../components/Results/page";

type ResultsProps = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export default async function Results({ searchParams }: ResultsProps) {
  const streamers = (await searchParams).streamers;
  const champions = (await searchParams).champions;
  const enemyChampions = (await searchParams).enemyChampions;

  const results = await listMatches(
    streamers?.split(","),
    champions?.split(","),
    enemyChampions?.split(",")
  );

  return (
    <ListMatchesPage matches={results} champions={champions?.split(",")} />
  );
}
