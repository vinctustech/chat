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
        const isNewSender = !previous || previous.author !== message.author
        const mine = message.author === 'me'
        return (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: mine ? 'flex-end' : 'flex-start',
              marginTop: isNewSender ? 12 : 2,
              marginBottom: 4,
            }}
          >
            <div
              style={{
                maxWidth: '75%',
                backgroundColor: mine ? ownBubble : token.colorFillSecondary,
                color: mine ? ownText : token.colorText,
                borderRadius: 18,
                padding: '8px 12px',
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
                  ...(preserveLineBreaks ? { whiteSpace: 'pre-wrap' as const } : {}),
                }}
              >
                {message.content}
                <span style={{ fontSize: 10, opacity: 0 }}>
                  &nbsp;&nbsp;{dayjs(message.createdAt).format(timeFormat)}
                </span>
              </span>
              <span
                style={{
                  fontSize: 10,
                  opacity: 0.7,
                  position: 'absolute',
                  right: 12,
                  bottom: 8,
                }}
              >
                {dayjs(message.createdAt).format(timeFormat)}
              </span>
            </div>
          </div>
        )
      })}
      {thinking && <TypingBubble />}
      <div ref={endRef} />
    </div>
  )
}
