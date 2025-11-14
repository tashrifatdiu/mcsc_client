import React from 'react';

const EVENTS = [
  { title: 'Science Fair 2025', date: '2025-02-20', location: 'Main Hall', desc: 'Project showcase and awards.' },
  { title: 'Robotics Workshop', date: '2025-03-11', location: 'Lab 3', desc: 'Intro to Arduino and sensors.' },
  { title: 'Journal Club Meet', date: '2025-04-05', location: 'Room 12', desc: 'Discussing latest student articles.' }
];

export default function UpcomingEvents() {
  return (
    <div className="home-section" aria-labelledby="events-heading">
      <div className="section-title">
        <div className="kicker">Events</div>
        <h2 id="events-heading">Upcoming events</h2>
      </div>

      <div className="events-grid" style={{ marginTop: 12 }}>
        {EVENTS.map((e, i) => (
          <div key={i} className="event">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <h3 style={{ margin: 0 }}>{e.title}</h3>
                <div className="small-muted">{e.location}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>{e.date}</div>
                <div className="small-muted">Date</div>
              </div>
            </div>
            <p className="small-muted" style={{ marginTop: 10 }}>{e.desc}</p>
            <div style={{ marginTop: 10 }}>
              <button style={{ padding:'8px 12px', borderRadius:8, border:'1px solid rgba(2,6,23,0.06)', background:'#fff' }}>Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}