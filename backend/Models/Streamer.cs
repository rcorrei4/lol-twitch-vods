namespace lol_twitch_vods_api.Models;

public class Streamer
{
    public int Id { get; set; }
    public int TwitchId { get; set; }
    public string DisplayName { get; set; } = "";
    public string Login { get; set; } = "";
    public string ProfileImage { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    
    public ICollection<LolAccount> LolAccounts { get; set; } = [];
    public ICollection<Participant> Participants { get; set; } = [];
}