import React, { useEffect, useState } from 'react';
import { fetchJournals } from '../apiJournal';
import { useParams, Link } from 'react-router-dom';

export default function AuthorWorks() {
  const { authorId } = useParams();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchJournals({ limit: 100, authorId });
        setWorks(data.journals || []);
      } catch (err) {
        console.error('author works fetch err', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [authorId]);

  return (
    <div style={{ maxWidth: 980, margin: '20px auto' }} className="page-fade">
      <h2>Author's works</h2>
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
        <div style={{ display: 'grid', gap: 12 }}>
          {works.map(j => (
            <div key={j._id} className="content-wrap" style={{ padding:12, borderRadius:10 }}>
              <Link to={`/journal/${j._id}`} className="text-accent" style={{ fontSize:18, fontWeight:700 }}>{j.title}</Link>
              <div className="text-muted" style={{ marginTop:6 }}>{j.authorName || j.authorEmail} • {new Date(j.createdAt).toLocaleString()}</div>
              <div style={{ marginTop:8 }} className="text-primary" dangerouslySetInnerHTML={{ __html: (j.bodyHtml || '').slice(0, 300) + (j.bodyHtml && j.bodyHtml.length > 300 ? '...' : '') }} />
            </div>
          ))}
          {works.length === 0 && <div>No public works by this author.</div>}
        </div>
      )}
    </div>
  );
}
