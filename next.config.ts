import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Fotografías de la nube (Supabase) con next/image en producción. */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;