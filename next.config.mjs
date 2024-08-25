import CopyWebpackPlugin from 'copy-webpack-plugin';

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
    outputFileTracingIncludes: { "/api/*": ["./node_modules/**/*.wasm"], }
  },
};

export default nextConfig;
