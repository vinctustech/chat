# chat

React chat components for ShuttleControl — `@vinctus/chat`.

The chat that exists in the customer app (a rider messaging their driver from
the trip-tracking screen) is the design this library is lifted from, so that a
second chat — the account assistant in the dispatcher web app — looks and
behaves like the one customers already use, and so that the customer app can
eventually be moved onto these components without changing how it looks.

## What is in it

| Component | What it is |
|---|---|
| `ChatPanel` | The whole thing: titled panel, messages, composer. What most hosts want. |
| `ChatMessageList` | The bubbles — right for you, left for them, grouped by sender, timestamped. |
| `ChatComposer` | The round input and send button. Enter sends; Shift+Enter does not. |
| `ChatToggleButton` | The button that opens a chat, with its unread badge. |

```tsx
import { ChatPanel, ChatMessage } from '@vinctus/chat'

const messages: ChatMessage[] = [
  { id: '1', content: 'On my way.', author: 'them', createdAt: '2026-07-14T14:02:00Z' },
  { id: '2', content: 'See you at the north entrance.', author: 'me', createdAt: '2026-07-14T14:03:00Z' },
]

<ChatPanel
  title="Chat with Marie"
  messages={messages}
  value={draft}
  onChange={setDraft}
  onSend={send}
/>
```

## What is deliberately NOT in it

**Transport.** No fetch, no socket, no endpoints. The customer app's chat is
carried on the `/stores` Socket.IO namespace and `POST /v2/trips/:id/messages`;
the account assistant's is carried on `POST /v2/ai/conversations/:id/messages`
and has no socket at all. They share a look, not a wire. The host owns the
messages, and the components draw them.

That split is also what keeps the customer app's optimistic send — where a
message appears immediately and is reconciled or withdrawn when the server
answers — working exactly as it does now: the app keeps that logic and simply
hands the resulting list to `ChatMessageList`.

**Unread counting.** The count is a number you pass to `ChatToggleButton`. Who
counts as unread depends on the conversation (the customer app counts driver
messages that arrive while the panel is shut), and the components have no
business deciding that.

## Theming

Everything but three colours comes from the host's Ant Design theme
(`theme.useToken()`), so a chat is light or dark because its host is, with
nothing passed in. The exceptions — your own bubble's blue, and the unread
badge's red — are the customer app's literal colours, and they are the defaults;
override them with `colors` if a host ever needs to.

Ant Design, `@ant-design/icons`, dayjs and React are **peer** dependencies: the
host supplies them, and no second copy is bundled.

## The demo

```bash
npm install
npm run dev
```

The demo puts the customer app's chat code — copied out of TripTrack **verbatim**,
inline styles and all — next to the same conversation drawn by this library, in
both light and dark. They must be indistinguishable. That copy
(`packages/demo/src/LiftedChat.tsx`) is kept deliberately: it is the reference
that shows if the library ever drifts from what customers see today.

## Adopting it in the customer app

Not done, and not to be done casually — the customer app is untouched. When it
happens, TripTrack keeps its socket, its fetches and its optimistic send, and
loses about 130 lines of JSX in exchange for `<ChatPanel>` plus a two-line map
from its message shape (`driver === null` means the rider said it) onto
`author`. The only visible risk is the chat's placement in that screen's layout,
which the panel does not control and does not try to.
