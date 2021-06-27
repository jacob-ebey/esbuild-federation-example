const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const remoteEntry = require("../dist/remote-entry");
const federationStats = require("../public/build/federation-stats.json");

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

export default async function handler(req, res) {
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
    console.error(err);
    res.status(500);
  }
}
