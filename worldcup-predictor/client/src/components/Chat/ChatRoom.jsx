import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { WS_URL } from '../../config'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'

const ChatRoom = ({ matchId, user }) => {
  const [messages, setMessages] = useState([])
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const messagesEndRef = useRef(null)

  const roomId = `match-${matchId}`

  useEffect(() => {
    // 连接Socket
    const token = localStorage.getItem('accessToken')
    const newSocket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      console.log('Chat connected')
      setConnected(true)
      newSocket.emit('joinRoom', roomId)
    })

    newSocket.on('disconnect', () => {
      console.log('Chat disconnected')
      setConnected(false)
    })

    newSocket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message])
    })

    newSocket.on('userTyping', (data) => {
      setTypingUsers(prev => {
        if (!prev.find(u => u.userId === data.userId)) {
          return [...prev, data]
        }
        return prev
      })
    })

    newSocket.on('userStopTyping', (data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
    })

    setSocket(newSocket)

    // 加载历史消息
    fetchMessages()

    return () => {
      newSocket.emit('leaveRoom', roomId)
      newSocket.disconnect()
    }
  }, [matchId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${WS_URL}/api/chat/${roomId}/messages?limit=50`)
      const data = await response.json()
      if (data.messages) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = (content) => {
    if (!socket || !user) return

    socket.emit('sendMessage', {
      roomId,
      content,
      messageType: 'text'
    })
  }

  const handleTyping = () => {
    if (!socket || !user) return
    socket.emit('typing', roomId)
  }

  const handleStopTyping = () => {
    if (!socket || !user) return
    socket.emit('stopTyping', roomId)
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <span className="font-medium">比赛聊天室</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-300' : 'bg-red-300'}`}></span>
          <span className="text-green-100">{connected ? '已连接' : '连接中...'}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-4xl mb-2">💬</p>
            <p>还没有消息</p>
            <p className="text-sm">快来发表第一条评论吧！</p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} isOwn={user?.id === msg.user_id} />
          ))
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="text-sm text-gray-500 italic">
            {typingUsers.map(u => u.username).join(', ')} 正在输入...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSendMessage}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
        disabled={!user}
        placeholder={user ? '输入消息...' : '请登录后发言'}
      />
    </div>
  )
}

export default ChatRoom
