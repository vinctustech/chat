// The button that opens the chat, with the count of messages that arrived while
// it was shut. The customer app draws this beside the vehicle's licence plate.

import { FC, ReactNode } from 'react'
import { ChatColors } from './types'

export interface ChatToggleButtonProps {
  onClick: () => void
  label?: ReactNode
  unreadCount?: number
  // The icon left of the label. The customer app passes a Font Awesome comment
  // icon; nothing about the button depends on which icon set an app uses.
  icon?: ReactNode
  color?: string
  colors?: ChatColors
}

export const ChatToggleButton: FC<ChatToggleButtonProps> = ({
  onClick,
  label = 'Chat',
  unreadCount = 0,
  icon,
  color = '#5878e7',
  colors,
}) => (
  <button
    onClick={onClick}
    style={{
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      position: 'relative',
      color,
      fontSize: '14px',
      fontFamily: 'inherit',
      marginRight: '10px',
    }}
  >
    {icon} {label}
    {unreadCount > 0 && (
      <span
        style={{
          position: 'absolute',
          top: -8,
          right: -18,
          backgroundColor: colors?.badge ?? '#ff4444',
          color: colors?.badgeText ?? 'white',
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
)
