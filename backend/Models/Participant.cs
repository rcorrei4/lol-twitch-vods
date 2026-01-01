namespace lol_twitch_vods_api.Models;

public enum Position {
  TOP,
  JUNGLE,
  MIDDLE,
  BOTTOM,
  UTILITY
}

public class Participant
{
    public int Id { get; set; }
    public string Puuid { get; set; } = "";
    public string ChampionName { get; set; } = "";
    public int Kills { get; set; }
    public int Deaths { get; set; }
    public int Assists { get; set; }
    public Position Position { get; set; }
    public bool Win { get; set; }
    public long VodId { get; set; }
    public string? MatchStartVod { get; set; }
    public long MatchId { get; set; }
    public int StreamerId { get; set;}

    public Match? Match { get; set; }
    public Streamer? Streamer { get; set; }
}