import React, { useEffect, useState } from 'react';
import { loadThreads } from '../utils/data';
import { Link } from 'react-router-dom';

const ContentList = ({ filter, onSelect, selectedId }) => {
  const [content, setContent] = useState(loadThreads());

  useEffect(() => {
    setContent(loadThreads());
  }, []);

  const list = filter ? content.filter(c => c.title.toLowerCase().includes(filter.toLowerCase())) : content;

  return (
    <div>
      {list.map(item => (
        <article key={item.id} className={`card ${selectedId === item.id ? 'selected' : ''}`} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.9rem' }}>
          {/* left thumbnail box (non-clickable) */}
          <div className="thumb" style={{ background: '#041111', border: '1px solid #08302a' }}>
            {item.headerImage ? <img src={item.headerImage} alt="thumb" /> : (
              <Link to={`/post/${item.id}`} style={{ display: 'block', width: '100%', height: '100%' }} className="img-tooltip">
                <div className="img-placeholder">
                  <svg width="28" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 7L3 12L8 17" stroke="#6fe9c0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 7L21 12L16 17" stroke="#6fe9c0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span className="img-tooltiptext">Sin imagen</span>
              </Link>
            )}
          </div>

          {/* right clickable area */}
          <div style={{ flex: 1 }}>
            <Link to={`/post/${item.id}`} style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}>
              <h3 className="neon" style={{ margin: 0 }}>{item.title}</h3>
              <div className="muted">{item.posts.length} comentarios</div>
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
};

export default ContentList;