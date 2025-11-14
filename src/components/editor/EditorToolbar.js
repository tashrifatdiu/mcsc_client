import React from 'react';
import { EDITOR_TOOLS } from './EditorConfig';

export default function EditorToolbar({ onAction, activeTools = {} }) {
  // no disabled tools by default here — features are implemented or removed
  const disabledToolNames = new Set();

  const renderToolGroup = (tools, groupName, disableGroup = false) => (
    <div className="editor-toolbar-group">
      <div className="editor-toolbar-label">{groupName}</div>
      <div className="editor-toolbar-buttons">
        {tools.map(tool => {
          const disabled = disableGroup || disabledToolNames.has(tool.name);
          return (
            <button
              key={tool.name}
              className={`editor-tool-btn ${activeTools[tool.name] ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
              onClick={(e) => { if (!disabled) onAction(tool.name); e.preventDefault(); }}
              title={tool.tooltip}
              type="button"
              disabled={disabled}
            >
              {tool.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
  // Only keep the table from media tools for a simplified writer-focused toolbar
  const mediaTools = (EDITOR_TOOLS.media || []).filter(t => t.name === 'table');

  return (
    <div className="editor-toolbar">
  {renderToolGroup(EDITOR_TOOLS.text, 'Text')}
  {renderToolGroup(EDITOR_TOOLS.blocks, 'Blocks')}
  {renderToolGroup(EDITOR_TOOLS.lists, 'Lists')}
  {mediaTools.length > 0 && renderToolGroup(mediaTools, 'Media')}
  {renderToolGroup(EDITOR_TOOLS.math, 'Math')}
    </div>
  );
}