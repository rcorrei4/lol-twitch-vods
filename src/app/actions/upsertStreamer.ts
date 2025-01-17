"use server";

import { prisma } from "@/lib/prisma";
import { Streamer } from "@prisma/client";

export type UpsertStreamerDTO = Omit<Streamer, "id" | "createdAt">;

export default async function updateOrCreateStreamer(data: UpsertStreamerDTO) {
  const streamer = await prisma.streamer.findFirst({
    where: {
      twitchId: data.twitchId,
    },
  });

  const lolAccounts = streamer?.lolAccounts || [];

  await prisma.streamer.upsert({
    where: {
      twitchId: data.twitchId,
    },
    update: {
      lolAccounts: lolAccounts.concat(data.lolAccounts),
      displayName: data.displayName,
      login: data.login,
      profileImage: data.profileImage,
    },
    create: data,
  });
}
