import React from 'react';

const H = [
  { title: 'Annual Science Fair', desc: 'Showcasing student projects and prototypes', color: '#fde68a' },
  { title: 'Robotics Bootcamp', desc: 'Hands-on training in robotics and programming', color: '#bbf7d0' },
  { title: 'Publication Launch', desc: 'New edition of the club journal released', color: '#dbeafe' }
];

export default function Highlights() {
  return (
    <div className="home-section" aria-labelledby="highlights-heading">
      <div className="section-title">
        <div className="kicker">Highlights</div>
        <h2 id="highlights-heading">Recent highlights</h2>
      </div>

      <div className="highlights-grid" style={{ marginTop: 12 }}>
        {H.map(h => (
          <div className="highlight" key={h.title}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <h3 style={{ margin:0, fontSize:16 }}>{h.title}</h3>
              <div style={{ width:40, height:40, borderRadius:8, background: h.color }} />
            </div>
            <p className="small-muted" style={{ marginTop:10 }}>{h.desc}</p>
            <div style={{ marginTop:12 }}>
              <button style={{ padding:'8px 12px', borderRadius:8, border:'none', background:'var(--accent)', color:'#fff', cursor:'pointer' }}>
                Learn more
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}