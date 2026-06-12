import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-tajawal)", "sans-serif"],
      },
      colors: {
        brand: {
          navy: "#021E4B",
          blue: "#1659D3",
          turquoise: "#08CFB9",
          light: "#89CDD6",
          gray: "#7B88A2",
          dark: "#01103B",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(90deg, #1659D3 0%, #0F7BBC 45%, #08CFB9 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
