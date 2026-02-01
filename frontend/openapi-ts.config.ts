import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "http://localhost:5240/swagger/v1/swagger.json",
  output: {
    path: "./app/services/generated",
    postProcess: ["prettier"],
  },
  plugins: ["@hey-api/client-axios", "@hey-api/sdk", "@tanstack/react-query"],
});
