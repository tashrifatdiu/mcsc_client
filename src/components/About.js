import React from 'react';

export default function About() {
  return (
    <div className="home-section" aria-labelledby="about-heading">
      <div className="section-title">
        <div className="kicker">About</div>
        <h2 id="about-heading">Who we are</h2>
      </div>

      <p className="small-muted">
        Milestone College Science Club (MCSC) is a student-led community that cultivates curiosity and hands-on learning.
        We organize workshops, competitions, and science communication activities to empower students across grades 9–12.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18, marginTop: 16 }}>
        <div>
          <p>
            Our mission is to make science accessible and exciting. We host regular sessions on physics, chemistry, biology,
            robotics, and science journalism. Members get opportunities to collaborate on projects, present at club showcases,
            and participate in inter-college events.
          </p>

          <ul style={{ marginTop: 12, color: '#334155' }}>
            <li>Hands-on workshops and lab sessions</li>
            <li>Project mentorship and showcase events</li>
            <li>Science communication & journal club</li>
            <li>Competitions & community outreach</li>
          </ul>
        </div>

        <aside style={{ padding: 14, borderRadius: 12, background: 'linear-gradient(180deg,#fff,#f7fdff)', border: '1px solid rgba(2,6,23,0.03)' }}>
          <h4 style={{ margin: '0 0 8px 0' }}>Quick facts</h4>
          <p style={{ margin: 0 }}><strong>Members:</strong> 200+</p>
          <p style={{ margin: 0 }}><strong>Established:</strong> 2016</p>
          <p style={{ margin: 0 }}><strong>Campus:</strong> Main & Permanent</p>
        </aside>
      </div>
    </div>
  );
}