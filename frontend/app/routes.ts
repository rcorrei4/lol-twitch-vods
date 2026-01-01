import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("add-streamer", "routes/add-streamer.tsx"),
  route("results", "routes/results.tsx"),
] satisfies RouteConfig;
