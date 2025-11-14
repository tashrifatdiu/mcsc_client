import React from 'react';

export default function MemberCard({ name, role, bio }) {
  const initials = name.split(' ').map(n => n.charAt(0)).slice(0,2).join('').toUpperCase();
  return (
    <div className="member-card" role="article" aria-label={name}>
      <div className="member-avatar">{initials}</div>
      <div className="member-info">
        <h4>{name}</h4>
        <p className="small-muted">{role}</p>
        {bio && <p style={{ marginTop: 8, fontSize: 13 }}>{bio}</p>}
      </div>
    </div>
  );
}