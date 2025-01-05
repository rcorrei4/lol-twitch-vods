"use server";

import { prisma } from "@/lib/prisma";
import type { Streamer } from "@prisma/client";

export type UpsertStreamerDTO = Omit<Streamer, "id" | "createdAt">;

export async function upsertStreamer(data: UpsertStreamerDTO) {
  const streamer = await prisma.streamer.upsert({
    where: {
      twitchId: data.twitchId,
    },
    update: {
      lolAccounts: data.lolAccounts,
    },
    create: data,
  });
}
