"use server";

import { prisma } from "@/lib/prisma";
import { Streamer } from "@prisma/client";
import { createStreamerMatchupsVods } from "./getStreamerMatchups";
import { subscribeToStreamOfflineNotification } from "./twitch/subscribeToStreamOffline";

export type UpsertStreamerDTO = Omit<Streamer, "id" | "createdAt">;

export default async function updateOrCreateStreamer(data: UpsertStreamerDTO) {
  const streamer = await prisma.streamer.findFirst({
    where: {
      twitchId: data.twitchId,
    },
  });

  const lolAccounts = Array.from(
    new Set([...(streamer?.lolAccounts || []), ...data.lolAccounts])
  );

  const streamerUpsertResult = await prisma.streamer.upsert({
    where: {
      twitchId: data.twitchId,
    },
    update: {
      lolAccounts: lolAccounts,
      displayName: data.displayName,
      login: data.login,
      profileImage: data.profileImage,
    },
    create: data,
  });

  createStreamerMatchupsVods(streamerUpsertResult);

  if (!streamer) {
    subscribeToStreamOfflineNotification(data.twitchId);
  }
}
