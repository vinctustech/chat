# CLAUDE.md — chat

React chat component library, published as `@vinctus/chat`.

Company-wide engineering practices (branch naming, commit format, code style,
worktree and stage rules, Greptile triage) live in
`shuttlecontrol-api/CLAUDE.md` and apply here. This file covers only what is
specific to this repo.

## Layout

npm workspaces, mirroring the `calendar` repo:

- `packages/library` — the published package (`@vinctus/chat`), built with rollup.
- `packages/demo` — a Vite app for looking at it.

```bash
npm install      # root, installs both workspaces
npm run build    # builds the library
npm run dev      # runs the demo
```

## The rule this library exists under

The customer app's trip chat is the design of record. `packages/demo/src/LiftedChat.tsx`
is a **verbatim copy** of that chat's JSX from `shuttlecontrol-customer`'s
TripTrack scene, kept so the library can be compared against it side by side in
the demo, in light and dark.

If you change how anything looks, you are changing what customers see. Do not
"tidy" the styles — the odd bits (the invisible duplicate timestamp that
reserves space in the bubble, the 18px badge, the `#007AFF` bubble) are load
bearing.

### Fix bugs for everyone; put features behind props

**With no props passed beyond the essentials, these components render what
`LiftedChat.tsx` renders** — that is what makes the side-by-side demo a drift
detector. The line between a change that applies to everyone and one that has
to be asked for:

**Features go behind a prop, defaulted off.** The trip chat passes none of
these and is unchanged:

- `thinking` — the typing dots, for a sender that takes seconds to reply.
- `preserveLineBreaks` — keeps newlines instead of letting CSS collapse them,
  for a sender that writes numbered lists.

**Some things apply to every host, with no prop.** These are the intended
differences from the verbatim copy — the list is short on purpose:

- `overflow-wrap: break-word` on the bubble. An email or URL is one unbreakable
  word to CSS and renders past the bubble's edge without it. Text escaping its
  bubble is broken in any chat, not a look the trip chat chose. It only affects
  text that would otherwise overflow.
- `autoFocus`, defaulted on. A chat you must click into before typing is a
  papercut everywhere, so every host gets it. A host whose panel stays mounted
  while hidden must pass its own open state — nothing remounts to re-fire the
  focus. Note this pops the on-screen keyboard on mobile, which is the trip
  chat's main setting.
- Clickable urls. A `http(s)` url in a message is rendered as a link, for every
  host, no prop. Even between two people, if you send a url you want the other
  side to be able to click it — a url shown as dead text is broken, not a look
  anyone chose. Same reasoning as `overflow-wrap`, and the same cause: urls live
  in chat. It splits the text and renders a real `<a>` (never injected HTML), and
  the link inherits the bubble's text colour with an underline, because a link's
  own colour would disappear against your own bubble's blue.
- The composer's input is the send button's height. Left to itself an input is
  a little taller than the 30px button, so the two sit misaligned — visible in
  `LiftedChat.tsx` too, since the customer app's composer has the same markup.
  A control row whose halves do not line up is broken in any chat, not a look
  anyone chose, so both now read one `CONTROL_SIZE`. The button also stops
  shrinking, so a narrow column squeezes the input instead of flattening the
  circle into an oval.
- A tighter bubble than the customer app's: a `12px` corner instead of the
  near-pill `18px`, `6px 9px 8px` of padding instead of `8px 12px`, `1.35` line
  height, and the gaps between bubbles pulled in to match. The padding is
  WhatsApp's; the corner started there too, at `7.5px`, and was opened up
  because a bubble that square reads as boxy at this size. The bottom is
  the roomiest side because that is where the clock sits, and the clock's own
  offsets follow that padding — change one without the other and the time is
  either stranded or run under by the text. This one is a deliberate exception
  to "do not change what customers see": it was asked for, so the library is now
  the tighter design and `LiftedChat.tsx` is the looser one it came from. The
  side-by-side therefore no longer matches on the bubble — that difference is
  this entry, and everything else in the two panes should still line up.

The test for which side a change falls on: would a reasonable person call the
old behavior *wrong*, or merely *different*? Only the first justifies changing
what a host already gets — and it is a product decision, not the library's to
make alone. Default-on was chosen deliberately for both of the above; when in
doubt, add the prop and default it off.

## Who may use this library

**Web hosts only** — `shuttlecontrol-web` (the account assistant) and
`shuttlecontrol-customer` (the trip chat).

**Never the driver app.** `shuttlecontrol-driver` is React Native, and these
components are DOM plus Ant Design — `div`, `span`, `input`, `theme.useToken()`,
an injected CSS keyframe. None of it renders under React Native, so this would
not merely be a bad fit, it would not build.

The temptation is real and worth naming: the driver app is the *other end* of
the same rider-to-driver conversation, so sharing the chat components sounds
obviously right. It isn't. The driver side keeps its own native chat UI. If the
two ever need to look alike, that is a design problem to solve twice, not a
component to share.

## What belongs here, and what does not

In: presentation, and state that is purely about presentation.

Out: transport of any kind. No fetch, no Socket.IO, no endpoint knowledge, no
unread-counting policy. Hosts differ — the customer app's chat rides a socket,
the account assistant's rides HTTP — and the moment the library knows about one,
it stops fitting the other.

## Publishing

`npm run publish` builds and publishes. Per company practice, Claude prepares
the version bump, build and commit; a human runs the publish.
