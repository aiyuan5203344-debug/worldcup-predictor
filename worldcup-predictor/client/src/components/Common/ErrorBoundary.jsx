import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    this.setState({ errorInfo })
    
    // Report to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to Sentry or similar
      console.error('Production error:', { error, errorInfo })
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.icon}>⚠️</div>
            <h1 style={styles.title}>页面出现错误</h1>
            <p style={styles.message}>
              {this.state.error?.message || '发生了未知错误'}
            </p>
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details style={styles.details}>
                <summary style={styles.summary}>错误详情（开发模式）</summary>
                <pre style={styles.stack}>
                  {this.state.error?.stack}
                  {'\n\n'}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <div style={styles.actions}>
              <button onClick={this.handleRetry} style={styles.button}>
                重试
              </button>
              <button onClick={this.handleGoHome} style={styles.buttonSecondary}>
                返回首页
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0e17',
    padding: '20px'
  },
  card: {
    maxWidth: '480px',
    width: '100%',
    background: '#1a2332',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
  },
  icon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  title: {
    color: '#f8fafc',
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 12px'
  },
  message: {
    color: '#94a3b8',
    fontSize: '16px',
    margin: '0 0 24px'
  },
  details: {
    textAlign: 'left',
    marginBottom: '24px'
  },
  summary: {
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '14px'
  },
  stack: {
    background: '#0f172a',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '8px',
    overflow: 'auto',
    maxHeight: '200px',
    color: '#ef4444',
    fontSize: '12px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
  },
  button: {
    background: 'linear-gradient(135deg, #d4af37, #b8941f)',
    color: '#0a0e17',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  buttonSecondary: {
    background: 'transparent',
    color: '#94a3b8',
    border: '1px solid #374151',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
}

export default ErrorBoundary
