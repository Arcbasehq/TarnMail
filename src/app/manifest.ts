import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TarnMail — every inbox, one private window",
    short_name: "TarnMail",
    description:
      "Connect Gmail, Outlook and Yahoo and read all your mail from one encrypted client.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1a73e8",
    icons: [
      { src: "/logo.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
