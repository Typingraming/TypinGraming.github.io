import React, { useState } from 'react';
import { createThread, addPost, loadThreads, updateThread } from '../utils/data';
import { useAuth } from '../contexts/AuthContext';

const ContentForm = ({ threadId, onCreate }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [headerImage, setHeaderImage] = useState(null);
  const [imageProcessing, setImageProcessing] = useState(false);
  const { currentUser } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Debes iniciar sesión para publicar o comentar.');
      return;
    }
    if (currentUser.banned) {
      alert('Tu cuenta está baneada y no puedes publicar ni comentar.');
      return;
    }

    if (threadId) {
      const comment = { author: currentUser?.displayName || currentUser?.username || 'anon', body };
      addPost(threadId, comment);
      if (onCreate) onCreate({ type: 'comment', threadId, comment });
    } else {
      const post = createThread({ title, headerImage, posts: [{ author: currentUser?.displayName || currentUser?.username || 'anon', body }] });
      // Verify persistence: reload and check the stored thread includes headerImage
      const stored = loadThreads().find(t => t.id === post.id);
      if (!stored) {
        console.warn('Thread not found after create (unexpected)');
      } else if (!stored.headerImage && headerImage) {
        // Retry saving headerImage in case it was lost
        console.warn('headerImage missing after create — retrying updateThread');
        updateThread(post.id, { headerImage });
      }
      if (onCreate) onCreate({ type: 'post', post });
      try { window.dispatchEvent(new CustomEvent('threadsUpdated')); } catch (e) {}
    }

    setTitle(''); setBody(''); setHeaderImage(null);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '0.5rem', maxWidth: threadId ? '100%' : 800 }}>
      {!threadId && <input placeholder="Título de la publicación" value={title} onChange={(e)=>setTitle(e.target.value)} style={{ fontSize: '1.05rem', padding: '0.75rem' }} />}
      {!threadId && (
        <div style={{ marginTop: '0.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>Imagen (encabezado, pequeña):</label>
          <input type="file" accept="image/*" onChange={async (e) => {
            const f = e.target.files && e.target.files[0];
            if (!f) return setHeaderImage(null);
            setImageProcessing(true);
            // quick client-side validation
            const MAX_BYTES = 1.6 * 1024 * 1024; // 1.6MB soft limit
            const maxWidth = 1200;

            const toDataUrl = (file) => new Promise((res, rej) => {
              const reader = new FileReader();
              reader.onload = () => res(reader.result);
              reader.onerror = rej;
              reader.readAsDataURL(file);
            });

            // If file is small enough, just load; otherwise downscale via canvas
            if (f.size <= MAX_BYTES) {
              const data = await toDataUrl(f);
              setHeaderImage(data);
              setImageProcessing(false);
              return;
            }

            // load image and draw to canvas to downscale
            const imgData = await toDataUrl(f);
            const img = await new Promise((res, rej) => {
              const i = new Image();
              i.onload = () => res(i);
              i.onerror = rej;
              i.src = imgData;
            });

            const ratio = Math.min(1, maxWidth / img.width);
            const w = Math.round(img.width * ratio);
            const h = Math.round(img.height * ratio);
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.8);
            setHeaderImage(compressed);
            setImageProcessing(false);
          }} />
          {/* preview */}
          {headerImage && (
            <div style={{ marginTop: 8 }}>
              <div style={{ width: 160, height: 112, overflow: 'hidden', borderRadius: 6, border: '1px solid #08302a' }}>
                <img src={headerImage} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            </div>
          )}
        </div>
      )}
  <textarea placeholder={threadId ? 'Escribe un comentario...' : 'Contenido de la nueva publicación...'} value={body} onChange={(e)=>setBody(e.target.value)} rows={threadId ? 4 : 10} style={{ minHeight: threadId ? 100 : 220, fontSize: '1rem', padding: '0.75rem' }} />
  <button type="submit" disabled={imageProcessing}>{imageProcessing ? 'Procesando imagen...' : 'Enviar'}</button>
    </form>
  );
};

export default ContentForm;