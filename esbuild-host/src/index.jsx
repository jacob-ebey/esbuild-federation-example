import React from "react";
import { createRoot } from "react-dom";

import App from "./components/app";

const links = document.body.getElementsByTagName("link");
for (let link of links) {
  document.head.appendChild(link);
}

const root = createRoot(document, { hydrate: true });

root.render(<App />);
