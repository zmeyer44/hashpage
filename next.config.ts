import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Put metadata in <head> for every client, so any link-preview crawler sees it, not just known bots.
  htmlLimitedBots: /.*/,
};

export default nextConfig;
