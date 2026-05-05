/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development";
const serverActionAllowedOrigins = isDev
  ? ["localhost:3000", "127.0.0.1:3000", "ptime.tucloud.pro", "ptime.vercel.app"]
  : ["ptime.tucloud.pro", "www.ptime.tucloud.pro", "ptime.vercel.app"];

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["lucide-react"],

  experimental: {
    serverActions: {
      allowedOrigins: serverActionAllowedOrigins,
    },
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
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
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com; connect-src 'self' https://oauth2.googleapis.com; frame-ancestors 'none';"
          },
        ],
      },
    ];
  },
};

export default nextConfig;