import React, { useEffect, useState } from 'react';

export default function FloatingToolbar({ selection, onAction }) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!selection || selection.isCollapsed) {
      setVisible(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    setPosition({
      top: rect.top - 40,
      left: rect.left + (rect.width / 2) - 100
    });
    setVisible(true);
  }, [selection]);

  if (!visible) return null;

  // disable highlight and link in the floating toolbar to avoid non-functional features
  return (
    <div 
      className="floating-toolbar"
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <button onClick={() => onAction('bold')} title="Bold">B</button>
      <button onClick={() => onAction('italic')} title="Italic">I</button>
      <button disabled title="Link (disabled)">🔗</button>
      <button onClick={() => onAction('highlight')} title="Highlight">⚡</button>
    </div>
  );
}