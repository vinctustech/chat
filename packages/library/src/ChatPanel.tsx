// A whole chat: a titled panel with the messages above and the composer below.
//
// It holds no messages of its own and talks to no server. The host supplies the
// messages and is told when one is sent — which is what lets the same panel sit
// over a driver conversation carried on a socket and over an assistant
// conversation carried on HTTP.
//
// `footer` is for whatever a particular conversation must say beneath the
// composer. The account assistant uses it to show that changes are waiting to
// be confirmed, which is a statement the panel must be able to make from the
// server's own state rather than from anything the assistant said.

import { FC, ReactNode } from 'react'
import { theme } from 'antd'
import { ChatComposer } from './ChatComposer'
import { ChatMessageList } from './ChatMessageList'
import { ChatColors, ChatMessage } from './types'

export interface ChatPanelProps {
  title: ReactNode
  messages: ChatMessage[]
  value: string
  onChange: (value: string) => void
  onSend: () => void
  placeholder?: string
  maxLength?: number
  disabled?: boolean
  timeFormat?: string
  maxHeight?: number | string
  colors?: ChatColors
  autoScroll?: boolean
  empty?: ReactNode
  footer?: ReactNode
  // Whether the other side is composing a reply — draws the typing dots.
  thinking?: boolean
  // Keep newlines in a message instead of collapsing them. Off by default; see
  // ChatMessageList.
  preserveLineBreaks?: boolean
  // Keep the input focused while it is usable. On by default; a panel that
  // stays mounted while hidden should pass its own open state. See ChatComposer.
  autoFocus?: boolean
}

export const ChatPanel: FC<ChatPanelProps> = ({
  title,
  messages,
  value,
  onChange,
  onSend,
  placeholder,
  maxLength,
  disabled,
  timeFormat,
  maxHeight,
  colors,
  autoScroll,
  empty,
  footer,
  thinking,
  preserveLineBreaks,
  autoFocus,
}) => {
  const { token } = theme.useToken()

  return (
    <div
      style={{
        marginTop: 15,
        border: `1px solid ${token.colorBorder}`,
        borderRadius: 5,
        backgroundColor: token.colorBgContainer,
      }}
    >
      <div
        style={{
          backgroundColor: token.colorBgLayout,
          padding: 10,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          fontWeight: 'bold',
          borderBottom: `1px solid ${token.colorBorder}`,
          color: token.colorText,
        }}
      >
        {title}
      </div>
      <ChatMessageList
        messages={messages}
        timeFormat={timeFormat}
        maxHeight={maxHeight}
        colors={colors}
        autoScroll={autoScroll}
        empty={empty}
        thinking={thinking}
        preserveLineBreaks={preserveLineBreaks}
      />
      <ChatComposer
        value={value}
        onChange={onChange}
        onSend={onSend}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        autoFocus={autoFocus}
      />
      {footer}
    </div>
  )
}
