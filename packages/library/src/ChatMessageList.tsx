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
}

export const ChatMessageList: FC<ChatMessageListProps> = ({
  messages,
  timeFormat = 'HH:mm',
  maxHeight = 200,
  colors,
  autoScroll = true,
  empty,
}) => {
  const { token } = theme.useToken()
  const endRef = useRef<HTMLDivElement>(null)
  const ownBubble = colors?.ownBubble ?? '#007AFF'
  const ownText = colors?.ownText ?? 'white'

  useEffect(() => {
    if (autoScroll && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, autoScroll])

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
              }}
            >
              <span style={{ fontSize: 14 }}>
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
      <div ref={endRef} />
    </div>
  )
}
