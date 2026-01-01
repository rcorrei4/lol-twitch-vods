using System.ComponentModel.DataAnnotations;

namespace lol_twitch_vods_api.Models;

public class Match
{
    public int Id { get; set; }
    [Required]
    public DateTime GameStartDateTime { get; set; }
    [Required]
    public DateTime GameEndDateTime { get; set; }
    public ICollection<Participant> Participants { get; set; } = [];
}