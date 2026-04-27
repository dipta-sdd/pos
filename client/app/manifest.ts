import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "POS System",
    short_name: "POS",
    description: "Modern Point of Sale Management System",
    start_url: "/pos",
    display: "standalone",
    orientation: "any",
    background_color: "#ffffff",
    theme_color: "#3b82f6", // Matches your primary blue
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Inventory",
        url: "/pos/vendor/1/inventory",
      },
      {
        name: "Sales",
        url: "/pos/vendor/1/sales",
      },
    ],
  };
}
