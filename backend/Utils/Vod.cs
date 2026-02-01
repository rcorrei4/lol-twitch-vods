using System.Text.RegularExpressions;

namespace lol_twitch_vods_api.Utils;

public static class Vod
{
    public static DateTime GetVodEndDateTime(this DateTime vodStart, string duration)
    {
        var match = Regex.Match(duration, @"(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?");

        if (!match.Success || string.IsNullOrWhiteSpace(match.Value))
        {
            throw new Exception("Error while parsing VOD duration");
        }

        int hours = match.Groups[1].Success ? int.Parse(match.Groups[1].Value) : 0;
        int minutes = match.Groups[2].Success ? int.Parse(match.Groups[2].Value) : 0;
        int seconds = match.Groups[3].Success ? int.Parse(match.Groups[3].Value) : 0;

        // Use TimeSpan for the math
        var durationSpan = new TimeSpan(hours, minutes, seconds);

        return vodStart.Add(durationSpan);
    }
}
