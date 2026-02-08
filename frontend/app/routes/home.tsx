import fs from "fs";
import path from "path";
import { HomePage } from "~/pages/Home/HomePage";
import { getApiStreamers } from "~/services/generated";
import type { Route } from "./+types/home";

export async function loader() {
  try {
    const { data: streamers } = await getApiStreamers();

    if (!streamers) {
      throw Error("No streamers found!");
    }

    const streamersGallery = streamers.map((streamer) => ({
      label: streamer.displayName,
      id: streamer.id,
      imageUrl: streamer.profileImage,
    }));

    const championsDir = path.join(process.cwd(), "public/champions");
    let fileNames: string[] = [];

    try {
      fileNames = fs.readdirSync(championsDir);
    } catch (error) {
      console.error("Error reading champions directory:", error);
    }

    const champions = fileNames.map((fileName) => ({
      imageUrl: `/champions/${fileName}`,
      label: path.basename(fileName, path.extname(fileName)),
    }));

    return {
      streamers: streamersGallery,
      champions: champions,
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
      content:
        "Search and find League of Legends VODs by streamer, champion, and matchup",
    },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <HomePage {...loaderData} />;
}
