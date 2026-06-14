import { useState, useRef, useCallback } from 'react'

const ChatInput = ({ onSend, onTyping, onStopTyping, disabled, placeholder }) => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef(null)

  const handleChange = useCallback((e) => {
    const value = e.target.value
    setMessage(value)

    // 处理输入状态
    if (!isTyping && value.length > 0) {
      setIsTyping(true)
      onTyping?.()
    }

    // 重置typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      onStopTyping?.()
    }, 2000)
  }, [isTyping, onTyping, onStopTyping])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const trimmed = message.trim()
    if (!trimmed || disabled) return

    onSend(trimmed)
    setMessage('')
    setIsTyping(false)
    onStopTyping?.()

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-200">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={500}
          className={`flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-green-500 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'
          }`}
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            disabled || !message.trim()
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          发送
        </button>
      </div>
      <div className="text-xs text-gray-400 mt-1 text-right">
        {message.length}/500
      </div>
    </form>
  )
}

export default ChatInput
