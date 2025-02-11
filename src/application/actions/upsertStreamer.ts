"use server";

import { prisma } from "@/lib/prisma";
import { LolAccount, Streamer } from "@prisma/client";
import { createStreamerMatchupsVods } from "./getStreamerMatchups";
import { subscribeToStreamOfflineNotification } from "./twitch/subscribeToStreamOffline";

export type UpsertStreamerDTO = Omit<Streamer, "id" | "createdAt">;
type UpsertLolAccountDTO = Omit<LolAccount, "id" | "streamerId">;

type updateOrCreateStreamerInput = {
  streamer: UpsertStreamerDTO;
  lolAccounts: UpsertLolAccountDTO[];
};

export default async function updateOrCreateStreamer({
  streamer,
  lolAccounts,
}: updateOrCreateStreamerInput) {
  const existingStreamer = await prisma.streamer.findFirst({
    where: {
      twitchId: streamer.twitchId,
    },
  });

  const streamerUpsertResult = await prisma.streamer.upsert({
    where: {
      twitchId: streamer.twitchId,
    },
    update: {
      displayName: streamer.displayName,
      login: streamer.login,
      profileImage: streamer.profileImage,
    },
    create: streamer,
  });

  const updatedLolAccounts = await Promise.all(
    lolAccounts.map((lolAccount) =>
      prisma.lolAccount.upsert({
        where: { puuid: lolAccount.puuid },
        create: {
          streamerId: streamerUpsertResult.id,
          ...lolAccount,
        },
        update: {
          username: lolAccount.username,
          tag: lolAccount.tag,
        },
      })
    )
  );

  createStreamerMatchupsVods(streamerUpsertResult, updatedLolAccounts);

  if (!existingStreamer) {
    subscribeToStreamOfflineNotification(streamer.twitchId);
  }
}
