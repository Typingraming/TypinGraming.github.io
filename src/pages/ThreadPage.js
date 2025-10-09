import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { loadThreads } from '../utils/data';
import ContentForm from '../components/ContentForm';

const ThreadPage = () => {
  const { id } = useParams();
  const threadId = Number(id);
  const [thread, setThread] = useState(null);

  useEffect(() => {
    const threads = loadThreads();
    const t = threads.find(x => x.id === threadId);
    setThread(t);
  }, [threadId]);

  if (!thread) return <div className="container"><h2>Hilo no encontrado</h2></div>;

  return (
    <main className="container">
      <h2 className="neon">{thread.title}</h2>
      <div>
        {thread.posts.map(p => (
          <article key={p.id} className="card">
            <div className="muted">{p.author}</div>
            <p>{p.body}</p>
          </article>
        ))}
      </div>

      <h3>Responder</h3>
      <ContentForm threadId={thread.id} onCreate={() => {
        const threads = loadThreads();
        setThread(threads.find(x => x.id === threadId));
      }} />
    </main>
  );
};

export default ThreadPage;
