// Two chats, the same messages, side by side.
//
// Left: the customer app's chat code as it stands today, copied out of
// TripTrack verbatim. Right: the same conversation drawn by @vinctus/chat.
// Switch the theme and they must still match — that is the whole question the
// library has to answer before the customer app can adopt it.
//
// Below them, the account assistant's chat: the same components, a different
// conversation, showing what the library is for.

import { FC, useState } from 'react'
import { Button, ConfigProvider, Switch, Typography, theme } from 'antd'
import { ChatMessage, ChatPanel, ChatToggleButton } from '@vinctus/chat'
import { LiftedChat } from './LiftedChat'

const today = (time: string) => `2026-07-14T${time}:00Z`

// The driver conversation, in the shape the customer app keeps it in.
const driverMessages = [
  {
    id: '1',
    content: 'Hi, I am on my way — about 8 minutes out.',
    driver: { id: 'd1' },
    createdAt: today('14:02'),
  },
  {
    id: '2',
    content: 'There is a lot of traffic on Sherbrooke.',
    driver: { id: 'd1' },
    createdAt: today('14:02'),
  },
  {
    id: '3',
    content: 'No problem, I will wait by the north entrance.',
    driver: null,
    createdAt: today('14:03'),
  },
  {
    id: '4',
    content: 'Perfect, see you shortly.',
    driver: { id: 'd1' },
    createdAt: today('14:04'),
  },
]

// The same conversation, in the shape the library takes: who said it is all it
// needs to know.
const asChatMessages: ChatMessage[] = driverMessages.map((message) => ({
  id: message.id,
  content: message.content,
  author: message.driver ? 'them' : 'me',
  createdAt: message.createdAt,
}))

const assistantMessages: ChatMessage[] = [
  {
    id: 'a1',
    content: 'Hi! Ask me anything about your account, or ask me to make a change.',
    author: 'them',
    createdAt: today('09:15'),
  },
  {
    id: 'a2',
    content: 'We just got a new shuttle van for the Alpha store.',
    author: 'me',
    createdAt: today('09:16'),
  },
  {
    id: 'a3',
    content: 'I can add that. What is the make, model, plate, seat count and colour?',
    author: 'them',
    createdAt: today('09:16'),
  },
  {
    id: 'a4',
    content: 'Ford Transit, SHT-4410, 12 seats, white.',
    author: 'me',
    createdAt: today('09:17'),
  },
  {
    id: 'a5',
    content:
      "Here's the plan: add a white Ford Transit, plate SHT-4410, 12 seats, to Alpha Store. Shall I go ahead?",
    author: 'them',
    createdAt: today('09:17'),
  },
  {
    id: 'a6',
    content: 'Yes. Also, how do I set up a kiosk?',
    author: 'me',
    createdAt: today('09:18'),
  },
  {
    id: 'a7',
    content:
      'Done — the van is added. For kiosks, see https://help.shuttlecontrol.com/en/articles/13367860-how-to-create-and-manage-kiosks',
    author: 'them',
    createdAt: today('09:18'),
  },
]

// The dispatcher's trip chat: four kinds of sender in one thread, where 'them'
// is not one person. Only the dispatcher is 'me'; the passenger, the driver and
// the system's own SMS all arrive as 'them', told apart by their labels. The
// labels are spelled out here the way a host passes them — already translated,
// because the dispatcher app runs in English and French.
const dispatcherMessages: ChatMessage[] = [
  {
    id: 'd1',
    content: 'Your driver is on the way! ETA 15 min.',
    author: 'them',
    senderLabel: 'System',
    channelLabel: 'SMS',
    createdAt: today('07:40'),
  },
  {
    id: 'd2',
    content: "Great, I'll be outside terminal B.",
    author: 'them',
    senderLabel: 'Customer',
    channelLabel: 'SMS',
    createdAt: today('07:42'),
  },
  {
    id: 'd3',
    content: 'Running two minutes behind, traffic on the ramp.',
    author: 'them',
    senderLabel: 'Driver',
    channelLabel: 'In-app',
    createdAt: today('07:49'),
  },
  {
    id: 'd4',
    content: "I'm here, white van, plate 4XJ 221.",
    author: 'them',
    senderLabel: 'Driver',
    channelLabel: 'In-app',
    createdAt: today('07:50'),
  },
  {
    id: 'd5',
    content: 'Let us know if you need anything else!',
    author: 'me',
    senderLabel: 'You',
    channelLabel: 'In-app',
    createdAt: today('07:51'),
  },
]

