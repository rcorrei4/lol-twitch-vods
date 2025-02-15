import fs from 'fs';
import path from 'path';
import { Suspense } from 'react';
import { listStreamers } from '~/application/actions/getStreamers';
import HomePage from '~/application/pages/Home/HomePage';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const championsDir = path.join(process.cwd(), 'public/champions');
  let fileNames: string[] = [];

  try {
    fileNames = fs.readdirSync(championsDir);
  } catch (error) {
    console.error('Error reading champions directory:', error);
  }

  const champions = fileNames.map((fileName) => ({
    imageUrl: `/champions/${fileName}`,
    label: path.basename(fileName, path.extname(fileName)),
  }));

  try {
    const streamers = await listStreamers();

    const streamersGallery = streamers.map((streamer) => ({
      label: streamer.displayName,
      id: streamer.id,
      imageUrl: streamer.profileImage,
    }));

    return (
      <Suspense>
        <HomePage champions={champions} streamers={streamersGallery} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error fetching streamers:', error);
  }
}
