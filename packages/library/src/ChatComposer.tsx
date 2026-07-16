// Where a message is typed: a round input and a round send button, which is
// dimmed until there is something to send. Enter sends; Shift+Enter does not.
//
// Controlled, deliberately: the host owns the text, because the host is what
// clears it when a send succeeds and puts it back when one fails.

import { FC, useEffect, useRef } from 'react'
import { theme } from 'antd'
import { SendOutlined } from '@ant-design/icons'

export interface ChatComposerProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  placeholder?: string
  maxLength?: number
  // Stops sending while a message is in flight, or while the conversation is
  // busy — the assistant thinking, say.
  disabled?: boolean
  // Keep the input focused whenever it is usable: you open a chat in order to
  // type in it, and after a send the input is briefly disabled while the reply
  // is composed, which drops focus and would otherwise make you click back into
  // it before every message.
  //
  // On by default — a chat you have to click into before typing is a papercut
  // in any chat, so every host gets this. A host whose panel stays mounted
  // while hidden (a drawer, say) should pass its own open state rather than
  // rely on the default, since nothing remounts to re-fire the focus.
  autoFocus?: boolean
}

export const ChatComposer: FC<ChatComposerProps> = ({
  value,
  onChange,
  onSend,
  placeholder = 'Type a message...',
  maxLength = 500,
  disabled = false,
  autoFocus = true,
}) => {
  const { token } = theme.useToken()
  const sendable = value.trim() !== '' && !disabled
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && !disabled) {
      inputRef.current?.focus()
    }
  }, [autoFocus, disabled])

  return (
    <div
      style={{
        padding: 6,
        display: 'flex',
        gap: 6,
        alignItems: 'center',
      }}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            if (sendable) {
              onSend()
            }
          }
        }}
        style={{
          flex: 1,
          border: `1px solid ${token.colorBorder}`,
          borderRadius: 9999,
          padding: '6px 12px',
          outline: 'none',
          backgroundColor: token.colorBgContainer,
          color: token.colorText,
          fontSize: 14,
        }}
        maxLength={maxLength}
      />
      <button
        onClick={onSend}
        disabled={!sendable}
        style={{
          backgroundColor: sendable ? token.colorPrimary : token.colorFillSecondary,
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: 30,
          height: 30,
          cursor: sendable ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SendOutlined style={{ fontSize: 12 }} />
      </button>
    </div>
  )
}
