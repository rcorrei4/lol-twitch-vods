'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '~/application/components/Button/Button';
import { GalleryElement } from '~/application/components/Gallery/Gallery';
import Tabs from '~/application/components/Tabs/Tabs';

type HomePageProps = {
  streamers: GalleryElement[];
  champions: GalleryElement[];
};

export type GalleryForm = {
  champions: string[];
  enemyChampions: string[];
  streamers: string[];
};

export default function HomePage({ streamers, champions }: HomePageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleFormSubmit = async () => {
    if (searchParams.size > 0) {
      const href = '/results?' + searchParams.toString();
      router.push(href);
    }
  };

  return (
    <div>
      <Tabs champions={champions} streamers={streamers} />
      <Button
        className="fixed bottom-10 right-10 shadow-2xl shadow-gray-two"
        onClick={handleFormSubmit}
      >
        Get results
      </Button>
    </div>
  );
}
