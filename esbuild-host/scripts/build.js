const esbuild = require("esbuild");
const {
  federationShareScopePlugin,
} = require("esbuild-federation-share-scope");
const { nodeExternalsPlugin } = require("esbuild-node-externals");

esbuild
  .build({
    outdir: "public/build",
    entryPoints: {
      app: "src/index.jsx",
    },
    plugins: [
      federationShareScopePlugin(process.cwd(), {
        shared: ["react"],
      }),
    ],
    define: {
      "process.env.NODE_ENV": `"production"`,
      "process.env.REMOTE_HOSTS": JSON.stringify({
        webpackRemote: process.env.REMOTE_HOST || "http://localhost:3001",
      }),
    },
    minify: true,
    format: "esm",
    bundle: true,
    write: true,
  })
  .then((build) => {
    if (build.errors && build.errors.length) {
      build.errors.forEach((err) => console.error(err.detail));
      process.exit(1);
    }
    if (build.warnings && build.warnings.length) {
      build.warnings.forEach((warn) => console.warn(warn.text));
    }
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

esbuild
  .build({
    outdir: "dist",
    entryPoints: {
      app: "src/components/app.jsx",
    },
    plugins: [
      nodeExternalsPlugin(),
      federationShareScopePlugin(process.cwd(), {
        shared: ["react"],
      }),
    ],
    define: {
      "process.env.NODE_ENV": `"production"`,
      "process.env.REMOTE_HOSTS": JSON.stringify({
        webpackRemote: process.env.REMOTE_HOST || "http://localhost:3001",
      }),
    },
    platform: "node",
    format: "cjs",
    bundle: true,
    write: true,
  })
  .then((build) => {
    if (build.errors && build.errors.length) {
      build.errors.forEach((err) => console.error(err.detail));
      process.exit(1);
    }
    if (build.warnings && build.warnings.length) {
      build.warnings.forEach((warn) => console.warn(warn.text));
    }
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
