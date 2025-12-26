"use client";

import { SearchResultMatch } from "@/application/actions/getStreamers";
import Image from "next/image";
import { useRef, useState } from "react";
import { TbSwords } from "react-icons/tb";

type ListMatchesPageProps = {
  matches: SearchResultMatch[];
  champions?: string[];
  streamers?: string[];
  enemies?: string[];
};

export function ListMatchesPage({
  matches,
  champions,
  streamers,
  enemies,
}: ListMatchesPageProps) {
  const [selectedVOD, setSelectedVOD] = useState<
    [bigint | null, string | null] | null
  >(null);
  const playerRef = useRef<HTMLDivElement | null>(null);

  const handleMatchClick = (vodId: bigint, matchStartVod: string) => {
    setSelectedVOD([vodId, matchStartVod]);

    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const searchedMatchups = matches.map((match) => {
    // Make a better logic maybe?
    if (champions || streamers) {
      const player = match.participants.find(
        (participant) =>
          (champions?.includes(participant.championName) &&
            participant.streamer) ||
          (participant.streamer &&
            streamers?.includes(participant.streamer?.displayName))
      );

      const enemy = match.participants.find(
        (participant) =>
          participant !== player && participant.position === player?.position
      );

      return { player, enemy, ...match };
    } else {
      const enemy = match.participants.find((participant) =>
        enemies?.includes(participant.championName)
      );

      const player = match.participants.find(
        (participant) =>
          participant !== enemy && participant.position === enemy?.position
      );

      return { player, enemy, ...match };
    }
  });

  function getTimeDifference(date: Date) {
    const diffMs = Math.abs(Date.now() - date.getTime());
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes >= 60 * 24 * 30) {
      return `${Math.floor(diffMinutes / (60 * 24 * 30))}mo`;
    } else if (diffMinutes >= 60 * 24) {
      return `${Math.floor(diffMinutes / (60 * 24))}d`;
    } else if (diffMinutes >= 60) {
      return `${Math.floor(diffMinutes / 60)}h`;
    } else {
      return `${diffMinutes}min`;
    }
  }

  return (
    <div className="p-5 flex flex-col gap-3">
      <div
        ref={playerRef}
        className={`transition-all duration-700 overflow-hidden ease-in-out ${
          selectedVOD ? "max-h-[999px]" : "max-h-0"
        }`}
      >
        {selectedVOD && (
          <iframe
            key={selectedVOD[0]}
            src={`https://player.twitch.tv/?video=${selectedVOD[0]}&time=${selectedVOD[1]}&autoplay=true&parent=${process.env.NEXT_PUBLIC_BASE_URL}`}
            className="w-full aspect-video"
            allowFullScreen
            allow="encrypted-media"
          />
        )}
      </div>

      {searchedMatchups.map((match) => (
        <button
          key={match.id}
          className={`${
            match.player?.win
              ? "bg-[#303043] border-[#3A374B]"
              : "bg-[#2E1F24] border-[#443438]"
          } p-3 justify-around flex items-center border-t-[1px] rounded`}
          onClick={() => {
            if (!match.player?.vodId || !match.player?.matchStartVod) return;
            handleMatchClick(match.player.vodId, match.player.matchStartVod);
          }}
        >
          <div className="justify-around flex items-center gap-2 w-3/4">
            <span className="text-sm text-gray-400">
              {getTimeDifference(match.gameStartDatetime)} ago
            </span>
            <div className="flex items-center gap-2">
              <Image
                src={`/champions/${match.player?.championName}.png`}
                alt={match.player?.championName ?? ""}
                width={40}
                height={40}
                className="transition-transform duration-150"
              />
              <TbSwords size={30} className="stroke-slate-400" />
              <Image
                src={`/champions/${match.enemy?.championName}.png`}
                alt={match.enemy?.championName ?? ""}
                width={40}
                height={40}
                className="transition-transform duration-150"
              />
            </div>
            <span className="font-semibold">
              {match.player?.streamer?.displayName}
            </span>
          </div>
          <div className="flex gap-2 text-center text-slate-300 ml-auto">
            <div className="min-w-[14px]">{match.player?.kills}</div>
            <span className="text-gray-five">/</span>
            <div className="min-w-[14px] text-red-400">
              {match.player?.deaths}
            </div>
            <span className="text-gray-five">/</span>
            <div className="min-w-[14px]">{match.player?.assists}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
