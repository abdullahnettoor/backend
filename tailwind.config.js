/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#FF6B6B", // Warm coral
          light: "#FF8E8E",   // Light coral
          dark: "#FF4949",    // Dark coral
        },
        secondary: {
          DEFAULT: "#4ECDC4", // Cool teal
          light: "#6FE0D9",   // Light teal
          dark: "#2FB5AC",    // Dark teal
        },
        terminal: {
          DEFAULT: "#1A1B1E",
          lighter: "#2A2B2E",
        }
      },
    },
  },
  plugins: [],
};
