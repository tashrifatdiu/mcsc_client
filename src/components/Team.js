import React from 'react';
import MemberCard from './MemberCard';

const TEAM = [
  { name: 'Ayesha Rahman', role: 'President', bio: 'Physics enthusiast & competition lead' },
  { name: 'Md. Tuhin', role: 'Vice President', bio: 'Robotics and coding mentor' },
  { name: 'Rima Sultana', role: 'Secretary', bio: 'Science communicator & event coordinator' },
  { name: 'Arif Khan', role: 'Treasurer', bio: 'Organizes logistics and sponsorships' },
  { name: 'Sadia Noor', role: 'Journal Editor', bio: 'Leads the club journal and articles' }
];

export default function Team() {
  return (
    <div className="home-section" aria-labelledby="team-heading">
      <div className="section-title">
        <div className="kicker">Team</div>
        <h2 id="team-heading">Meet our core team</h2>
      </div>

      <p className="small-muted">A diverse group of students who run workshops, guide projects and manage the club.</p>

      <div className="team-grid" style={{ marginTop: 14 }}>
        {TEAM.map(m => <MemberCard key={m.name} {...m} />)}
      </div>
    </div>
  );
}