const Skeleton = ({ className = '', count = 1, style = {} }) => {
  return (
    <div className={className} style={style}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded"
          style={{
            background: 'linear-gradient(90deg, #1e1e1e 25%, #2a2a2a 50%, #1e1e1e 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            marginBottom: i < count - 1 ? '8px' : 0
          }}
        />
      ))}
    </div>
  )
}

export const SkeletonCard = ({ lines = 3, height = 16 }) => (
  <div className="card p-4">
    <Skeleton count={lines} style={{ height: `${height}px`, width: '100%' }} />
  </div>
)

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="card p-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4" style={{ marginBottom: i < rows - 1 ? '12px' : 0 }}>
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} style={{ height: '14px', flex: 1 }} />
        ))}
      </div>
    ))}
  </div>
)

export const SkeletonStats = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="card p-6 text-center">
        <Skeleton style={{ height: '32px', width: '32px', margin: '0 auto 8px' }} />
        <Skeleton style={{ height: '28px', width: '60px', margin: '0 auto 8px' }} />
        <Skeleton style={{ height: '14px', width: '50px', margin: '0 auto' }} />
      </div>
    ))}
  </div>
)

export default Skeleton
