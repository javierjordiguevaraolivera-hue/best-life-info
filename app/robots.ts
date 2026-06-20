import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/iul-v6", "/privacy", "/terms", "/socios"],
        disallow: ["/api/", "/thanks/", "/iul-v6/rechazo"],
      },
    ],
  };
}
