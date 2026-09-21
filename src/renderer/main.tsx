import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';
import './styles.css';
class ErrorBoundary extends Component<{ children: ReactNode }, { error: string }> {
  state = { error: '' };
  static getDerivedStateFromError(error: Error) { return { error: error.message }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error(error, info); }
  render() {
    if (this.state.error) return <main style={{ padding: 60, fontFamily: 'system-ui', color: '#eadfc6', background: '#1b2420', minHeight: '100vh' }}><h1>Le studio a rencontré une erreur.</h1><p>Le fichier original de ta cinématique n’a pas été modifié.</p><pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error}</pre><button onClick={() => location.reload()}>Recharger le studio</button></main>;
    return this.props.children;
  }
}
createRoot(document.getElementById('root')!).render(<ErrorBoundary><App/></ErrorBoundary>);
