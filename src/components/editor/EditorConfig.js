export const EDITOR_TOOLS = {
  text: [
    { name: 'bold', icon: '𝐁', tooltip: 'Bold (Ctrl+B)' },
    { name: 'italic', icon: '𝐼', tooltip: 'Italic (Ctrl+I)' },
    { name: 'underline', icon: '𝐔', tooltip: 'Underline (Ctrl+U)' },
    { name: 'strikethrough', icon: '𝐒', tooltip: 'Strikethrough' },
  ],
  
  blocks: [
    { name: 'h1', icon: 'H1', tooltip: 'Heading 1' },
    { name: 'h2', icon: 'H2', tooltip: 'Heading 2' },
    { name: 'h3', icon: 'H3', tooltip: 'Heading 3' },
    { name: 'quote', icon: '"', tooltip: 'Quote' },
    { name: 'code', icon: '</>', tooltip: 'Code Block' },
  ],

  lists: [
    { name: 'bullet', icon: '•', tooltip: 'Bullet List' },
    { name: 'number', icon: '1.', tooltip: 'Numbered List' },
    { name: 'check', icon: '✓', tooltip: 'Check List' },
  ],

  media: [
    { name: 'image', icon: '🖼️', tooltip: 'Insert Image' },
    { name: 'video', icon: '🎥', tooltip: 'Insert Video' },
    { name: 'table', icon: '🏢', tooltip: 'Insert Table' },
    { name: 'link', icon: '🔗', tooltip: 'Insert Link' },
  ],

  math: [
    { name: 'latex', icon: '𝛴', tooltip: 'Insert LaTeX' },
    { name: 'equation', icon: '∫', tooltip: 'Insert Equation' },
  ],

  // special tools (diagram/citation/footnote) were removed from the toolbar per UX decision
  // they remain available programmatically in the editor logic if needed.
};

export const EDITOR_SHORTCUTS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+k': 'link',
  'mod+shift+c': 'code',
  'mod+shift+.': 'quote',
  'mod+shift+l': 'latex',
  'tab': 'indent',
  'shift+tab': 'outdent'
};

export const FONT_FAMILIES = [
  { name: 'Sans Serif', value: 'Quicksand, system-ui, sans-serif' },
  { name: 'Serif', value: 'Georgia, serif' },
  { name: 'Monospace', value: 'Space Mono, monospace' },
  { name: 'Scientific', value: 'CMU Serif, serif' }
];

export const COLOR_PRESETS = [
  { name: 'Default', value: '#1A0F2E' },
  { name: 'Accent', value: '#9B6DFF' },
  { name: 'Success', value: '#72F1B8' },
  { name: 'Warning', value: '#FFD93D' },
  { name: 'Danger', value: '#FF5D5D' }
];