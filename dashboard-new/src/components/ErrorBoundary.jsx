import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Componente travou:', error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0a0a0c',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          padding: '24px',
          fontFamily: "'Outfit', sans-serif",
          color: '#f8fafc',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'linear-gradient(135deg, #1ea465, #126b41)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(30,164,101,0.4)',
          }}>
            <svg viewBox="0 0 24 24" style={{ width: 36, height: 36, fill: 'white' }}>
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"/>
            </svg>
          </div>
          <div style={{ textAlign: 'center', maxWidth: 360 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Algo deu errado
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(248,250,252,0.5)', lineHeight: 1.5, marginBottom: 24 }}>
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 28px',
                background: '#1ea465',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Recarregar
            </button>
          </div>
          {this.state.error && (
            <pre style={{
              fontSize: 11, color: 'rgba(255,100,100,0.7)',
              background: 'rgba(255,0,0,0.05)', padding: 12,
              borderRadius: 8, maxWidth: '90vw', overflowX: 'auto',
              whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
