"use server";

import { upsertStreamer, UpsertStreamerDTO } from "@/prisma/streamerRepository";

export default async function updateOrCreateStreamer(data: UpsertStreamerDTO) {
  await upsertStreamer(data);
}
