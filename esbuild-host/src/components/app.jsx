import React, { Suspense } from "react";

import federatedComponent from "./federated-component";

const Header = federatedComponent("webpackRemote", "./header");

export default function App() {
  return (
    <Suspense fallback="">
      <Header>
        <h1>Header</h1>
        <p>Federated from a webpack build</p>
      </Header>
    </Suspense>
  );
}
