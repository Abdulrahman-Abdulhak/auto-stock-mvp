import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

import createNextIntlPlugin from "next-intl/plugin";

import { env } from "./src/lib/env";

const haveImages = env.IMAGES_BASE_URL !== undefined;
const imagesURL = haveImages ? env.IMAGES_BASE_URL!.split("://") : null;
const [imagesHostname, ...imagesPath] = imagesURL?.at(1)?.split("/") ?? [];

const baseImages = haveImages
  ? [
      {
        protocol: imagesURL![0] as RemotePattern["protocol"],
        hostname: imagesHostname as RemotePattern["hostname"],
        pathname: `${imagesPath.join("/")}/**`,
      },
    ]
  : [];

const nextConfig: NextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  typedRoutes: true,
  images: {
    remotePatterns: [...baseImages],
  },

  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule: any) =>
      rule.test?.test?.(".svg")
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              svgo: true,
              svgoConfig: {
                plugins: [
                  {
                    name: "preset-default",
                    params: {
                      overrides: {
                        removeViewBox: false,
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      }
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
