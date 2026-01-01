namespace lol_twitch_vods_api.Models;

public class Token
{
   public int Id { get; set; }
   public string AccessToken { get; set; } = "";
   public DateTime ExpiresAt { get; set; }
}