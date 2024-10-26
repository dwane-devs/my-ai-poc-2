/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fallbacks for node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    // Handle transformers.js package correctly
    config.module.rules.push({
      test: /transformers\.js$/,
      type: 'javascript/auto',
    });

    // Configure externals for server-side
    if (isServer) {
      config.externals = [...(config.externals || []), 'onnxruntime-node'];
    }

    return config;
  },
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: ['onnxruntime-node'],
  },
};

module.exports = nextConfig;
