import React from 'react';
import StrategyFlow from './components/StrategyFlow';
import FileProcessor from './components/FileProcessor';
import './styles.css';

function App() {
  return (
    <div className="app">
      {/* Nav */}
      <nav className="nav">
        <div className="nav-logo">
          <span className="logo-mark">◎</span> SniperThink
        </div>
        <div className="nav-links">
          <a href="#strategy">Strategy</a>
          <a href="#files">File Engine</a>
          <a href="#strategy" className="nav-cta">Get Started</a>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero">
        <div className="hero-tag">PRECISION STRATEGY PLATFORM</div>
        <h1 className="hero-title">
          Think Sharp.<br />
          <span className="hero-accent">Execute Sharper.</span>
        </h1>
        <p className="hero-sub">
          SniperThink turns market noise into competitive signal —<br />
          delivering strategies that hit exactly where it counts.
        </p>
        <a href="#strategy" className="hero-btn">See How It Works ↓</a>

        {/* Decorative crosshair */}
        <div className="hero-crosshair">
          <div className="ch-h" /><div className="ch-v" />
          <div className="ch-circle ch-1" />
          <div className="ch-circle ch-2" />
          <div className="ch-dot" />
        </div>
      </header>

      {/* Strategy Flow */}
      <div id="strategy">
        <StrategyFlow />
      </div>

      {/* File Processor */}
      <div id="files">
        <FileProcessor />
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-logo">◎ SniperThink</div>
        <p className="footer-copy">© 2025 SniperThink. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
