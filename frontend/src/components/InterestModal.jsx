import React, { useState } from 'react';
import { submitInterest } from '../api';

export default function InterestModal({ step, onClose }) {
  const [form, setForm] = useState({ name: '', email: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await submitInterest({
        name: form.name,
        email: form.email,
        selectedStep: step.title,
      });
      setStatus('success');
      setMessage(res.message);
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={{ '--accent': step.accent }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-step-badge" style={{ color: step.accent }}>
          {step.icon} {step.label}
        </div>

        <h2 className="modal-title">I'm Interested in<br /><em>{step.title}</em></h2>
        <p className="modal-sub">Tell us how to reach you and we'll be in touch.</p>

        {status === 'success' ? (
          <div className="modal-success">
            <div className="success-icon">✓</div>
            <p>{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="field">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
                disabled={status === 'loading'}
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                required
                disabled={status === 'loading'}
              />
            </div>

            {status === 'error' && (
              <p className="modal-error">{message}</p>
            )}

            <button
              type="submit"
              className="submit-btn"
              disabled={status === 'loading'}
              style={{ '--accent': step.accent }}
            >
              {status === 'loading' ? (
                <span className="spinner" />
              ) : (
                'Send Interest →'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
