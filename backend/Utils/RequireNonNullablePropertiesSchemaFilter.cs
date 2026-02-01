using System.Reflection;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace lol_twitch_vods_api.Utils;

public class RequireNonNullablePropertiesSchemaFilter : ISchemaFilter
{
    public void Apply(IOpenApiSchema schema, SchemaFilterContext context)
    {
        if (schema is not OpenApiSchema concreteSchema) return;
        if (concreteSchema.Properties == null || context.Type == null) return;

        var nullabilityContext = new NullabilityInfoContext();

        foreach (var property in context.Type.GetProperties())
        {
            var nullabilityInfo = nullabilityContext.Create(property);
            var schemaPropertyName = char.ToLowerInvariant(property.Name[0]) + property.Name[1..];

            if (nullabilityInfo.WriteState != NullabilityState.Nullable &&
                concreteSchema.Properties.ContainsKey(schemaPropertyName))
            {
                concreteSchema.Required ??= new HashSet<string>();
                concreteSchema.Required.Add(schemaPropertyName);
            }
        }
    }
}
