namespace lol_twitch_vods_api.Utils;

public class AccountServerToRegion
{
    
}

public static class StringExtensions
{
    // TODO: create a type for region
    private static readonly Dictionary<string, string> AccountServerToRegion = new()
    {
        { "na", "americas" },
        { "br", "americas" },
        { "lan", "americas" },
        { "las", "americas" },
        { "kr", "asia" },
        { "jp", "asia" },
        { "eune", "europe" },
        { "euw", "europe" },
        { "me1", "europe" },
        { "tr", "europe" },
        { "ru", "europe" },
        { "oce", "sea" },
        { "sg2", "sea" },
        { "tw2", "sea" },
        { "vn2", "sea" }
    };
    public static string ToSnakeCase(this string input)
    {
        if (string.IsNullOrEmpty(input)) return input;

        var startUnderscores = System.Text.RegularExpressions.Regex.Match(input, @"^_+");
        return startUnderscores + System.Text.RegularExpressions.Regex.Replace(
            input,
            @"([a-z0-9])([A-Z])",
            "$1_$2").ToLowerInvariant();
    }

    public static string GetRegionFromServer (this string input)
    {
        if (AccountServerToRegion.TryGetValue(input.ToLower(), out string? region))
        {
            return region;
        }

        return null;
    }
}
