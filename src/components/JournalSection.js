import React from 'react';

export default function JournalSection() {
  return (
    <div className="home-section" aria-labelledby="journal-heading">
      <div className="section-title">
        <div className="kicker">Journal</div>
        <h2 id="journal-heading">Club Journal</h2>
      </div>

      <p className="small-muted">Our in-house journal features articles, experiments, and student research. Click "Open Journal" to start editing entries.</p>

      <div style={{ display:'flex', gap: 12, marginTop: 12, alignItems: 'center' }}>
        <div style={{ flex:1 }}>
          <div style={{ padding: 12, borderRadius: 10, background:'#rgba(37,39,50,0.6)', border:'1px solid rgba(2,6,23,0.04)' }}>
            <h3 style={{ margin:0 }}>Latest: The Physics of Everyday Objects</h3>
            <p className="small-muted" style={{ marginTop:8 }}>An exploration into simple experiments you can try at home.</p>
          </div>
        </div>
        <div>
          <button style={{ padding:'10px 14px', borderRadius:10, background:'var(--accent)', color:'#fff', border:'none', cursor:'pointer' }}>
            Open Journal
          </button>
        </div>
      </div>
    </div>
  );
}