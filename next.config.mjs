/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["lucide-react"],

  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },

  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },

  // ── Security Headers ──────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Evita que la app sea embebida en iframes de otros dominios
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Previene MIME type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Controla información de referrer
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Fuerza HTTPS por 1 año (solo producción)
          ...(isDev
            ? []
            : [
              {
                key: "Strict-Transport-Security",
                value: "max-age=31536000; includeSubDomains; preload",
              },
            ]),
          // Restringe acceso a APIs del navegador
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          // Previene XSS básico
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },
};

export default nextConfig;