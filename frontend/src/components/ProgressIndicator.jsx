import React from 'react';

export default function ProgressIndicator({ steps, progress }) {
  // progress: 0–1 scroll through the section
  const activeIndex = Math.min(
    steps.length - 1,
    Math.floor(progress * steps.length)
  );

  return (
    <div className="progress-indicator">
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ height: `${progress * 100}%` }}
        />
      </div>

      {steps.map((step, i) => (
        <div
          key={step.id}
          className={`progress-dot ${i <= activeIndex ? 'active' : ''}`}
          style={{ '--accent': step.accent }}
          title={step.title}
        >
          <span className="dot-label">{step.label}</span>
          <span
            className="dot-circle"
            style={{
              background: i <= activeIndex ? step.accent : 'transparent',
              borderColor: step.accent,
            }}
          />
        </div>
      ))}
    </div>
  );
}
