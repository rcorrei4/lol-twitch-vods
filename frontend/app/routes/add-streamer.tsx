import { AddStreamerPage } from "~/pages/AddStreamer/AddStreamerPage";
import type { Route } from "./+types/add-streamer";

export function meta() {
  return [
    { title: "Add Streamer - LoL Vods" },
    { name: "description", content: "Add a new streamer to track VODs" },
  ];
}

export default function AddStreamer() {
  return <AddStreamerPage />;
}
