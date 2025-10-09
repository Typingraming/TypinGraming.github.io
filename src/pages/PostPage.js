import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { loadThreads, updateThread, deleteThread } from '../utils/data';
import ContentForm from '../components/ContentForm';
import RenderBody from '../components/RenderBody';
import { useAuth } from '../contexts/AuthContext';

const PostPage = () => {
  const { id } = useParams();
  const postId = Number(id);
  const [post, setPost] = useState(null);
  const [editing, setEditing] = useState(false);
  const [titleEdit, setTitleEdit] = useState('');
  const [bodyEdit, setBodyEdit] = useState('');
  const [themeColor, setThemeColor] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [newCollab, setNewCollab] = useState('');
  const history = useHistory();
  const { currentUser, banUser, unbanUser, users } = useAuth();

  useEffect(() => {
    const threads = loadThreads();
    const t = threads.find(x => x.id === postId);
    setPost(t);
  }, [postId]);

  if (!post) return <div className="container"><h2>Publicación no encontrada</h2></div>;

  const main = post.posts[0];

  const isAuthor = currentUser && (currentUser.displayName === main?.author || currentUser.username === main?.author);
  const isCollaborator = currentUser && post?.collaborators && post.collaborators.includes(currentUser.id);

  const beginEdit = () => {
    setEditing(true);
    setTitleEdit(post.title || '');
    setBodyEdit(main?.body || '');
    setThemeColor(post.themeColor || null);
    setCollaborators(post.collaborators || []);
  };

  const saveEdit = () => {
    // update title and main post body
    const updatedMain = { ...main, body: bodyEdit };
    const updatedPost = updateThread(post.id, { title: titleEdit, posts: [updatedMain, ...post.posts.slice(1)], themeColor: themeColor || null, collaborators, tags: post.tags || [] });
    setPost(updatedPost);
    setEditing(false);
    // notify other views that threads changed
    try { window.dispatchEvent(new CustomEvent('threadsUpdated')); } catch (e) {}
  };

  const addCollaborator = () => {
    const name = (newCollab || '').trim();
    if (!name) return;
    const target = users.find(u => u.username === name || u.displayName === name);
    if (!target) { alert('Usuario no encontrado'); return; }
    if (collaborators.find(c => c === target.id)) { alert('Usuario ya es colaborador'); return; }
    if (collaborators.length >= 5) { alert('Límite de 5 colaboradores alcanzado'); return; }
    setCollaborators(prev => [...prev, target.id]);
    setNewCollab('');
  };

  const removeCollaborator = (id) => {
    setCollaborators(prev => prev.filter(c => c !== id));
  };

  const handleDelete = () => {
    if (!confirm('¿Eliminar esta publicación? Esta acción no se puede deshacer.')) return;
    deleteThread(post.id);
    try { window.dispatchEvent(new CustomEvent('threadsUpdated')); } catch (e) {}
  history.push('/');
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      alert('Enlace copiado al portapapeles');
    } catch (e) {
      prompt('Copia este enlace:', window.location.href);
    }
  };

  return (
    <main className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          <h2 className="neon" style={{ margin: 0 }}>{post.title}</h2>
          {post.headerImage ? (
            <div className="post-header-image">
              <img src={post.headerImage} alt="encabezado" />
            </div>
          ) : (
            <div className="post-header-image">
              <a href={`/post/${post.id}`} className="img-tooltip" style={{ display: 'block', width: '100%', height: '100%' }}>
                <div className="img-placeholder">
                  <svg width="40" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 7L3 12L8 17" stroke="#6fe9c0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 7L21 12L16 17" stroke="#6fe9c0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span className="img-tooltiptext">Sin imagen</span>
              </a>
            </div>
          )}
        </div>
        <div>
          {(isAuthor || isCollaborator) && !editing && (
            <>
              <button onClick={beginEdit} style={{ marginRight: '0.5rem' }}>Editar</button>
              {isAuthor && <button onClick={handleDelete} style={{ marginRight: '0.5rem' }}>Eliminar</button>}
            </>
          )}
          <button onClick={handleShare}>Compartir</button>
        </div>
      </div>

      {/* collaborators display */}
      {!editing && post.collaborators && post.collaborators.length > 0 && (
        <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
          <strong>Colaboradores: </strong>
          {post.collaborators.map(id => {
            const u = users.find(x => x.id === id);
            return <span key={id} style={{ marginLeft: '0.5rem', color: '#9bd6b1' }}>{u ? (u.displayName || u.username) : id}</span>;
          })}
        </div>
      )}

      <div className="card" style={{ background: post.themeColor || 'inherit' }}>
        <div className="muted">{main?.author}</div>
        {!editing ? (
          <RenderBody text={main?.body} className="post-body" />
        ) : (
          <div>
            <input value={titleEdit} onChange={(e) => setTitleEdit(e.target.value)} />
            <textarea value={bodyEdit} onChange={(e) => setBodyEdit(e.target.value)} rows={6} />
            <div style={{ marginTop: '0.5rem' }}>
              <label>Color de tema: </label>
              <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} />
            </div>

            {isAuthor && (
              <div style={{ marginTop: '0.5rem' }}>
                <h4>Colaboradores (máx 5)</h4>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input placeholder="username" value={newCollab} onChange={(e)=>setNewCollab(e.target.value)} />
                  <button onClick={addCollaborator}>Añadir</button>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  {collaborators.map(collabId => {
                    const u = users.find(x => x.id === collabId);
                    return (
                      <div key={collabId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span className="muted">{u ? (u.displayName || u.username) : collabId}</span>
                        <span style={{ fontSize: '0.85rem', color: '#9bd6b1' }}>{u ? u.keyRole : ''}</span>
                        <button onClick={() => removeCollaborator(collabId)}>Quitar</button>
                        {u && (
                          <button onClick={() => {
                            if (u.banned) { unbanUser(u.id); alert('Usuario desbaneado'); }
                            else { banUser(u.id); alert('Usuario baneado'); }
                          }}>{u.banned ? 'Desbanear' : 'Banear'}</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ marginTop: '0.5rem' }}>
              <button onClick={saveEdit} style={{ marginRight: '0.5rem' }}>Guardar</button>
              <button onClick={() => setEditing(false)}>Cancelar</button>
            </div>
          </div>
        )}
      </div>

      <h3>Comentarios</h3>
      <div>
        {post.posts.slice(1).map(c => (
          <article key={c.id} className="card">
            <div className="muted">{c.author}</div>
            <div style={{ marginTop: '0.5rem' }}>
              <RenderBody text={c.body} />
            </div>
          </article>
        ))}
      </div>

      <h4>Comentar</h4>
      <ContentForm threadId={post.id} onCreate={() => {
        const threads = loadThreads();
        setPost(threads.find(x => x.id === postId));
      }} />
    </main>
  );
};

export default PostPage;
