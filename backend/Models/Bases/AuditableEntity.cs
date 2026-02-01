using System.ComponentModel.DataAnnotations;

namespace lol_twitch_vods_api.Models.Bases;

public abstract class AuditableEntity
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
}