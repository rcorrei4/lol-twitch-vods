import { listMatches } from '~/application/actions/getStreamers';
import { ListMatchesPage } from '~/application/pages/Results/ResultsPage';

type ResultsProps = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export default async function Results({ searchParams }: ResultsProps) {
  const streamers = (await searchParams).streamers?.split(',');
  const champions = (await searchParams).champions?.split(',');
  const enemyChampions = (await searchParams).enemyChampions?.split(',');

  const results = await listMatches(streamers, champions, enemyChampions);

  return (
    <ListMatchesPage
      matches={results}
      streamers={streamers}
      champions={champions}
      enemies={enemyChampions}
    />
  );
}
