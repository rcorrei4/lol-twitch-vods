"use client";

import { Match, Participant } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TbSwords } from "react-icons/tb";

type StreamerMatch = Match & {
  participants: Participant[];
};

type ListMatchesPageProps = {
  matches: StreamerMatch[];
  champions?: string[];
};

export function ListMatchesPage({ matches, champions }: ListMatchesPageProps) {
  const router = useRouter();

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
          <button
            key={match.id}
            className={`${
              match.player?.win ? "bg-[#303043]" : "bg-[#2E1F24]"
            } p-5 flex items-center`}
            onClick={() => router.push(match.player?.vodUrl ?? "")}
          >
            <div className="flex items-center gap-2">
              <Image
                src={`/champions/${match.player?.championName}.png`}
                alt={match.player?.championName ?? ""}
                width={50}
                height={50}
                className="transition-transform duration-150 peer-checked:shadow-[0_0_0_5px] peer-checked:shadow-primary peer-checked:scale-90"
              />
              <TbSwords size={30} className="stroke-slate-300" />
              <Image
                src={`/champions/${match.enemy?.championName}.png`}
                alt={match.enemy?.championName ?? ""}
                width={50}
                height={50}
                className="transition-transform duration-150 peer-checked:shadow-[0_0_0_5px] peer-checked:shadow-primary peer-checked:scale-90"
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
        );
      })}
    </div>
  );
}
