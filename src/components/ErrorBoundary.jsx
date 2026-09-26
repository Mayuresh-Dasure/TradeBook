import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[BookLoop] Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '20px',
          backgroundColor: 'var(--bg-warm)',
          padding: '40px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '4rem' }}>📚</div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-forest)', margin: 0 }}>
            Oops — something went wrong
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '420px', lineHeight: '1.6' }}>
            BookLoop ran into an unexpected error. Your data is safe — just reload the page to continue.
          </p>
          {this.state.error && (
            <details style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '12px',
              padding: '12px 20px',
              maxWidth: '500px',
              textAlign: 'left',
              cursor: 'pointer',
            }}>
              <summary style={{ color: '#DC2626', fontWeight: '600', fontSize: '0.85rem' }}>
                Error details
              </summary>
              <pre style={{ fontSize: '0.75rem', color: '#7F1D1D', marginTop: '8px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
          <button
            id="error-boundary-reload"
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: 'var(--primary-forest)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 28px',
              fontSize: '0.95rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
            onMouseOut={e => e.currentTarget.style.opacity = '1'}
          >
            Reload BookLoop
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
