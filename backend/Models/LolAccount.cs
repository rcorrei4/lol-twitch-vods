using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace lol_twitch_vods_api.Models;

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

public class LolAccount
{
    public int Id { get; set; }
    public string Puuid { get; set; } = "";
    public string Username { get; set; } = "";
    public string Tag { get; set; } = "";
    public Server Server { get; set; }
    public int StreamerId { get; set; }
    public Streamer? Streamer { get; set; }
}