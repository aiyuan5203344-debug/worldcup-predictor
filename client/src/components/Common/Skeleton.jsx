const Skeleton = ({ type = 'text', count = 1, className = '' }) => {
  const getStyle = () => ({
    background: 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton 1.5s ease-in-out infinite',
    borderRadius: '8px'
  })

  const getHeight = () => {
    switch (type) {
      case 'title': return '32px'
      case 'subtitle': return '24px'
      case 'text': return '16px'
      case 'avatar': return '48px'
      case 'image': return '200px'
      case 'card': return '120px'
      default: return '16px'
    }
  }

  const getWidth = () => {
    switch (type) {
      case 'title': return '60%'
      case 'subtitle': return '40%'
      case 'text': return '100%'
      case 'avatar': return '48px'
      case 'image': return '100%'
      case 'card': return '100%'
      default: return '100%'
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          style={{
            ...getStyle(),
            height: getHeight(),
            width: getWidth()
          }}
        />
      ))}
      <style>{`
        @keyframes skeleton {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}

export const MatchCardSkeleton = () => (
  <div className="p-4 rounded-xl" style={{ background: '#1a2332', border: '1px solid #1e293b' }}>
    <div className="flex items-center justify-between mb-4">
      <Skeleton type="text" count={1} className="w-24" />
      <Skeleton type="text" count={1} className="w-16" />
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <Skeleton type="avatar" />
        <Skeleton type="subtitle" count={1} className="flex-1" />
      </div>
      <Skeleton type="text" count={1} className="w-12 mx-4" />
      <div className="flex items-center gap-3 flex-1 justify-end">
        <Skeleton type="subtitle" count={1} className="flex-1" />
        <Skeleton type="avatar" />
      </div>
    </div>
  </div>
)

export const LeaderboardSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="flex items-center gap-4 p-3 rounded-lg"
        style={{ background: '#1a2332', border: '1px solid #1e293b' }}>
        <Skeleton type="text" count={1} className="w-8" />
        <Skeleton type="avatar" />
        <div className="flex-1">
          <Skeleton type="subtitle" count={1} className="w-32 mb-2" />
          <Skeleton type="text" count={1} className="w-20" />
        </div>
        <Skeleton type="text" count={1} className="w-16" />
      </div>
    ))}
  </div>
)

export default Skeleton
