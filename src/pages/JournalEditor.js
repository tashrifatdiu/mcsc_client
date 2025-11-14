import React, { useRef, useState, useEffect } from 'react';
import { createJournal, updateJournal, fetchJournalById } from '../apiJournal';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import useAuth from '../lib/useAuth';
import EditorToolbar from '../components/editor/EditorToolbar';
import FloatingToolbar from '../components/editor/FloatingToolbar';
import { EDITOR_SHORTCUTS, FONT_FAMILIES, COLOR_PRESETS } from '../components/editor/EditorConfig';
import '../components/editor/Editor.css';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function JournalEditor() {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const user = useAuth();
  const [title, setTitle] = useState('');
  const [selection, setSelection] = useState(null);
  const [activeTools, setActiveTools] = useState({});
  // Default to a serif font for a novel-writing experience
  const [fontFamily, setFontFamily] = useState('Georgia, serif');
  const [color, setColor] = useState(COLOR_PRESETS[0].value);
  const [images, setImages] = useState([]);
  const [citations, setCitations] = useState([]);
  const [footnotes, setFootnotes] = useState([]);
  const [latexSnippets, setLatexSnippets] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [autosaveTimeout, setAutosaveTimeout] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [journalId, setJournalId] = useState(null);
  const { id: editId } = useParams();

  // If editing an existing journal, load it
  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const data = await fetchJournalById(editId);
        const j = data.journal;
        if (!j) return;
        // ensure only owner can edit (client-side check)
        if (j.authorSupabaseId && user && j.authorSupabaseId !== user.id) {
          alert('You are not authorized to edit this journal');
          navigate(`/journal/${editId}`);
          return;
        }
        setJournalId(j._id);
        setTitle(j.title || '');
        setFontFamily(j.fontFamily || 'Georgia, serif');
        setColor(j.color || COLOR_PRESETS[0].value);
        if (editorRef.current) editorRef.current.innerHTML = j.bodyHtml || '';
        setTimeout(renderAllLatex, 50);
      } catch (err) {
        console.error('load journal for edit err', err);
      }
    })();
  }, [editId, user]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e) => {
      const key = [
        e.metaKey || e.ctrlKey ? 'mod' : '',
        e.shiftKey ? 'shift' : '',
        e.key.toLowerCase()
      ].filter(Boolean).join('+');

      if (EDITOR_SHORTCUTS[key]) {
        e.preventDefault();
        handleAction(EDITOR_SHORTCUTS[key]);
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, []);

  // Handle selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (sel.rangeCount === 0) return;

      const range = sel.getRangeAt(0);
      if (!editorRef.current?.contains(range.commonAncestorContainer)) return;

      setSelection(sel);
      updateActiveTools();
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  // Autosave functionality
  useEffect(() => {
    if (!isDirty) return;

    if (autosaveTimeout) {
      clearTimeout(autosaveTimeout);
    }

    const timeout = setTimeout(handleAutosave, 3000);
    setAutosaveTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [isDirty, title, editorRef.current?.innerHTML]);

  // Handle editor actions
  const handleAction = async (action) => {
    switch (action) {
      case 'latex':
        insertLatex();
        break;
      case 'citation':
        insertCitation();
        break;
      case 'footnote':
        insertFootnote();
        break;
      case 'table':
        insertTable();
        break;
      // Blocks
      case 'h1':
      case 'h2':
      case 'h3':
        await toggleBlock(action);
        break;
      case 'quote':
        await toggleBlock('blockquote');
        break;
      case 'code':
        await toggleCodeBlock();
        break;
      case 'highlight':
        await toggleHighlight();
        break;
      // Lists
      case 'bullet':
        document.execCommand('insertUnorderedList', false);
        break;
      case 'number':
        document.execCommand('insertOrderedList', false);
        break;
      case 'check':
        insertChecklist();
        break;
      default:
        document.execCommand(action, false);
    }
    setIsDirty(true);
    updateActiveTools();
  };

  // Media insertion (images/links) removed to keep a focused "novel writing" UI.

  const insertLatex = () => {
    const latex = prompt('Enter LaTeX expression:', '\\sum_{n=1}^\\infty');
    if (!latex) return;

    const marker = `$$${latex}$$`;
    document.execCommand('insertHTML', false, `
      <span class="latex" contenteditable="false">${marker}</span>
    `);
    setLatexSnippets(prev => [...prev, latex]);
    // render inserted latex immediately
    setTimeout(renderAllLatex, 50);
  };

  const renderAllLatex = () => {
    try {
      if (!editorRef.current) return;
      const nodes = editorRef.current.querySelectorAll('.latex');
      nodes.forEach(n => {
        const txt = n.textContent || '';
        const match = txt.match(/\$\$(.*)\$\$/s);
        if (match && match[1]) {
          const src = match[1];
          try {
            const rendered = katex.renderToString(src, { throwOnError: false, displayMode: false });
            n.innerHTML = rendered;
            n.setAttribute('data-latex', src);
          } catch (e) {
            // leave source if rendering failed
            n.innerText = txt;
          }
        }
      });
    } catch (err) {
      console.warn('katex render error', err);
    }
  };

  const insertCitation = () => {
    const citation = prompt('Enter citation details:', 'Author, Year');
    if (!citation) return;

    const index = citations.length + 1;
    document.execCommand('insertHTML', false, `
      <sup class="citation" data-index="${index}">[${index}]</sup>
    `);
    setCitations(prev => [...prev, citation]);
  };

  const insertFootnote = () => {
    const note = prompt('Enter footnote text:');
    if (!note) return;

    const index = footnotes.length + 1;
    document.execCommand('insertHTML', false, `
      <sup class="footnote-ref" data-index="${index}">[${index}]</sup>
    `);
    setFootnotes(prev => [...prev, note]);
  };

  const insertTable = () => {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    if (!rows || !cols) return;

    let html = '<table><thead><tr>';
    for (let i = 0; i < cols; i++) {
      html += '<th>Header ' + (i + 1) + '</th>';
    }
    html += '</tr></thead><tbody>';

    for (let i = 0; i < rows - 1; i++) {
      html += '<tr>';
      for (let j = 0; j < cols; j++) {
        html += '<td>Cell ' + (i + 1) + '-' + (j + 1) + '</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table>';

    document.execCommand('insertHTML', false, html);
  };

  const updateActiveTools = () => {
    setActiveTools({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      bullet: document.queryCommandState('insertUnorderedList'),
      number: document.queryCommandState('insertOrderedList'),
      highlight: (() => {
        try {
          const sel = window.getSelection();
          if (!sel || sel.rangeCount === 0) return false;
          let node = sel.anchorNode;
          while (node && node !== editorRef.current) {
            if (node.nodeType === 1 && node.tagName && node.tagName.toLowerCase() === 'mark') return true;
            node = node.parentNode;
          }
        } catch (e) { /* ignore */ }
        return false;
      })()
    });
  };

  // Toggle highlight (mark) around current selection
  const toggleHighlight = async () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const anchor = sel.anchorNode;
    // reuse getAncestorBlock but search for inline mark
    const markAncestor = getAncestorBlock(anchor, ['mark']);
    if (markAncestor) {
      // unwrap mark by replacing its contents (keeps the text editable)
      selectElement(markAncestor); // selects contents
      const inner = markAncestor.innerHTML;
      document.execCommand('insertHTML', false, inner);
      setTimeout(() => updateActiveTools(), 20);
      return;
    }

    // wrap selection in <mark>
    const selectedHtml = getSelectedHtml();
    if (!selectedHtml) return;
    const html = `<mark>${selectedHtml}</mark>`;
    document.execCommand('insertHTML', false, html);
    setTimeout(() => updateActiveTools(), 20);
  };

  // Helpers for block/list insertion
  const getSelectedHtml = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return '';
    const range = sel.getRangeAt(0);
    const frag = range.cloneContents();
    const div = document.createElement('div');
    div.appendChild(frag);
    return div.innerHTML;
  };

  const wrapSelectionInCodeBlock = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const selectedHtml = getSelectedHtml();
    const safe = selectedHtml || '\n';
    const html = `<pre><code>${safe}</code></pre>`;
    document.execCommand('insertHTML', false, html);
  };

  // Get nearest ancestor block element with one of the tag names
  const getAncestorBlock = (node, tagNames = []) => {
    let el = node;
    while (el && el !== editorRef.current) {
      if (el.nodeType === 1) {
        const tn = el.tagName.toLowerCase();
        if (tagNames.includes(tn)) return el;
      }
      el = el.parentNode;
    }
    return null;
  };

  // Find the nearest block-level element (p, div, li, blockquote, pre, h1..h6)
  const getNearestBlock = (node) => {
    const blockTags = ['p','div','li','blockquote','pre','h1','h2','h3','h4','h5','h6','section'];
    let el = node;
    while (el && el !== editorRef.current) {
      if (el.nodeType === 1) {
        const tn = el.tagName.toLowerCase();
        if (blockTags.includes(tn)) return el;
      }
      el = el.parentNode;
    }
    return null;
  };

  const selectElement = (el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const insertParagraphAfter = (node) => {
    try {
      const pHtml = '<p><br></p>';
      // place caret after node
      const range = document.createRange();
      range.setStartAfter(node);
      range.collapse(true);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand('insertHTML', false, pHtml);
      // move caret into the new paragraph
      const next = node.nextSibling;
      if (next) {
        const p = next.nodeType === 1 && next.tagName && next.tagName.toLowerCase() === 'p' ? next : next.querySelector && next.querySelector('p');
        if (p) {
          const r = document.createRange();
          r.selectNodeContents(p);
          r.collapse(true);
          sel.removeAllRanges();
          sel.addRange(r);
        }
      }
    } catch (err) {
      console.warn('insertParagraphAfter failed', err);
    }
  };

  const toggleBlock = async (tag) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const anchor = sel.anchorNode;

    // if the current block is already the target tag, unwrap it back to paragraph
    const existing = getAncestorBlock(anchor, [tag]);
    if (existing) {
      selectElement(existing);
      const inner = existing.innerHTML;
      document.execCommand('insertHTML', false, `<p>${inner}</p>`);
      setTimeout(() => updateActiveTools(), 20);
      return;
    }

    // Find the nearest block to replace (usually a <p>)
    const nearest = getNearestBlock(anchor);
    if (nearest) {
      const inner = nearest.innerHTML;
      // replace nearest block with the chosen heading/blockquote
      const newHtml = `<${tag}>${inner}</${tag}>`;
      // Replace node by selecting it and inserting newHtml
      selectElement(nearest);
      document.execCommand('insertHTML', false, newHtml);
      // After insertion, find the inserted node and add a paragraph after it
      setTimeout(() => {
        // attempt to locate the newly inserted block near the selection
        const sel2 = window.getSelection();
        if (!sel2 || sel2.rangeCount === 0) return;
        const node = sel2.anchorNode;
        const appliedAncestor = getAncestorBlock(node, [tag]);
        if (appliedAncestor) insertParagraphAfter(appliedAncestor);
        updateActiveTools();
      }, 20);
      return;
    }

    // fallback to formatBlock if no nearest block found
    document.execCommand('formatBlock', false, `<${tag}>`);
    setTimeout(() => {
      const sel2 = window.getSelection();
      if (!sel2 || sel2.rangeCount === 0) return;
      const node = sel2.anchorNode;
      const appliedAncestor = getAncestorBlock(node, [tag]);
      if (appliedAncestor) insertParagraphAfter(appliedAncestor);
    }, 20);
  };

  const toggleCodeBlock = async () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const anchor = sel.anchorNode;
    const preAncestor = getAncestorBlock(anchor, ['pre']);
    if (preAncestor) {
      // unwrap pre>code into paragraph
      selectElement(preAncestor);
      const inner = preAncestor.textContent || preAncestor.innerHTML || '';
      // preserve text but put into paragraph
      document.execCommand('insertHTML', false, `<p>${inner}</p>`);
      setTimeout(() => updateActiveTools(), 20);
      return;
    }

    // otherwise insert code block and ensure caret is after it
    const selectedHtml = getSelectedHtml();
    const safe = selectedHtml || '\n';
    const html = `<pre><code>${safe}</code></pre>`;
    document.execCommand('insertHTML', false, html);
    setTimeout(() => {
      const sel2 = window.getSelection();
      if (!sel2 || sel2.rangeCount === 0) return;
      const node = sel2.anchorNode;
      const appliedAncestor = getAncestorBlock(node, ['pre']);
      if (appliedAncestor) insertParagraphAfter(appliedAncestor);
    }, 20);
  };

  const insertChecklist = () => {
    const selectedText = window.getSelection && window.getSelection().toString();
    const text = selectedText || 'Task';
    const html = `<ul class="checklist"><li><label><input type=\"checkbox\" /> ${text}</label></li></ul>`;
    document.execCommand('insertHTML', false, html);
  };

  const handleAutosave = async () => {
    try {
      const bodyHtml = editorRef.current?.innerHTML || '';
      // Allow autosave of drafts even without a title
      if (!bodyHtml.trim()) return;

      const payload = {
        title,
        fontFamily,
        color,
        bodyHtml,
        latexSnippets,
        images,
        citations,
        footnotes,
        isDraft: true
      };

      if (journalId) {
        await updateJournal(journalId, payload);
      } else {
        const res = await createJournal(payload);
        if (res?.journal?._id) setJournalId(res.journal._id);
      }

      setLastSavedAt(new Date());
      setIsDirty(false);
      setTimeout(renderAllLatex, 50);
    } catch (err) {
      console.error('Autosave failed:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const bodyHtml = editorRef.current?.innerHTML || '';
      if (!title || !bodyHtml.trim()) {
        setMessage({ type: 'error', text: 'Title and content are required.' });
        return;
      }

      const payload = {
        title,
        fontFamily,
        color,
        bodyHtml,
        latexSnippets,
        images,
        citations,
        footnotes,
        isDraft: false
      };

      let res;
      if (journalId) {
        res = await updateJournal(journalId, payload);
      } else {
        res = await createJournal(payload);
      }
      setMessage({ type: 'success', text: 'Journal published successfully.' });
      navigate(`/journal/${res.journal._id}`);
    } catch (err) {
      console.error('Save failed:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save journal' });
    } finally {
      setSubmitting(false);
    }
  };

  // Quick helper to ensure editor has default paragraph
  function ensureEditorHasContent() {
    if (editorRef.current && editorRef.current.innerHTML.trim() === '') {
      editorRef.current.innerHTML = '<p><br/></p>';
    }
  }

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setIsDirty(true);
  };

  if (!user) {
    // Require login before allowing writing
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', padding: 20, textAlign: 'center' }}>
        <h2>Please sign in to write</h2>
        <p>Only authenticated users can create or edit journals. Please <a href="/login">sign in</a> to continue.</p>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <form onSubmit={handleSubmit}>
        {/* Header section */}
        <header className="editor-header">
          <div className="editor-title">
            <input
              type="text"
              placeholder="Enter title..."
              value={title}
              onChange={handleTitleChange}
              className="title-input"
            />
          </div>

          <div className="editor-metadata">
            <span className="autosave-status">
              {isDirty 
                ? "Draft" 
                : lastSavedAt 
                  ? `Last saved ${new Date(lastSavedAt).toLocaleTimeString()}`
                  : ""}
            </span>
          </div>
        </header>

        {/* Main toolbar */}
        <EditorToolbar 
          activeTools={activeTools}
          onAction={handleAction}
          fontFamily={fontFamily}
          onFontChange={setFontFamily}
          color={color}
          onColorChange={setColor}
        />

        {/* Floating toolbar */}
        {selection && !selection.isCollapsed && (
          <FloatingToolbar 
            selection={selection}
            activeTools={activeTools}
            onAction={handleAction}
          />
        )}

        {/* Editor area */}
        <div 
          ref={editorRef}
          className="editor-content"
          contentEditable
          onFocus={ensureEditorHasContent}
          style={{ fontFamily, color }}
          aria-label="Journal editor"
        />

        {/* Footer section */}
        <footer className="editor-footer">
          {/* Citations panel */}
          {citations.length > 0 && (
            <div className="citations-panel">
              <h3>Citations</h3>
              <ol>
                {citations.map((citation, index) => (
                  <li key={index}>{citation}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Footnotes panel */}
          {footnotes.length > 0 && (
            <div className="footnotes-panel">
              <h3>Footnotes</h3>
              <ol>
                {footnotes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Action buttons */}
          <div className="editor-actions">
            {message && (
              <div className={`message message-${message.type}`}>
                {message.text}
              </div>
            )}
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleAutosave}
              disabled={submitting || !isDirty}
            >
              Save Draft
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting || !title.trim() || !editorRef.current?.innerHTML.trim()}
            >
              {submitting ? 'Publishing...' : 'Publish Journal'}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}