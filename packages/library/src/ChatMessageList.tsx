// The messages themselves: bubbles, right for you and left for them, grouped
// so a run from the same sender sits tight together and a change of sender
// opens a gap.
//
// The timestamp is drawn twice on purpose. Once invisibly, inline after the
// text, to reserve the space the real one needs; and once positioned in the
// corner, where it sits over that reserved space. Without the invisible copy a
// short message's text runs underneath the clock. This is lifted verbatim from
// the customer app, where the effect was arrived at by hand.

import { FC, useEffect, useRef } from 'react'
import { theme } from 'antd'
import dayjs from 'dayjs'
import { ChatColors, ChatMessage } from './types'

export interface ChatMessageListProps {
  messages: ChatMessage[]
  // How the time in the corner of each bubble is written.
  timeFormat?: string
  maxHeight?: number | string
  colors?: ChatColors
  // Scroll to the newest message when it arrives. On by default; a panel that
  // is closed should pass false, so opening it does not animate a jump.
  autoScroll?: boolean
  empty?: React.ReactNode
  // Whether the other side is composing a reply. Shows the three dots every
  // chat uses to say "your message landed, something is happening". Without it
  // a slow reply is indistinguishable from a broken one. Opt-in: a host that
  // has no such signal passes nothing and nothing is drawn.
  thinking?: boolean
  // Keep newlines in a message instead of letting CSS collapse them into
  // spaces. Needed by a sender that writes numbered lists — the account
  // assistant does. Off by default, because the trip chat has always rendered
  // messages with newlines collapsed and it is not this library's place to
  // change what its customers see.
  preserveLineBreaks?: boolean
}

// A url in a message is turned into a link you can click. This is for every
// host, with no prop: if someone sends you a url — the account assistant citing
// a help article, or one person to another in the trip chat — a link you cannot
// click is broken, not a look anyone chose. It is the same reasoning that put
// overflow-wrap on the bubble, and for the same reason (urls live in chat).
//
// The text is split on the url so the link is a real <a>, never injected HTML.
// A url's own colour would vanish against the blue of your own bubble, so it
// inherits the bubble's text colour and underlines to show it is a link.
// Trailing sentence punctuation is kept out of the href.
function linkify(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const pattern = /(https?:\/\/[^\s]+)/g
  let lastIndex = 0
  let key = 0
  let match = pattern.exec(text)

  while (match !== null) {
    const start = match.index
    const full = match[0]
    const trailing = full.match(/[.,;:!?)]+$/)?.[0] ?? ''
    const url = trailing === '' ? full : full.slice(0, full.length - trailing.length)

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start))
    }
    nodes.push(
      <a
        key={key}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'inherit', textDecoration: 'underline' }}
      >
        {url}
      </a>,
    )
    key += 1
    if (trailing !== '') {
      nodes.push(trailing)
    }
    lastIndex = start + full.length
    match = pattern.exec(text)
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }
  return nodes
}

// The dots need a keyframe, and the library ships no stylesheet, so it carries
// its own. Named to avoid colliding with anything in a host app.
const typingAnimation = `
@keyframes vinctus-chat-typing {
  0%, 60%, 100% { opacity: 0.25 }
  30% { opacity: 1 }
}`

