// client/src/pages/JournalList.js
import React, { useEffect, useState } from 'react';
import { fetchJournals } from '../apiJournal';
import { Link } from 'react-router-dom';
import useAuth from '../lib/useAuth';

export default function JournalList() {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchJournals({ limit: 50 });
        setJournals(data.journals || []);
      } catch (err) {
        console.error('fetch journals err', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
  <div style={{ maxWidth: 980, margin: '20px auto' }} className="page-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Journal Entries</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/journal/gallery" className="btn btn-secondary">Gallery</Link>
          {user ? (
            <>
              <Link to="/journal/new" className="btn btn-primary">New Journal</Link>
              <Link to="/journal/drafts" className="btn btn-secondary">My Drafts</Link>
            </>
          ) : (
            <Link to="/login" className="btn btn-ghost">Login to create</Link>
          )}
        </div>
      </div>
      {loading ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {[1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ padding:12, borderRadius:10 }}>
              <div className="skeleton-line" style={{ width: '50%' }} />
              <div className="skeleton-line" style={{ width: '30%', marginTop:6 }} />
              <div className="skeleton-block" />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display:'grid', gap:12 }}>
          {journals.map(j => (
            <div key={j._id} className="content-wrap" style={{ padding:12, borderRadius:10 }}>
              <Link to={`/journal/${j._id}`} className="text-accent" style={{ fontSize:18, fontWeight:700 }}>{j.title}</Link>
              <div className="text-muted" style={{ marginTop:6 }}>
                <Link to={`/journal/author/${j.authorSupabaseId || j.authorId || j.author}`} className="text-muted">{j.authorName || j.authorEmail}</Link>
                {' '}• {new Date(j.createdAt).toLocaleString()}
              </div>
              <div style={{ marginTop:8 }} className="text-primary" dangerouslySetInnerHTML={{ __html: (j.bodyHtml || '').slice(0, 300) + (j.bodyHtml && j.bodyHtml.length > 300 ? '...' : '') }} />
            </div>
          ))}
          {journals.length === 0 && <div>No journal entries yet.</div>}
        </div>
      )}
    </div>
  );
}