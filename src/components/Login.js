import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      login({ username, password });
      // mark access granted so the App component will render the main Router
      sessionStorage.setItem('access_granted', '1');
  history.push('/');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto' }}>
      <input aria-label="usuario" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuario" />
      <input aria-label="contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" />
      <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default Login;