const ChatMessage = ({ message, isOwn }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] ${isOwn ? 'order-2' : ''}`}>
        {/* Username */}
        {!isOwn && (
          <div className="text-xs text-gray-500 mb-1 ml-1">
            {message.username || '匿名用户'}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
          }`}
        >
          <p className="break-words">{message.content}</p>
        </div>

        {/* Time */}
        <div className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
          {formatTime(message.created_at)}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
