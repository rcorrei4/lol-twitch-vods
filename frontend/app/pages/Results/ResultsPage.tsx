import { SwordIcon } from "@phosphor-icons/react/dist/icons/Sword";
import { useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { Button } from "~/components/Button/Button";
import type { MatchPaginatedResponse } from "~/services/generated";

type ListMatchesPageProps = {
  paginatedResponse: MatchPaginatedResponse;
  champions?: string[];
  streamers?: string[];
  enemies?: string[];
};

export function ListMatchesPage({
  paginatedResponse,
  champions,
  streamers,
  enemies,
}: ListMatchesPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const matches = paginatedResponse?.data ?? [];

  if (!paginatedResponse || matches.length === 0) {
    return (
      <div className="p-5 flex flex-col items-center gap-4">
        <h1 className="text-xl text-gray-400">No matches found :(</h1>
      </div>
    );
  }

  const [selectedMatch, setSelectedMatch] = useState<{
    vodId: string;
    matchStartVod: string;
    matchId: string;
  } | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);

  const handleMatchClick = (
    matchId: string,
    vodId: string | number,
    matchStartVod: string,
  ) => {
    setSelectedMatch({ matchId, vodId: vodId.toString(), matchStartVod });
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const searchedMatchups = matches.map((match) => {
    if (champions || streamers) {
      const player = match.participants?.find(
        (participant) =>
          (champions?.includes(participant.championName) &&
            participant.streamer) ||
          (participant.streamer &&
            streamers?.includes(participant.streamer?.displayName)),
      );

      const enemy = match.participants.find(
        (participant) =>
          participant !== player && participant.position === player?.position,
      );

      return { player, enemy, ...match };
    } else {
      const enemy = match.participants.find((participant) =>
        enemies?.includes(participant.championName),
      );

      const player = match.participants.find(
        (participant) =>
          participant !== enemy && participant.position === enemy?.position,
      );

      return { player, enemy, ...match };
    }
  });

  function getTimeDifference(date: Date | string) {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const diffMs = Math.abs(Date.now() - dateObj.getTime());
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
          selectedMatch ? "max-h-249.75" : "max-h-0"
        }`}
      >
        {selectedMatch && (
          <iframe
            key={selectedMatch.vodId}
            src={`https://player.twitch.tv/?video=${selectedMatch.vodId}&time=${selectedMatch.matchStartVod}&autoplay=true&parent=${import.meta.env.VITE_TWITCH_PARENT_DOMAIN}`}
            className="w-full aspect-video"
            allowFullScreen
            allow="encrypted-media"
          />
        )}
      </div>

      {searchedMatchups.map((match) => {
        const isSelected = selectedMatch?.matchId === match.id.toString();
        return (
          <button
            key={match.id.toString()}
            className={`${
              match.player?.win
                ? "bg-[#303043] border-[#3A374B]"
                : "bg-[#2E1F24] border-[#443438]"
            } ${
              isSelected
                ? "ring-2 ring-primary ring-offset-2 ring-offset-gray-one"
                : ""
            } p-3 justify-around flex items-center border-t rounded transition-all duration-300`}
            onClick={() => {
              if (!match.player?.vodId || !match.player?.matchStartVod) return;
              handleMatchClick(
                match.id.toString(),
                match.player.vodId,
                match.player.matchStartVod,
              );
            }}
          >
            <div className="justify-around flex items-center gap-2 w-3/4">
              <span className="text-sm text-gray-400">
                {getTimeDifference(match.gameStartDateTime)} ago
              </span>
              <div className="flex items-center gap-2">
                <img
                  src={`/champions/${match.player?.championName}.png`}
                  alt={match.player?.championName ?? ""}
                  width={40}
                  height={40}
                  className="transition-transform duration-150"
                />
                <SwordIcon size={30} className="text-slate-400" />
                <img
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
              <div className="min-w-3.5">{match.player?.kills}</div>
              <span className="text-gray-five">/</span>
              <div className="min-w-3.5 text-red-400">
                {match.player?.deaths}
              </div>
              <span className="text-gray-five">/</span>
              <div className="min-w-3.5">{match.player?.assists}</div>
            </div>
          </button>
        );
      })}

      <div className="flex justify-center items-center gap-4 mt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={!paginatedResponse.hasPreviousPage}
          onClick={() => handlePageChange(paginatedResponse.page - 1)}
        >
          Previous
        </Button>

        <span className="text-gray-400">
          Page {paginatedResponse.page} of {paginatedResponse.totalPages}
          <span className="text-gray-500 ml-2">
            ({paginatedResponse.totalCount} total)
          </span>
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={!paginatedResponse.hasNextPage}
          onClick={() => handlePageChange(paginatedResponse.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
