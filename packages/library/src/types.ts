// A message in a conversation, as the components need it.
//
// `author` is all the components care about: 'me' is the person using this
// screen, 'them' is whoever they are talking to — a driver, an assistant, a
// dispatcher. Apps map their own shape onto this (the customer app's chat
// marks a driver's message by carrying a driver, and its own by not).
export interface ChatMessage {
  id: string
  content: string
  author: 'me' | 'them'
  // ISO timestamp, or anything dayjs can read.
  createdAt: string
  // Who sent it and how it reached the reader, drawn in a small line above the
  // bubble. Both are optional and off unless supplied: a two-party chat needs
  // neither, because 'me' and 'them' already say everything there is to say.
  //
  // They exist for a conversation with more than two sides, where 'them' is not
  // one person. The dispatcher's trip chat is that case — a driver, the
  // passenger, and the system's own SMS all arrive as 'them', and which is
  // which matters.
  //
  // Both are display strings the host has already translated, not codes. The
  // library never maps a code to words: hosts run their own i18n (the
  // dispatcher app is English and French), and a library that owned these
  // strings could not be translated by the app that shows them.
  senderLabel?: string
  // How the message travelled — 'SMS', 'In-app', 'Email'. Same rules as
  // senderLabel: already translated, purely for display.
  channelLabel?: string
}

// The colours the chat is drawn in. Everything else comes from the Ant Design
// theme, so a chat sits in whatever theme its host app is running — including
// dark mode — without being told about it.
export interface ChatColors {
  // The bubble for the person using the screen. The blue the customer app has
  // always used.
  ownBubble?: string
  ownText?: string
  // The unread badge on the toggle button.
  badge?: string
  badgeText?: string
}
