import { SwordIcon } from "@phosphor-icons/react/dist/icons/Sword";
import { VideoIcon } from "@phosphor-icons/react/dist/icons/Video";
import { useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { Accordion } from "~/components/Accordion/Accordion";
import { Button } from "~/components/Button/Button";
import type { MatchPaginatedResponse, Participant } from "~/services/generated";

const POSITION_ORDER: Record<string, number> = {
  TOP: 0,
  JUNGLE: 1,
  MIDDLE: 2,
  BOTTOM: 3,
  UTILITY: 4,
};

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
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
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

  function getTeams(participants: Participant[]) {
    const getOrder = (pos: string | number) =>
      typeof pos === "string" ? (POSITION_ORDER[pos] ?? 99) : pos;

    const blueTeam = participants
      .filter((p) => p.win)
      .sort((a, b) => getOrder(a.position) - getOrder(b.position));
    const redTeam = participants
      .filter((p) => !p.win)
      .sort((a, b) => getOrder(a.position) - getOrder(b.position));
    return { blueTeam, redTeam };
  }

  function toggleExpanded(matchId: string) {
    setExpandedMatchId((prev) => (prev === matchId ? null : matchId));
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
        const isExpanded = expandedMatchId === match.id.toString();
        const { blueTeam, redTeam } = getTeams(match.participants);

        return (
          <Accordion
            key={match.id.toString()}
            variant={match.player?.win ? "win" : "lose"}
            expanded={isExpanded}
            onToggle={() => toggleExpanded(match.id.toString())}
            trigger={
              <div className="justify-around flex items-center gap-3">
                <span className="text-sm text-gray-400">
                  {getTimeDifference(match.gameStartDateTime)} ago
                </span>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-semibold">
                    {match.player?.streamer?.displayName}
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
                </div>
                <div className="flex gap-2 text-center text-slate-300">
                  <div className="min-w-3.5">{match.player?.kills}</div>
                  <span className="text-gray-five">/</span>
                  <div className="min-w-3.5 text-red-400">
                    {match.player?.deaths}
                  </div>
                  <span className="text-gray-five">/</span>
                  <div className="min-w-3.5">{match.player?.assists}</div>
                </div>
              </div>
            }
          >
            <div className="p-3 pt-0 flex gap-4">
              <div className="flex-1">
                <div className="text-xs text-blue-400 font-semibold mb-2">
                  Blue Team
                </div>
                <div className="flex flex-col gap-1">
                  {blueTeam.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <img
                        src={`/champions/${participant.championName}.png`}
                        alt={participant.championName}
                        width={28}
                        height={28}
                        className="rounded"
                      />
                      <span className="text-gray-300 w-20 truncate">
                        {participant.championName}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {participant.kills}/{participant.deaths}/
                        {participant.assists}
                      </span>
                      {participant.vodId && participant.matchStartVod && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMatchClick(
                              match.id.toString(),
                              participant.vodId!,
                              participant.matchStartVod!,
                            );
                          }}
                          className="ml-auto p-1 rounded hover:bg-white/10 transition-colors"
                          title={`Watch ${participant.streamer?.displayName}'s POV`}
                        >
                          <VideoIcon size={18} className="text-primary" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <div className="text-xs text-red-400 font-semibold mb-2">
                  Red Team
                </div>
                <div className="flex flex-col gap-1">
                  {redTeam.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <img
                        src={`/champions/${participant.championName}.png`}
                        alt={participant.championName}
                        width={28}
                        height={28}
                        className="rounded"
                      />
                      <span className="text-gray-300 w-20 truncate">
                        {participant.championName}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {participant.kills}/{participant.deaths}/
                        {participant.assists}
                      </span>
                      {participant.vodId && participant.matchStartVod && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMatchClick(
                              match.id.toString(),
                              participant.vodId!,
                              participant.matchStartVod!,
                            );
                          }}
                          className="ml-auto p-1 rounded hover:bg-white/10 transition-colors"
                          title={`Watch ${participant.streamer?.displayName}'s POV`}
                        >
                          <VideoIcon size={18} className="text-primary" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Accordion>
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
