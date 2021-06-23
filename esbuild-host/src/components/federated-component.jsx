import React from "react";

import { initSharing, shareScopes } from "@runtime/federation";

const components = {};

export default function federatedComponent(
  remote,
  module,
  shareScope = "default"
) {
  components[remote] = components[remote] || {};
  components[remote][module] = components[remote][module] || {};

  const FederatedComponent = (props) => {
    const Component = components[remote][module].component;

    if (Component) {
      return <Component {...props} />;
    }

    if (components[remote][module].error) {
      throw components[remote][module].error;
    }

    components[remote][module].promise =
      components[remote][module].promise ||
      initSharing(shareScope)
        .then(() => window[remote].init(shareScopes[shareScope]))
        .then(() => window[remote].get(module))
        .then((factory) => factory())
        .then((mod) => {
          components[remote][module].component = mod?.default || mod;
        })
        .catch((error) => {
          components[remote][module].error = error;
        });

    throw components[remote][module].promise;
  };

  return FederatedComponent;
}
