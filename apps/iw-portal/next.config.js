const path = require("path");
const { loadEnvConfig } = require("@next/env");

// Monorepo root first (optional shared stub), then this app’s `.env.local` (see repo `.gitignore`).
const monorepoRoot = path.join(__dirname, "..", "..");
loadEnvConfig(monorepoRoot, process.env.NODE_ENV !== "production", undefined, true);
loadEnvConfig(__dirname, process.env.NODE_ENV !== "production", undefined, true);

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
};

module.exports = nextConfig;
