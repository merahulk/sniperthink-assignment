import React, { useState } from 'react';
import { useInView } from '../hooks/useScroll';

export default function StrategyStep({ step, index, onInterest }) {
  const [ref, inView] = useInView({ threshold: 0.25, once: true });
  const [hovered, setHovered] = useState(false);

  const isEven = index % 2 === 0;

  // Each step has a different animation class
  const animationClass = [
    'anim-slide-up',
    'anim-slide-left',
    'anim-scale-in',
    'anim-rotate-in',
  ][index % 4];

  return (
    <div
      ref={ref}
      className={`strategy-step ${isEven ? 'step-even' : 'step-odd'} ${animationClass} ${inView ? 'in-view' : ''}`}
      style={{ '--accent': step.accent, '--delay': `${index * 0.12}s` }}
    >
      {/* Number watermark */}
      <div className="step-watermark">{step.number}</div>

      {/* Left: Content */}
      <div className="step-content">
        <div className="step-label">
          <span className="step-icon" style={{ color: step.accent }}>{step.icon}</span>
          <span>{step.label}</span>
          <span className="step-sep">—</span>
          <span className="step-subtitle">{step.subtitle}</span>
        </div>

        <h3 className="step-title">{step.title}</h3>
        <p className="step-desc">{step.description}</p>

        <div
          className={`step-detail-box ${hovered ? 'expanded' : ''}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <span className="detail-toggle">
            {hovered ? '▲ Less' : '▼ Details'}
          </span>
          <p className="detail-text">{step.detail}</p>
        </div>

        <button
          className="interest-btn"
          style={{ '--accent': step.accent }}
          onClick={() => onInterest(step)}
        >
          I'm Interested
          <span className="btn-arrow">→</span>
        </button>
      </div>

      {/* Right: Metric card */}
      <div
        className="step-metric-card"
        style={{ '--accent': step.accent }}
      >
        <div className="metric-glow" />
        <div className="metric-value">{step.metric}</div>
        <div className="metric-label">{step.metricLabel}</div>
        <div className="metric-icon">{step.icon}</div>
      </div>
    </div>
  );
}
