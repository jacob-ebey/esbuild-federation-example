import React, { lazy, useContext } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Parser } from "html-to-react";
import stringify from "json-stringify-deterministic";
import fetch from "node-fetch";

import { initSharing, shareScopes } from "@runtime/federation";

import context from "./federated-components-ssr-provider";

const components = {};

export default function federatedComponent(
  remote,
  module,
  shareScope = "default"
) {
  const FederatedComponent = ({ children, ...props }) => {
    let Component;

    if (typeof window !== "undefined") {
      components[remote] = components[remote] || {};

      Component = components[remote][module] =
        components[remote][module] ||
        lazy(() =>
          initSharing(shareScope)
            .then(() => window[remote].init(shareScopes[shareScope]))
            .then(() => window[remote].get(module))
            .then((factory) => factory())
        );
    }

    if (typeof window === "undefined") {
      const ctx = useContext(context);

      const id = stringify({ remote, module, props });

      Component = ctx[id] =
        ctx[id] ||
        lazy(() =>
          fetch(`${process.env.REMOTE_HOSTS[remote]}/prerender`, {
            method: "post",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              module,
              props,
            }),
          })
            .then((res) => res.json())
            .then(({ chunks, html }) => {
              // TODO: preload chunks
              html = html.replace(
                `\u200Cchildren\u200C`,
                renderToStaticMarkup(children)
              );
              console.log(html);
              const parser = new Parser();
              const reactElement = parser.parse(html);

              return {
                default: () => (
                  <>
                    {chunks.map((chunk) =>
                      chunk.endsWith(".css") ? (
                        <link
                          key={chunk}
                          rel="stylesheet"
                          href={`${process.env.REMOTE_HOSTS[remote]}/build/${chunk}`}
                        />
                      ) : (
                        <script
                          key={chunk}
                          async
                          src={`${process.env.REMOTE_HOSTS[remote]}/build/${chunk}`}
                        />
                      )
                    )}
                    {reactElement}
                  </>
                ),
              };
            })
        );
    }

    return <Component {...props}>{children}</Component>;
  };

  return FederatedComponent;
}
