"use client";

import { Match, Participant } from "@prisma/client";
import Image from "next/image";

type StreamerMatch = Match & {
  participants: Participant[];
};

type ListMatchesPageProps = {
  matches: StreamerMatch[];
  champions?: string[];
};

export function ListMatchesPage({ matches, champions }: ListMatchesPageProps) {
  console.log(matches);
  console.log(champions);

  const searchedMatchups = matches.map((match) => {
    const player = match.participants.find((participant) =>
      champions?.includes(participant.championName)
    );

    const enemy = match.participants.find(
      (participant) =>
        participant !== player && participant.position === player?.position
    );

    return {
      player: player,
      enemy: enemy,
      ...match,
    };
  });

  console.log(searchedMatchups);

  return (
    <div className="p-5 flex flex-col gap-3">
      {searchedMatchups.map((match) => {
        return (
          <div
            key={match.id}
            className={`${
              match.player?.win ? "bg-[#303043]" : "bg-[#2E1F24]"
            } p-5`}
          >
            <Image
              src={`/champions/${match.player?.championName}.png`}
              alt={match.player?.championName ?? ""}
              width={80}
              height={80}
              className="transition-transform duration-150 peer-checked:shadow-[0_0_0_5px] peer-checked:shadow-primary peer-checked:scale-90"
            />
            <Image
              src={`/champions/${match.enemy?.championName}.png`}
              alt={match.enemy?.championName ?? ""}
              width={80}
              height={80}
              className="transition-transform duration-150 peer-checked:shadow-[0_0_0_5px] peer-checked:shadow-primary peer-checked:scale-90"
            />
          </div>
        );
      })}
    </div>
  );
}
