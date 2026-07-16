# chat

React chat components for ShuttleControl, published as
[`@vinctus/chat`](https://www.npmjs.com/package/@vinctus/chat).

**The package's own documentation — what the components are, how to use them,
and what is deliberately left out — lives in
[`packages/library/README.md`](packages/library/README.md)**, which is also what
npm shows. This file covers the repo itself.

## Layout

npm workspaces:

- `packages/library` — the published package (`@vinctus/chat`), built with rollup.
- `packages/demo` — a Vite app for looking at it.

```bash
npm install      # root, installs both workspaces
npm run build    # builds the library
npm run dev      # runs the demo
```

## The demo

The demo puts the customer app's chat code — copied out of TripTrack **verbatim**,
inline styles and all — next to the same conversation drawn by this library, in
both light and dark. They must be indistinguishable. That copy
(`packages/demo/src/LiftedChat.tsx`) is kept deliberately: it is the reference
that shows if the library ever drifts from what customers see today.

## Publishing

```bash
npm run publish
```

Builds and publishes the library. Per company practice, the version bump, build
and commit are prepared for review; a human runs the publish.
