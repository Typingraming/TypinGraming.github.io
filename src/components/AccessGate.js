import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AccessGate = ({ onPassed }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { users, register, login } = useAuth();

  const handle = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const exists = users && users.find(u => u.username === username);
      if (exists) {
        // Existing user: perform normal login (do not force a key here)
        login({ username, password });
      } else {
        // New user: register using the provided access key
        if (!key) throw new Error('Para crear cuenta se requiere una key válida');
        register({ username, password, accessKey: key });
      }

  // grant access and continue
  sessionStorage.setItem('access_granted', '1');
  if (onPassed) onPassed();
  // Avoid using Router hooks from components mounted outside a Router.
  // Use a hard navigation which works reliably regardless of mount order.
  window.location.assign('/');
    } catch (err) {
      setError(err.message || 'Error en acceso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 className="neon">/dev/terminal-forum — Access Gate</h1>
      <p>Introduce usuario, contraseña y (si eres nuevo) la clave privada</p>
      <form onSubmit={handle} style={{ maxWidth: 420, margin: '0 auto' }}>
        <input aria-label="usuario" value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Usuario" />
        <input aria-label="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Contraseña" />
        <input aria-label="key" value={key} onChange={(e)=>setKey(e.target.value)} placeholder="Key (solo necesaria para registro)" />
        <button type="submit" disabled={loading}>{loading ? 'Procesando...' : 'Entrar'}</button>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </form>
    </main>
  );
};

export default AccessGate;
