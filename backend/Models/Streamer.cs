using System.Text.Json.Serialization;
using lol_twitch_vods_api.Models.Bases;

namespace lol_twitch_vods_api.Models;

public class Streamer: AuditableEditableEntity
{
    public string TwitchId { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public string Login { get; set; } = "";
    public string ProfileImage { get; set; } = "";
    
    [JsonIgnore]
    public ICollection<LolAccount> LolAccounts { get; set; } = [];
    [JsonIgnore]
    public ICollection<Participant> Participants { get; set; } = [];
}