const TypingBubble: FC = () => {
  const { token } = theme.useToken()

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 12, marginBottom: 4 }}>
      <style>{typingAnimation}</style>
      <div
        style={{
          backgroundColor: token.colorFillSecondary,
          borderRadius: 18,
          padding: '10px 14px',
          display: 'flex',
          gap: 4,
          alignItems: 'center',
        }}
      >
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: token.colorText,
              animation: 'vinctus-chat-typing 1.2s infinite',
              animationDelay: `${dot * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export const ChatMessageList: FC<ChatMessageListProps> = ({
  messages,
  timeFormat = 'HH:mm',
  maxHeight = 200,
  colors,
  autoScroll = true,
  empty,
  thinking = false,
  preserveLineBreaks = false,
}) => {
  const { token } = theme.useToken()
  const endRef = useRef<HTMLDivElement>(null)
  const ownBubble = colors?.ownBubble ?? '#007AFF'
  const ownText = colors?.ownText ?? 'white'

  // Scroll when the dots appear too, so the indicator is not stranded below the
  // fold — the one place it would be useless.
  useEffect(() => {
    if (autoScroll && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, autoScroll, thinking])

  return (
    <div
      style={{
        maxHeight,
        overflowY: 'auto',
        padding: '10px 10px 0 10px',
      }}
    >
      {messages.length === 0 && empty}
      {messages.map((message, index, all) => {
        const previous = index > 0 ? all[index - 1] : null
        // A run from one sender sits tight together, and a change opens a gap.
        // Who "one sender" is includes the label and the channel when a host
        // supplies them: two different people both arriving as 'them' are not
        // one run, and neither is the same sender switching from SMS to in-app.
        // A host that passes neither compares undefined with undefined, so this
        // is exactly the old author check.
        const isNewSender =
          !previous ||
          previous.author !== message.author ||
          previous.senderLabel !== message.senderLabel ||
          previous.channelLabel !== message.channelLabel
        const mine = message.author === 'me'
        // Drawn once at the top of a run rather than above every bubble —
        // repeated on each line it reads as noise, and a run is by definition
        // all the same sender and channel.
        const meta = [message.senderLabel, message.channelLabel].filter(Boolean).join(' · ')
        const showMeta = meta !== '' && isNewSender
        const bubble = (
          <div
            style={{
              // Capped at 75% of the list, except when a meta line is drawn —
              // then the column wrapper carries the cap instead, so the label
              // sits over the bubble rather than stretching past it.
              maxWidth: showMeta ? '100%' : '75%',
              backgroundColor: mine ? ownBubble : token.colorFillSecondary,
              color: mine ? ownText : token.colorText,
              // WhatsApp's bubble, near enough: a 7.5px corner rather than the
              // near-pill 18px the customer app's chat uses, and its padding —
              // roomier along the bottom, where the clock sits. See the note on
              // the clock's offsets below, which follow this padding.
              borderRadius: 7.5,
              padding: '6px 9px 8px',
              position: 'relative',
              // An email address or a URL is one long word to CSS, with
              // nowhere legal to wrap, so it would render straight past the
              // bubble's edge. Text escaping its bubble is broken in any
              // chat, so this is fixed for every host rather than offered as
              // a choice. It only affects text that would otherwise overflow.
              overflowWrap: 'break-word',
            }}
          >
            <span
              style={{
                fontSize: 14,
                // A tight bubble with loose lines inside it still reads as
                // tall, so a multi-line message needs this to actually get
                // shorter.
                lineHeight: 1.35,
                ...(preserveLineBreaks ? { whiteSpace: 'pre-wrap' as const } : {}),
              }}
            >
              {linkify(message.content)}
              <span style={{ fontSize: 10, opacity: 0 }}>
                &nbsp;&nbsp;{dayjs(message.createdAt).format(timeFormat)}
              </span>
            </span>
            <span
              style={{
                fontSize: 10,
                opacity: 0.7,
                position: 'absolute',
                // The clock sits in the bubble's bottom-right corner, so these
                // are the bubble's own padding. Changing one without the other
                // either strands the time or lets the text run under it.
                right: 9,
                bottom: 5,
              }}
            >
              {dayjs(message.createdAt).format(timeFormat)}
            </span>
          </div>
        )
        return (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: mine ? 'flex-end' : 'flex-start',
              marginTop: isNewSender ? 8 : 1,
              marginBottom: 2,
            }}
          >
            {/* With no labels the bubble is rendered exactly as it always has
                been, with no wrapper around it, so nothing moves for a host
                that does not ask for them. */}
            {showMeta ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: mine ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    color: token.colorTextSecondary,
                    padding: '0 12px',
                    marginBottom: 2,
                  }}
                >
                  {meta}
                </span>
                {bubble}
              </div>
            ) : (
              bubble
            )}
          </div>
        )
      })}
      {thinking && <TypingBubble />}
      <div ref={endRef} />
    </div>
  )
}
