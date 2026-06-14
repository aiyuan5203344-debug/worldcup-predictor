import PropTypes from 'prop-types'

// Unified loading spinner
export function LoadingSpinner({ size = 'md', color = 'gold', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const colorClasses = {
    gold: 'border-accent-gold',
    blue: 'border-accent-blue',
    green: 'border-accent-green',
    white: 'border-white'
  }

  return (
    <div 
      className={`${sizeClasses[size]} ${colorClasses[color]} border-2 border-bg-card border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="加载中"
    >
      <span className="sr-only">加载中...</span>
    </div>
  )
}

// Full page loading
export function PageLoading({ message = '加载中...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-text-secondary">{message}</p>
      </div>
    </div>
  )
}

// Card loading skeleton
export function CardSkeleton({ count = 1 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-bg-card rounded-xl p-4 border border-border-color">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-bg-secondary rounded w-1/4"></div>
            <div className="h-6 bg-bg-secondary rounded w-3/4"></div>
            <div className="flex gap-4">
              <div className="h-8 bg-bg-secondary rounded w-20"></div>
              <div className="h-8 bg-bg-secondary rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Inline loading for buttons
export function ButtonLoading({ text = '处理中...' }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LoadingSpinner size="sm" color="gold" />
      <span>{text}</span>
    </span>
  )
}

// Loading overlay
export function LoadingOverlay({ show, message = '加载中...' }) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-bg-primary/80 backdrop-blur-sm z-modal flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-text-secondary">{message}</p>
      </div>
    </div>
  )
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['gold', 'blue', 'green', 'white']),
  className: PropTypes.string
}

PageLoading.propTypes = {
  message: PropTypes.string
}

CardSkeleton.propTypes = {
  count: PropTypes.number
}

ButtonLoading.propTypes = {
  text: PropTypes.string
}

LoadingOverlay.propTypes = {
  show: PropTypes.bool,
  message: PropTypes.string
}

export default {
  LoadingSpinner,
  PageLoading,
  CardSkeleton,
  ButtonLoading,
  LoadingOverlay
}
