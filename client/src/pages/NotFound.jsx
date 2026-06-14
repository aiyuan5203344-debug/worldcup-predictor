import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0a0e17 0%, #1a2332 50%, #0d1f2d 100%)' }}>
      
      <div className="text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <span className="text-[150px] font-bold leading-none"
            style={{ 
              background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 60px rgba(212, 175, 55, 0.3)'
            }}>
            404
          </span>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-white mb-4">
          页面不存在
        </h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          抱歉，您访问的页面不存在或已被移除。请检查URL是否正确。
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] inline-block"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
              color: '#0a0e17',
              textDecoration: 'none',
              boxShadow: '0 10px 20px -5px rgba(212, 175, 55, 0.3)'
            }}
          >
            🏠 返回首页
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'transparent',
              color: '#d4af37',
              border: '1px solid #d4af37',
              cursor: 'pointer'
            }}
          >
            ← 返回上页
          </button>
        </div>

        {/* Fun Message */}
        <div className="mt-12 p-4 rounded-xl inline-block"
          style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
          <p className="text-gray-400 text-sm">
            ⚽ 就像越位一样，这个页面也不在正确的位置
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound
