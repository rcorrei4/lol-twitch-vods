using System.Text.Json.Serialization;
using lol_twitch_vods_api.Models.Bases;

namespace lol_twitch_vods_api.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum Server {
  br,
  eune,
  euw,
  jp,
  kr,
  lan,
  las,
  na,
  oce,
  tr,
  me,
  ru
}

public class LolAccount: AuditableEditableEntity
{
    public string Puuid { get; set; } = "";
    public string Username { get; set; } = "";
    public string Tag { get; set; } = "";
    public Server Server { get; set; }
    public Guid StreamerId { get; set; }

    [JsonIgnore]
    public Streamer? Streamer { get; set; }
}