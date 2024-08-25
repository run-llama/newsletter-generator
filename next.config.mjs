import CopyWebpackPlugin from 'copy-webpack-plugin';

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
    outputFileTracingIncludes: { "/api/*": ["./node_modules/**/*.wasm"], }
  },
  /*
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "node_modules/tiktoken/lite/tiktoken_bg.wasm",
            to: "tiktoken_bg.wasm",
            toType: "file"
          },
        ],
      })
    );
    return config;
  },
  */
};

export default nextConfig;
