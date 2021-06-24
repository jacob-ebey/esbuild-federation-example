const esbuild = require("esbuild");
const {
  federationShareScopePlugin,
} = require("esbuild-federation-share-scope");

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
