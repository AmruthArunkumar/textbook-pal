import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
};

module.exports = {
    experimental: {
        serverActions: {
            bodySizeLimit: "8mb",
        },
    },
};

export default nextConfig;
