// Where a message is typed: a round input and a round send button, which is
// dimmed until there is something to send. Enter sends; Shift+Enter does not.
//
// Controlled, deliberately: the host owns the text, because the host is what
// clears it when a send succeeds and puts it back when one fails.

import { CSSProperties, FC, useEffect, useRef } from 'react'
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
  // in any chat, so every host gets this. A host that mounts the panel fresh
  // each time it is shown needs nothing: the mount does it.
  //
  // A host whose panel stays mounted while hidden — a drawer — must pass a flag
  // instead, since nothing remounts to re-fire the focus. Pass a state that
  // becomes true once the panel is actually ON SCREEN, not merely when it has
  // been asked to open: an element still animating into place cannot take
  // focus, and the call fails silently. With Ant Design's Drawer that means
  // afterOpenChange, not the open prop itself.
  autoFocus?: boolean
  // The space around the input and its button. The default is what the customer
  // app's chat has always drawn. A host whose own container is already padded
  // passes its own — `'8px 0 0 0'` to keep only the gap above the input and let
  // the container supply the rest.
  padding?: CSSProperties['padding']
  // The colour of the strip the input and its button sit on. Transparent by
  // default — the customer app lets the panel behind it show through. A host
  // can set it to tie the composer to an adjacent surface.
  background?: CSSProperties['background']
}

// The height of both controls in the composer. They are one row and have to
// match, so the number is written once rather than in each of them.
const CONTROL_SIZE = 30

export const ChatComposer: FC<ChatComposerProps> = ({
  value,
  onChange,
  onSend,
  placeholder = 'Type a message...',
  maxLength = 500,
  disabled = false,
  autoFocus = true,
  padding = 6,
  background,
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
        padding,
        background,
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
          // Sized to the send button rather than to its own text, so the two
          // controls sit as one row. Left to itself an input is a little taller
          // than the button, which reads as the button having slipped. The
          // border-box keeps the padding and border inside that height.
          height: CONTROL_SIZE,
          boxSizing: 'border-box',
          minWidth: 0,
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
          width: CONTROL_SIZE,
          height: CONTROL_SIZE,
          // Never let the row's squeeze flatten the circle into an oval; the
          // input gives way instead. A chat can sit in a narrow column.
          flexShrink: 0,
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
