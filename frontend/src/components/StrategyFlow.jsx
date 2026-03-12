import React, { useState } from 'react';
import { strategySteps } from '../data/strategySteps';
import StrategyStep from './StrategyStep';
import ProgressIndicator from './ProgressIndicator';
import InterestModal from './InterestModal';
import { useScrollProgress } from '../hooks/useScroll';

export default function StrategyFlow() {
  const [sectionRef, scrollProgress] = useScrollProgress();
  const [activeModal, setActiveModal] = useState(null);

  return (
    <section className="strategy-section" ref={sectionRef}>
      {/* Sticky header */}
      <div className="strategy-header">
        <div className="section-tag">HOW IT WORKS</div>
        <h2 className="strategy-title">
          The SniperThink<br />
          <span className="title-accent">Precision Framework</span>
        </h2>
        <p className="strategy-sub">
          Four battle-tested stages that transform ambiguity into measurable advantage.
        </p>
      </div>

      {/* Scroll progress bar at top */}
      <div className="scroll-progress-bar">
        <div
          className="scroll-progress-fill"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="steps-container">
        {strategySteps.map((step, index) => (
          <StrategyStep
            key={step.id}
            step={step}
            index={index}
            onInterest={setActiveModal}
          />
        ))}
      </div>

      {/* Side progress indicator */}
      <ProgressIndicator steps={strategySteps} progress={scrollProgress} />

      {/* Modal */}
      {activeModal && (
        <InterestModal
          step={activeModal}
          onClose={() => setActiveModal(null)}
        />
      )}
    </section>
  );
}
