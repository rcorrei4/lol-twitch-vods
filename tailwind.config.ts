import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/application/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6F2DBD",
        secondary: "#282C33",
        "gray-one": "#0F1216",
        "gray-two": "#181C23",
        "gray-three": "#282C33",
        "gray-four": "#383C44",
        "gray-five": "#5E605F",
        "gray-six": "#828282",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
} satisfies Config;
