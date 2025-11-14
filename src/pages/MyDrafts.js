import React, { useEffect, useState } from 'react';
import { fetchJournals } from '../apiJournal';
import { Link } from 'react-router-dom';
import useAuth from '../lib/useAuth';

export default function MyDrafts() {
  const user = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await fetchJournals({ mine: true, limit: 100 });
        // filter drafts
        const mine = data.journals || [];
        setDrafts(mine.filter(j => j.isDraft));
      } catch (err) {
        console.error('fetch drafts err', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!user) return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 20, textAlign: 'center' }}>
      <h3>Please sign in to view your drafts</h3>
      <Link to="/login" className="btn btn-primary">Sign in</Link>
    </div>
  );

  return (
    <div style={{ maxWidth: 980, margin: '20px auto' }}>
      <h2>Your Drafts</h2>
      {loading ? <div>Loading...</div> : (
        <div style={{ display: 'grid', gap: 12 }}>
          {drafts.map(j => (
            <div key={j._id} style={{ padding:12, borderRadius:10, border:'1px solid rgba(2,6,23,0.04)', background:'#fff' }}>
              <Link to={`/journal/edit/${j._id}`} style={{ fontSize:18, fontWeight:700, color:'#0b3b8a' }}>{j.title || '(Untitled draft)'}</Link>
              <div style={{ color:'#6b7280', marginTop:6 }}>{j.authorName || j.authorEmail} • {new Date(j.createdAt).toLocaleString()}</div>
              <div style={{ marginTop:8, color:'#334155' }} dangerouslySetInnerHTML={{ __html: (j.bodyHtml || '').slice(0, 300) + (j.bodyHtml && j.bodyHtml.length > 300 ? '...' : '') }} />
            </div>
          ))}
          {drafts.length === 0 && <div>No drafts yet.</div>}
        </div>
      )}
    </div>
  );
}
