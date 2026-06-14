import { useState } from 'react'
import toast from 'react-hot-toast'

const ShareButton = ({ title, text, url }) => {
  const [showShareMenu, setShowShareMenu] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || '今天你买球了吗 - 2026世界杯预测',
          text: text || '快来参与2026世界杯预测，与全球球迷一决高下！',
          url: url || window.location.href
        })
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error('分享失败')
        }
      }
    } else {
      setShowShareMenu(!showShareMenu)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('链接已复制')
      setShowShareMenu(false)
    } catch (error) {
      toast.error('复制失败')
    }
  }

  const shareToWeChat = () => {
    toast.success('请打开微信扫描二维码分享')
    setShowShareMenu(false)
  }

  const shareToWeibo = () => {
    const text = encodeURIComponent(title || '今天你买球了吗 - 2026世界杯预测')
    const url = encodeURIComponent(window.location.href)
    window.open(`https://service.weibo.com/share/share.php?title=${text}&url=${url}`)
    setShowShareMenu(false)
  }

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
        style={{
          background: '#1e293b',
          color: '#94a3b8',
          border: '1px solid #334155'
        }}
      >
        📤 分享
      </button>

      {showShareMenu && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg z-50"
          style={{
            background: '#1a2332',
            border: '1px solid #1e293b'
          }}>
          <div className="p-2">
            <button
              onClick={copyToClipboard}
              className="w-full px-4 py-2 text-left text-sm rounded-lg hover:bg-slate-700 transition-colors"
              style={{ color: '#f8fafc' }}
            >
              📋 复制链接
            </button>
            <button
              onClick={shareToWeChat}
              className="w-full px-4 py-2 text-left text-sm rounded-lg hover:bg-slate-700 transition-colors"
              style={{ color: '#f8fafc' }}
            >
              💬 微信分享
            </button>
            <button
              onClick={shareToWeibo}
              className="w-full px-4 py-2 text-left text-sm rounded-lg hover:bg-slate-700 transition-colors"
              style={{ color: '#f8fafc' }}
            >
              🔵 微博分享
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShareButton
