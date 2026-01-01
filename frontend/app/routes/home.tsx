import { HomePage } from "~/pages/Home/HomePage";
import { listStreamers } from "~/services/streamers";
import { getChampions } from "~/services/champions";
import type { Route } from "./+types/home";

export async function loader() {
  try {
    // Fetch streamers and champions in parallel
    const [streamers, champions] = await Promise.all([
      listStreamers(),
      getChampions(),
    ]);

    // Map streamers to gallery format
    const streamersGallery = streamers.map((streamer) => ({
      label: streamer.displayName,
      id: streamer.id,
      imageUrl: streamer.profileImage,
    }));

    return {
      streamers: streamersGallery,
      champions,
    };
  } catch (error) {
    console.error("Error loading home page data:", error);
    // Return empty arrays on error
    return {
      streamers: [],
      champions: [],
    };
  }
}

export function meta() {
  return [
    { title: "LoL Vods - Find League of Legends VODs" },
    {
      name: "description",
      content: "Search and find League of Legends VODs by streamer, champion, and matchup",
    },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <HomePage {...loaderData} />;
}
