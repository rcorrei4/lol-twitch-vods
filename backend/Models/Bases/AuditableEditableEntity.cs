using System.ComponentModel.DataAnnotations;

namespace lol_twitch_vods_api.Models.Bases;

public abstract class AuditableEditableEntity: AuditableEntity
{
    public DateTime UpdatedAt { get; set; }
    public DateTime DeletedAt { get; set; }
}