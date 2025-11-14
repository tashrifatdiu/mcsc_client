import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function HomeNavbar({ sections = [], active = '', onSelect = () => {} }) {
  const [open, setOpen] = useState(true);

  return (
    <nav className={`home-nav ${open ? 'open' : 'collapsed'}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <strong style={{ fontSize: 15 }}>Sections</strong>
        <button className="btn btn-ghost" onClick={() => setOpen(o => !o)} aria-expanded={open}>{open ? 'Hide' : 'Show'}</button>
      </div>
      <ul>
        {sections.map(s => (
          <li key={s.id}>
            <button
              onClick={() => onSelect(s.id)}
              className={`nav-button ${active === s.id ? 'active' : ''}`}
              aria-pressed={active === s.id}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="nav-badge">{s.label.charAt(0)}</span>
                <div>
                  <div style={{ fontSize: 14 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{s.id === 'journal' ? <Link to="/journal">Open Journal</Link> : 'Section'}</div>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}