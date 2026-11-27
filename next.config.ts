import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the ORM + driver out of the bundle; they use dynamic requires.
  serverExternalPackages: ["sequelize", "mysql2"],
};

export default nextConfig;
