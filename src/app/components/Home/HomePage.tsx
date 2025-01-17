"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../Button/Button";
import { GalleryElement } from "../Gallery/Gallery";
import Tabs from "../Tabs/Tabs";

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
      const href = "/results?" + searchParams.toString();
      router.push(href);
    }
  };

  return (
    <>
      <Tabs champions={champions} streamers={streamers} />
      <Button
        className="fixed bottom-10 right-10 shadow-2xl shadow-gray-two"
        onClick={handleFormSubmit}
      >
        Get results
      </Button>
    </>
  );
}
