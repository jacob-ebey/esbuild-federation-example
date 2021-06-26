const { PassThrough } = require("stream");

const React = require("react");
const { pipeToNodeWritable } = require("react-dom/server");

const App = require("./dist/app");

export default function handler(req, res) {
  if (req.url !== "/") {
    res.status(404);
    res.send();
    return;
  }

  const writable = new PassThrough();
  let html = "";
  writable.on("data", (d) => {
    html += String(d);
  });

  writable.on("end", function () {
    // If something errored before we started streaming, we set the error code appropriately.
    res.statusCode = didError ? 500 : 200;
    res.setHeader("content-type", "text/html");
    res.send(html);
  });

  let didError = false;
  const ctx = {};
  const { startWriting, abort } = pipeToNodeWritable(
    React.createElement(
      App.context.Provider,
      { value: ctx },
      React.createElement(App.default)
    ),
    writable,
    {
      onCompleteAll() {
        startWriting();
      },
      onError(x) {
        didError = true;
        console.error(x);
      },
    }
  );

  setTimeout(abort, 5000);
}
