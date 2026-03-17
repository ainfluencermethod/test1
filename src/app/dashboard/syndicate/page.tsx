'use client';

import dynamic from 'next/dynamic';
import { Suspense, Component, ReactNode } from 'react';

const SyndicateScene = dynamic(() => import('./SyndicateScene'), { ssr: false });

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          width: '100%', height: '100vh', background: '#0A0A0F',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', color: '#D4A843', fontFamily: 'monospace', padding: 40,
        }}>
          <h1 style={{ fontSize: 24, marginBottom: 16 }}>⚠️ SYNDICATE HQ OFFLINE</h1>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 8 }}>3D renderer encountered an error:</p>
          <pre style={{
            color: '#FF6B6B', fontSize: 12, maxWidth: 600, overflow: 'auto',
            padding: 16, background: '#1a1a2e', borderRadius: 8,
          }}>{this.state.error.message}</pre>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              marginTop: 16, padding: '8px 24px', background: '#D4A843',
              color: '#000', border: 'none', borderRadius: 4, cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function SyndicatePage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <SyndicateScene />
      </Suspense>
    </ErrorBoundary>
  );
}

function LoadingFallback() {
  return (
    <div style={{
      width: '100%', height: '100vh', background: '#0A0A0F',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#D4A843', fontFamily: 'monospace', fontSize: 18,
    }}>
      INITIALIZING HQ...
    </div>
  );
}
