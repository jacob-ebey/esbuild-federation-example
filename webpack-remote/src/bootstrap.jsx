import React from "react";
import { createRoot } from "react-dom";

import App from "./components/app";

const root = createRoot(document, { hydrate: true });

root.render(<App chunks={window.__CHUNKS__} />);
