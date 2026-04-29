import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        state: {
          navy: "#061B33",
          blue: "#2F6FAE",
          mid: "#2F6FAE",
          sky: "#00A3DD",
          gold: "#D6A83A",
          teal: "#00A99B",
          tealDark: "#007D73",
          surface: "#F3FBFA",
          ink: "#1F2933"
        }
      },
      boxShadow: {
        premium: "0 24px 70px rgba(6, 27, 51, 0.16)",
        lift: "0 18px 45px rgba(0, 169, 155, 0.18)"
      },
      fontFamily: {
        sans: ["Inter", "Roboto", "Noto Sans", "Arial", "sans-serif"]
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #061B33 0%, #007D73 52%, #00A99B 100%)",
        "button-gradient": "linear-gradient(135deg, #00A99B 0%, #007D73 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(0,169,155,0.18), rgba(47,111,174,0.14), rgba(214,168,58,0.12))"
      }
    }
  },
  plugins: []
};

export default config;
