# esbuild federation example

Demonstrates consuming modules from a webpack bundle and sharing modules from an esbuild bundle using [esbuild-federation-share-scope](https://github.com/jacob-ebey/esbuild-federation-share-scope).

## Running

From the root of the project:

```bash
yarn

yarn build

yarn start
```

The webpack bundled application that owns the Header component will start on http://localhost:3001 while the esbuild bundled application that consumes the exposed Header component will start on http://localhost:3000.
