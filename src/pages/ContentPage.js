import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ContentList from '../components/ContentList';
import ContentForm from '../components/ContentForm';
import RenderBody from '../components/RenderBody';
import { loadThreads } from '../utils/data';

const ContentPage = ({ match }) => {
  const [threads, setThreads] = useState(loadThreads());
  const [activeThreadId, setActiveThreadId] = useState(threads[0]?.id);

  const location = useLocation();

  // reload threads whenever the location changes (covers back/forward after delete/create)
  useEffect(() => { setThreads(loadThreads()); }, [location.pathname]);

  // listen to global updates (create/edit/delete) and refresh
  useEffect(() => {
    const handler = () => {
      const fresh = loadThreads();
      setThreads(fresh);
      if (activeThreadId && !fresh.find(t => t.id === activeThreadId)) {
        setActiveThreadId(fresh[0]?.id || null);
      }
    };
    window.addEventListener('threadsUpdated', handler);
    return () => window.removeEventListener('threadsUpdated', handler);
  }, [activeThreadId]);

  useEffect(() => { setThreads(loadThreads()); }, []);

  // Ensure activeThreadId is valid; if the thread was deleted, pick the first available
  useEffect(() => {
    if (!activeThreadId && threads[0]) {
      setActiveThreadId(threads[0].id);
      return;
    }
    if (activeThreadId && !threads.find(t => t.id === activeThreadId)) {
      setActiveThreadId(threads[0]?.id || null);
    }
  }, [threads, activeThreadId]);

  const thread = threads.find(t => t.id === activeThreadId) || threads[0] || { title: 'Sin publicaciones', posts: [] };

  const handleCreate = () => {
    const fresh = loadThreads();
    setThreads(fresh);
  };

  // Helper to refresh and keep activeThreadId valid
  const refreshThreads = () => {
    const fresh = loadThreads();
    setThreads(fresh);
    if (activeThreadId && !fresh.find(t => t.id === activeThreadId)) {
      // if deleted, set to first thread or null
      setActiveThreadId(fresh[0]?.id || null);
    }
  };

  return (
    <main className="container">
      <h2 className="neon">Publicaciones</h2>
      <div className="content-layout" style={{ marginTop: '1rem' }}>
        <aside className="content-list">
          <ContentList onSelect={(id) => setActiveThreadId(id)} selectedId={activeThreadId} filter={''} />
        </aside>

        <section className="content-main">
          <div className="card post-card-large" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            {/* Title column (fixed width) */}
            <div style={{ width: 260, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h3 className="post-title" style={{ margin: 0 }}>{thread.title}</h3>
                {thread.headerImage ? (
                  <div className="post-header-image">
                    <img src={thread.headerImage} alt="encabezado" />
                  </div>
                ) : (
                  <div className="post-header-image">
                    <a href={`/post/${thread.id}`} className="img-tooltip" style={{ display: 'block', width: '100%', height: '100%' }}>
                      <div className="img-placeholder">
                        <svg width="40" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 7L3 12L8 17" stroke="#6fe9c0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 7L21 12L16 17" stroke="#6fe9c0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <span className="img-tooltiptext">Sin imagen</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Posts column (flexible) */}
            <div style={{ flex: 1 }}>
              {thread.posts.map(p => (
                <article key={p.id} className="card" style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.95rem', color: '#9bd6b1' }}>{p.author}</div>
                  <div className="post-body" style={{ marginTop: '0.5rem' }}>
                    <RenderBody text={p.body} />
                  </div>
                </article>
              ))}
            </div>

            {/* Comment column (fixed width) */}
            <aside style={{ width: 320, flexShrink: 0 }}>
              <h4>Comentar</h4>
              <ContentForm threadId={thread.id} onCreate={handleCreate} />
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ContentPage;