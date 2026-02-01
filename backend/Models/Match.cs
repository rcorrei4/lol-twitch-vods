using System.ComponentModel.DataAnnotations;
using lol_twitch_vods_api.Models.Bases;

namespace lol_twitch_vods_api.Models;

public class Match: AuditableEntity
{
    public DateTime GameStartDateTime { get; set; }   
    public DateTime GameEndDateTime { get; set; }
    public ICollection<Participant> Participants { get; set; } = [];
}