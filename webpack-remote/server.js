const React = require("react");
const {
  pipeToNodeWritable,
  renderToStaticMarkup,
} = require("react-dom/server");

const { json } = require("body-parser");
const cors = require("cors");
const express = require("express");

const App = require("./dist/app").default;
const remoteEntry = require("./dist/remote-entry");
const stats = require("./public/build/stats.json");
const federationStats = require("./public/build/federation-stats.json");

const exposes = federationStats.federatedModules.find(
  (m) => m.remote === "webpackRemote"
).exposes;
function getChunksForExposed(exposed) {
  return exposes[exposed].reduce((p, c) => {
    p.push(...c.chunks);
    return p;
  }, []);
}

const remoteInitPromise = remoteEntry.init({
  react: {
    [React.version]: {
      get: () => () => React,
    },
  },
});

const app = express();

app.use("/", cors(), express.static("./public"));

app.use("/prerender", json(), async (req, res, next) => {
  if (!req.body.module) {
    next();
    return;
  }

  try {
    const chunks = getChunksForExposed(req.body.module);

    await remoteInitPromise;

    const factory = await remoteEntry.get(req.body.module);
    let Component = factory();
    Component = (Component && Component.default) || Component;

    const html = renderToStaticMarkup(
      React.createElement(
        Component,
        req.body.props || {},
        `\u200Cchildren\u200C`
      )
    );

    res.json({
      chunks,
      html,
    });
  } catch (err) {
    next(err);
  }
});

app.use("/", (req, res) => {
  if (req.path !== "/") {
    res.status(404);
    res.send();
    return;
  }

  const chunks = stats.assetsByChunkName.app.concat(
    stats.assetsByChunkName.bootstrap,
    stats.chunks.reduce((r, chunk) => {
      if (chunk.runtime.includes("app")) {
        r.push(...chunk.files);
      }

      return r;
    }, [])
  );

  let didError = false;
  const { startWriting, abort } = pipeToNodeWritable(
    React.createElement(App, { chunks }),
    res,
    {
      onReadyToStream() {
        // If something errored before we started streaming, we set the error code appropriately.
        res.statusCode = didError ? 500 : 200;
        res.contentType("html");
        res.write("<!DOCTYPE html>");
        startWriting();
      },
      onError(x) {
        didError = true;
        console.error(x);
      },
    }
  );

  setTimeout(abort, 5000);
});

app.listen(3001, () =>
  console.log("webpack remote: started at http://localhost:3001")
);
