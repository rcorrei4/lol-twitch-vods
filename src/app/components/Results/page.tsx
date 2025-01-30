"use client";

import { Match, Participant } from "@prisma/client";
import Image from "next/image";
import { useRef, useState } from "react";
import { TbSwords } from "react-icons/tb";

type StreamerMatch = Match & {
  participants: Participant[];
};

type ListMatchesPageProps = {
  matches: StreamerMatch[];
  champions?: string[];
};

export function ListMatchesPage({ matches, champions }: ListMatchesPageProps) {
  const [selectedVOD, setSelectedVOD] = useState<
    [number | null, string | null] | null
  >(null);
  const playerRef = useRef<HTMLDivElement | null>(null);

  const handleMatchClick = (vodId: number, matchStartVod: string) => {
    setSelectedVOD([vodId, matchStartVod]);

    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const searchedMatchups = matches.map((match) => {
    const player = match.participants.find((participant) =>
      champions?.includes(participant.championName)
    );

    const enemy = match.participants.find(
      (participant) =>
        participant !== player && participant.position === player?.position
    );

    return { player, enemy, ...match };
  });

  return (
    <div className="p-5 flex flex-col gap-3">
      <div
        ref={playerRef}
        className={`transition-all duration-500 ease-in-out ${
          selectedVOD ? "min-h-[200px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {selectedVOD && (
          <iframe
            key={selectedVOD[0]} // Garante que o iframe é recriado corretamente
            src={`https://player.twitch.tv/?video=${selectedVOD[0]}&time=${selectedVOD[1]}&autoplay=true&parent=localhost`}
            className="w-full h-[500px] border-0"
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
          } p-3 flex items-center border-t-2`}
          onClick={() =>
            handleMatchClick(match.player?.vodId, match.player?.matchStartVod)
          }
        >
          <div className="flex items-center gap-2">
            <Image
              src={`/champions/${match.player?.championName}.png`}
              alt={match.player?.championName ?? ""}
              width={40}
              height={40}
              className="transition-transform duration-150"
            />
            <TbSwords size={30} className="stroke-slate-300" />
            <Image
              src={`/champions/${match.enemy?.championName}.png`}
              alt={match.enemy?.championName ?? ""}
              width={40}
              height={40}
              className="transition-transform duration-150"
            />
          </div>
          <div className="flex gap-2 text-center text-slate-300 ml-auto">
            <div className="min-w-[14px]">{match.player?.kills}</div>
            <span>/</span>
            <div className="min-w-[14px]">{match.player?.deaths}</div>
            <span>/</span>
            <div className="min-w-[14px]">{match.player?.assists}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
