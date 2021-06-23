const path = require("path");

const { ESBuildMinifyPlugin } = require("esbuild-loader");
const webpack = require("webpack");

/**
 * @type {webpack.Configuration}
 */
const config = {
  entry: { app: "./src/index.jsx" },
  output: {
    path: path.resolve("./public/build"),
  },
  resolve: {
    extensions: [".js", ".jsx", ".css"],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: "esbuild-loader",
          options: {
            loader: "jsx",
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new webpack.container.ModuleFederationPlugin({
      name: "webpackRemote",
      filename: "remote-entry.js",
      exposes: {
        "./header": "./src/components/header.jsx",
      },
    }),
  ],
  optimization: {
    minimizer: [new ESBuildMinifyPlugin({})],
  },
};

module.exports = config;
