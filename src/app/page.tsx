import { listStreamers } from "@application/actions/getStreamers";
import HomePage from "@application/pages/Home/HomePage";
import fs from "fs";
import path from "path";

export default async function Home() {
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

  let streamers: any = [];
  try {
    streamers = await listStreamers();
  } catch (error) {
    console.error("Error fetching streamers:", error);
  }

  const streamersGallery = streamers.map((streamer: any) => ({
    label: streamer.displayName,
    id: streamer.id,
    imageUrl: streamer.profileImage,
  }));

  return <HomePage champions={champions} streamers={streamersGallery} />;
}
