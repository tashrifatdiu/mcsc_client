// client/src/pages/JournalDetail.js
import React, { useEffect, useState } from 'react';
import { fetchJournalById } from '../apiJournal';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useAuth from '../lib/useAuth';
import { deleteJournal } from '../apiJournal';

export default function JournalDetail() {
  const { id } = useParams();
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchJournalById(id);
        setJournal(data.journal);
      } catch (err) {
        console.error('fetch journal detail err', err);
      } finally {
        setLoading(false);
      }
    })();
    // scroll to top smoothly on mount
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) return <div style={{ maxWidth: 900, margin: '20px auto' }} className="page-fade"><div style={{ textAlign:'center' }}><div className="spinner"/></div></div>;
  if (!journal) return <div style={{ maxWidth: 900, margin: '20px auto' }} className="page-fade">Not found</div>;

  return (
  <div style={{ maxWidth: 900, margin: '20px auto', padding: 16 }} className="page-fade content-wrap">
      <div style={{ marginBottom: 8 }}>
        {journal.headerSize === 'h1' ? <h1 style={{ margin: 0, color: journal.color }}>{journal.title}</h1> : journal.headerSize === 'h2' ? <h2 style={{ margin: 0, color: journal.color }}>{journal.title}</h2> : <h3 style={{ margin: 0, color: journal.color }}>{journal.title}</h3>}
        <div className="text-muted" style={{ marginTop: 6 }}>
          <Link to={`/journal/author/${journal.authorSupabaseId || journal.authorId || journal.author}`} className="text-muted">{journal.authorName || journal.authorEmail}</Link>
          {' '}• {new Date(journal.createdAt).toLocaleString()}
        </div>
        <div style={{ marginTop: 8 }}>
          {user && user.id === journal.authorSupabaseId && (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to={`/journal/edit/${journal._id}`} className="btn btn-secondary">Edit</Link>
              <button className="btn btn-secondary" onClick={async () => {
                if (!confirm('Delete this journal? This action cannot be undone.')) return;
                try {
                  await deleteJournal(journal._id);
                  navigate('/journal');
                } catch (err) {
                  console.error('delete failed', err);
                  alert('Delete failed: ' + (err.message || 'server error'));
                }
              }}>Delete</button>
            </div>
          )}
        </div>
      </div>
      
  <div style={{ fontFamily: journal.fontFamily }} className="text-primary" dangerouslySetInnerHTML={{ __html: journal.bodyHtml }} />

      {journal.latexSnippets && journal.latexSnippets.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <h4>LaTeX snippets used</h4>
          <ul>
            {journal.latexSnippets.map((s, i) => <li key={i}><code>{String(s)}</code></li>)}
          </ul>
        </div>
      )}
    </div>
  );
}