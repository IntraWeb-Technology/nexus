/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            // Cal.com embed uses an iframe served from app.cal.com; this header only blocks
            // the marketing site itself from being framed elsewhere.
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              // Self + Next.js inline scripts
              "default-src 'self'",
              // Scripts: self, Next.js runtime (unsafe-inline for RSC/hydration), reCAPTCHA,
              // HubSpot analytics, Google Tag Manager, Cal.com embed loader
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'" +
                " https://www.google.com https://www.gstatic.com" +
                " https://js.hs-scripts.com https://js.hsforms.net https://js.hubspot.com https://forms.hsforms.com" +
                " https://www.googletagmanager.com https://www.google-analytics.com" +
                " https://app.cal.com",
              // Styles: self + inline (Tailwind, Next.js)
              "style-src 'self' 'unsafe-inline'",
              // Images: self, data URIs, HubSpot, Google, Cal.com avatar CDNs
              "img-src 'self' data: blob: https://www.google.com https://www.gstatic.com" +
                " https://*.hubspot.com https://*.hubspotusercontent.com" +
                " https://*.googletagmanager.com",
              // Frames: reCAPTCHA challenge, Cal.com booking embed
              "frame-src 'self' https://www.google.com https://app.cal.com",
              // Fetch/XHR: self, HubSpot forms/contacts API, reCAPTCHA, GA, n8n webhooks
              "connect-src 'self'" +
                " https://api.hubapi.com https://api.hsforms.com" +
                " https://www.google-analytics.com https://stats.g.doubleclick.net https://www.googletagmanager.com" +
                " https://n8n.intrawebtech.com" +
                " https://cal.com https://api.cal.com",
              // Fonts: self only (no remote fonts used)
              "font-src 'self' data:",
            ].join("; "),
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