const Pane: FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <div style={{ flex: 1, minWidth: 320 }}>
    <Typography.Title level={5} style={{ marginBottom: 0 }}>
      {title}
    </Typography.Title>
    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
      {subtitle}
    </Typography.Text>
    {children}
  </div>
)

export const App: FC = () => {
  const [dark, setDark] = useState(false)
  const [driverText, setDriverText] = useState('')
  const [dispatcherText, setDispatcherText] = useState('')
  const [assistantText, setAssistantText] = useState('')
  const [messages, setMessages] = useState(assistantMessages)
  const [pending] = useState(1)

  const send = () => {
    if (assistantText.trim() === '') {
      return
    }
    setMessages([
      ...messages,
      {
        id: `local-${messages.length}`,
        content: assistantText.trim(),
        author: 'me',
        createdAt: new Date().toISOString(),
      },
    ])
    setAssistantText('')
  }

  return (
    <ConfigProvider theme={{ algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
      <div
        style={{
          minHeight: '100vh',
          padding: 24,
          backgroundColor: dark ? '#141414' : '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            @vinctus/chat
          </Typography.Title>
          <Switch
            checked={dark}
            onChange={setDark}
            checkedChildren="dark"
            unCheckedChildren="light"
          />
        </div>

        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', maxWidth: 900 }}>
          <Pane title="Customer app today" subtitle="TripTrack's chat code, copied verbatim">
            <LiftedChat messages={driverMessages} unreadCount={2} />
          </Pane>
          <Pane title="The library" subtitle="the same conversation, drawn by @vinctus/chat">
            <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
              <ChatToggleButton
                onClick={() => undefined}
                unreadCount={2}
                icon={<i className="fas fa-comment" style={{ color: '#5878e7' }} />}
              />
            </div>
            <ChatPanel
              title="Chat with Marie"
              messages={asChatMessages}
              value={driverText}
              onChange={setDriverText}
              onSend={() => setDriverText('')}
            />
          </Pane>
        </div>

        <div style={{ marginTop: 48, maxWidth: 430 }}>
          <Typography.Title level={5} style={{ marginBottom: 0 }}>
            The dispatcher's trip chat
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            four senders in one thread, told apart by label and channel
          </Typography.Text>
          <ChatPanel
            title="Trip #4821 — Airport pickup"
            messages={dispatcherMessages}
            value={dispatcherText}
            onChange={setDispatcherText}
            onSend={() => setDispatcherText('')}
            placeholder="Message the passenger…"
            maxHeight={260}
          />
        </div>

        <div style={{ marginTop: 48, maxWidth: 430 }}>
          <Typography.Title level={5} style={{ marginBottom: 0 }}>
            The account assistant
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            same components, a different conversation
          </Typography.Text>
          <ChatPanel
            title="ShuttleControl assistant"
            messages={messages}
            value={assistantText}
            onChange={setAssistantText}
            onSend={send}
            placeholder="Ask me anything…"
            maxHeight={260}
            footer={
              pending > 0 ? (
                <div style={{ padding: '0 12px 10px' }}>
                  <Typography.Text type="warning" style={{ fontSize: 12 }}>
                    ⏳ Nothing has been changed yet — 1 change is waiting for your confirmation.
                  </Typography.Text>
                  <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
                    <Button size="small" type="primary">
                      Confirm
                    </Button>
                    <Button size="small">Discard</Button>
                  </div>
                </div>
              ) : null
            }
          />
        </div>
      </div>
    </ConfigProvider>
  )
}
