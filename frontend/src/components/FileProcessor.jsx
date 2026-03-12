import React, { useState, useRef, useCallback } from 'react';
import { uploadFile, getJobStatus, getJobResult } from '../api';

export default function FileProcessor() {
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [job, setJob] = useState(null); // { jobId, status, progress }
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | uploading | polling | done | error

  const inputRef = useRef(null);
  const pollRef = useRef(null);

  const startPolling = useCallback((jobId) => {
    setPhase('polling');

    const poll = async () => {
      try {
        const status = await getJobStatus(jobId);
        setJob(status);

        if (status.status === 'completed') {
          clearInterval(pollRef.current);
          const res = await getJobResult(jobId);
          setResult(res.result);
          setPhase('done');
        } else if (status.status === 'failed') {
          clearInterval(pollRef.current);
          setError(status.error || 'Processing failed');
          setPhase('error');
        }
      } catch (err) {
        clearInterval(pollRef.current);
        setError(err.message);
        setPhase('error');
      }
    };

    pollRef.current = setInterval(poll, 1500);
    poll();
  }, []);

  const handleFile = async (file) => {
    if (!file) return;

    const allowed = ['application/pdf', 'text/plain'];
    if (!allowed.includes(file.type) && !file.name.endsWith('.txt')) {
      setError('Only PDF and TXT files are supported');
      setPhase('error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File exceeds 10MB limit');
      setPhase('error');
      return;
    }

    setError('');
    setResult(null);
    setJob(null);
    setPhase('uploading');
    setUploadProgress(0);

    try {
      const res = await uploadFile(file, setUploadProgress);
      startPolling(res.jobId);
    } catch (err) {
      setError(err.message);
      setPhase('error');
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const reset = () => {
    clearInterval(pollRef.current);
    setPhase('idle');
    setJob(null);
    setResult(null);
    setError('');
    setUploadProgress(0);
  };

  return (
    <section className="file-section">
      <div className="file-section-header">
        <div className="section-tag">PART 2</div>
        <h2 className="file-section-title">File Processing Engine</h2>
        <p className="file-section-sub">
          Upload a PDF or TXT file. Our async workers extract insights in real-time.
        </p>
      </div>

      <div className="file-processor-container">
        {/* Upload zone */}
        {phase === 'idle' && (
          <div
            className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <div className="drop-icon">⬆</div>
            <p className="drop-text">Drop your file here or <u>browse</u></p>
            <p className="drop-hint">PDF or TXT · max 10MB</p>
          </div>
        )}

        {/* Upload progress */}
        {phase === 'uploading' && (
          <div className="status-card">
            <div className="status-label">Uploading…</div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
            </div>
            <div className="progress-pct">{uploadProgress}%</div>
          </div>
        )}

        {/* Processing status */}
        {phase === 'polling' && job && (
          <div className="status-card">
            <div className="status-label">
              <span className="pulse-dot" /> {job.status.toUpperCase()}
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill processing" style={{ width: `${job.progress}%` }} />
            </div>
            <div className="progress-pct">{job.progress}%</div>
            <div className="job-id">Job ID: {job.jobId}</div>
          </div>
        )}

        {/* Results */}
        {phase === 'done' && result && (
          <div className="result-card">
            <div className="result-header">
              <span className="result-check">✓</span> Analysis Complete
            </div>
            <div className="result-grid">
              <div className="result-stat">
                <div className="result-value">{result.wordCount.toLocaleString()}</div>
                <div className="result-stat-label">Total Words</div>
              </div>
              <div className="result-stat">
                <div className="result-value">{result.paragraphCount}</div>
                <div className="result-stat-label">Paragraphs</div>
              </div>
            </div>
            <div className="keywords-section">
              <div className="kw-title">Top Keywords</div>
              <div className="kw-list">
                {result.topKeywords.map((kw, i) => (
                  <div key={kw.word} className="kw-item">
                    <span className="kw-rank">#{i + 1}</span>
                    <span className="kw-word">{kw.word}</span>
                    <span className="kw-count">{kw.count}×</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="reset-btn" onClick={reset}>Process Another File</button>
          </div>
        )}

        {/* Error */}
        {phase === 'error' && (
          <div className="error-card">
            <div className="error-icon">⚠</div>
            <p className="error-msg">{error}</p>
            <button className="reset-btn" onClick={reset}>Try Again</button>
          </div>
        )}
      </div>
    </section>
  );
}
