import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './Contexts/AuthContext.jsx';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
    // ✅ prints EXACT component that crashed
    console.error("💥 CRASHED IN:", info.componentStack);
    console.error("💥 ERROR:", error.message);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red' }}>
          <h2>Error: {this.state.error?.message}</h2>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            <Route path='/*' element={<App/>}/>
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  </StrictMode>,
)
