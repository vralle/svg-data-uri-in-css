/**
 * Webpack configuration
 */

import { Buffer } from "node:buffer";
import { dirname, join } from "node:path";
import { env } from "node:process";
import url, { URL } from "node:url";

// Plugins
import HtmlBundlerPlugin from "html-bundler-webpack-plugin";

// Tools
import svgToMiniDataURI from "mini-svg-data-uri";

// Project configuration
const __filename = url.fileURLToPath(new URL(import.meta.url));
const __dirname = dirname(__filename);

const projectPath = __dirname;
const srcPath = join(projectPath, "src");
const outPath = join(projectPath, "dist");
const isProduction = () => env["NODE_ENV"] === "production";

/**
 * @typedef {import('webpack').Configuration} WebpackCfg
 * @typedef {import('webpack-dev-server').Configuration} DevServerCfg
 * @typedef {import('webpack').Module} Module
 */

/**
 * @type {WebpackCfg&DevServerCfg}
 */
const webpackConfig = {
  mode: isProduction() ? "production" : "development",
  cache: false,
  output: {
    clean: true,
    hashDigestLength: 9,
  },
  resolve: {
    alias: {
      "@src": srcPath,
    },
  },
  module: {
    rules: [
      {
        test: /\.js/i,
      },
      {
        test: /\.css/i,
        use: [
          {
            loader: "css-loader",
            options: {
              importLoaders: 0,
              sourceMap: true,
            },
          },
        ],
      },
      {
        oneOf: [
          {
            test: /\.svg/i,
            resourceQuery: /raw/,
            type: "asset/source",
          },
          {
            test: /\.svg/i,
            type: "asset",
            parser: {
              dataUrlCondition(source, { filename }) {
                console.log("dataUrlCondition: ", filename);
                return Buffer.byteLength(source) <= 1 * 1024; // =maxSize: 1kb
              },
            },
            generator: {
              dataUrl: (source, { filename }) => {
                console.log("dataUrl: ", filename);
                return svgToMiniDataURI(source.toString());
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: {
          import: join(srcPath, "views", "index.html"),
        },
      },
      css: {
        test: /\.css/i,
        filename: "[name].[contenthash:9].css",
      },
      minify: false,
      preprocessor: false,
    }),
  ],
  optimization: {
    minimize: false,
  },
  devtool: isProduction() ? false : "inline-cheap-source-map",
  devServer: {
    static: {
      directory: outPath,
      publicPath: "",
    },
    watchFiles: ["src/**/*.{scss,html}"],
  },
  watchOptions: {
    poll: true,
    ignored: ["node_modules/**"],
  },
};

export default webpackConfig;
