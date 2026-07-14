// The customer app's chat, copied out of shuttlecontrol-customer's TripTrack
// scene VERBATIM — same markup, same inline styles, same magic numbers. Only
// the transport is stubbed out, since there is no trip and no socket here.
//
// It exists to be compared against. The library must render the same thing,
// pixel for pixel, in both light and dark; if it ever stops doing so, this is
// the copy that shows it.

import { FC, useEffect, useRef, useState } from 'react'
import { theme } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

interface IChatMessage {
  id: string
  content: string
  driver: { id: string } | null
  createdAt: string
}

export const LiftedChat: FC<{ messages: IChatMessage[]; unreadCount: number }> = ({
  messages,
  unreadCount,
}) => {
  const { token: themeToken } = theme.useToken()
  const [messageText, setMessageText] = useState('')
  const [chatOpen, setChatOpen] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, chatOpen])

  const handleSendMessage = () => setMessageText('')
  const handleToggleChat = () => setChatOpen(!chatOpen)

  return (
    <div>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <button
          onClick={handleToggleChat}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            position: 'relative',
            color: '#5878e7',
            fontSize: '14px',
            fontFamily: 'inherit',
            marginRight: '10px',
          }}
        >
          <i className="fas fa-comment" style={{ color: '#5878e7' }} /> Chat
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -8,
                right: -18,
                backgroundColor: '#ff4444',
                color: 'white',
                borderRadius: '50%',
                width: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 'bold',
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>
      {chatOpen && (
        <div
          style={{
            marginTop: 15,
            border: `1px solid ${themeToken.colorBorder}`,
            borderRadius: 5,
            backgroundColor: themeToken.colorBgContainer,
          }}
        >
          <div
            style={{
              backgroundColor: themeToken.colorBgLayout,
              padding: 10,
              borderTopLeftRadius: 5,
              borderTopRightRadius: 5,
              fontWeight: 'bold',
              borderBottom: `1px solid ${themeToken.colorBorder}`,
              color: themeToken.colorText,
            }}
          >
            Chat with Marie
          </div>
          <div
            style={{
              maxHeight: 200,
              overflowY: 'auto',
              padding: '10px 10px 0 10px',
            }}
          >
            {messages.map((msg, index, arr) => {
              const prevMsg = index > 0 ? arr[index - 1] : null
              const isNewSender = !prevMsg || !!prevMsg.driver !== !!msg.driver
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: !msg.driver ? 'flex-end' : 'flex-start',
                    marginTop: isNewSender ? 12 : 2,
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{
                      maxWidth: '75%',
                      backgroundColor: !msg.driver ? '#007AFF' : themeToken.colorFillSecondary,
                      color: !msg.driver ? 'white' : themeToken.colorText,
                      borderRadius: 18,
                      padding: '8px 12px',
                      position: 'relative',
                    }}
                  >
                    <span style={{ fontSize: 14 }}>
                      {msg.content}
                      <span style={{ fontSize: 10, opacity: 0 }}>
                        &nbsp;&nbsp;{dayjs(msg.createdAt).format('HH:mm')}
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
                      {dayjs(msg.createdAt).format('HH:mm')}
                    </span>
                  </div>
                </div>
              )
            })}
            <div ref={chatEndRef} />
          </div>
          <div
            style={{
              padding: 6,
              display: 'flex',
              gap: 6,
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              style={{
                flex: 1,
                border: `1px solid ${themeToken.colorBorder}`,
                borderRadius: 9999,
                padding: '6px 12px',
                outline: 'none',
                backgroundColor: themeToken.colorBgContainer,
                color: themeToken.colorText,
                fontSize: 14,
              }}
              maxLength={500}
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              style={{
                backgroundColor: messageText.trim()
                  ? themeToken.colorPrimary
                  : themeToken.colorFillSecondary,
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: 30,
                height: 30,
                cursor: messageText.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SendOutlined style={{ fontSize: 12 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
