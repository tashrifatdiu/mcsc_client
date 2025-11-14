import React from 'react';

const COVERAGE = [
  { outlet: 'Daily Student', title: 'MCSC wins regional science fair', date: '2024-05-18', url: '#' },
  { outlet: 'Campus Times', title: 'Robotics bootcamp a success', date: '2024-02-12', url: '#' }
];

export default function PastCoverage() {
  return (
    <div className="home-section" aria-labelledby="past-heading">
      <div className="section-title">
        <div className="kicker">Press</div>
        <h2 id="past-heading">Past coverage</h2>
      </div>

      <div className="coverage-list" style={{ marginTop: 12 }}>
        {COVERAGE.map((c, i) => (
          <div key={i} className="coverage-item">
            <div>
              <strong>{c.title}</strong>
              <div className="small-muted">{c.outlet} • {c.date}</div>
            </div>
            <div>
              <a href={c.url} style={{ color: 'var(--accent)' }}>Read</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}