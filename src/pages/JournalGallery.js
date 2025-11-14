import React, { useEffect, useState } from 'react';
import { fetchJournals } from '../apiJournal';
import { Link } from 'react-router-dom';

export default function JournalGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchJournals({ limit: 50 });
        setItems(data.journals || []);
      } catch (err) {
        console.error('gallery fetch err', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '20px auto' }}>
      <h2>Gallery</h2>
      {loading ? <div>Loading...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {items.map(j => (
            <article key={j._id} style={{ background: '#fff', borderRadius: 10, padding: 12, boxShadow: '0 6px 18px rgba(2,6,23,0.04)' }}>
              <Link to={`/journal/${j._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ minHeight: 140, overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: (j.bodyHtml || '').slice(0, 400) + (j.bodyHtml && j.bodyHtml.length > 400 ? '...' : '') }} />
              </Link>
              <div style={{ marginTop: 12, borderTop: '1px solid rgba(2,6,23,0.04)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{j.title}</div>
                  <div style={{ color: '#6b7280', fontSize: 13 }}>{j.authorName || j.authorEmail}</div>
                </div>
                <div>
                  <Link to={`/journal/author/${j.authorSupabaseId}`} className="btn btn-secondary">More</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
