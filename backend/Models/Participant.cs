using System.Text.Json.Serialization;
using lol_twitch_vods_api.Models.Bases;

namespace lol_twitch_vods_api.Models;

public enum Position {
  TOP,
  JUNGLE,
  MIDDLE,
  BOTTOM,
  UTILITY
}

public class Participant: AuditableEditableEntity
{
    public string Puuid { get; set; } = "";
    public string ChampionName { get; set; } = "";
    public int Kills { get; set; }
    public int Deaths { get; set; }
    public int Assists { get; set; }
    public Position Position { get; set; }
    public bool Win { get; set; }
    public long? VodId { get; set; }
    public string? MatchStartVod { get; set; }
    public Guid MatchId { get; set; }
    public Guid? StreamerId { get; set; }

    [JsonIgnore]
    public Match? Match { get; set; }
    public Streamer? Streamer { get; set; }
}