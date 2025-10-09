import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const { register } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (!username || !password || !accessKey) {
      setError('Por favor completa nombre, contraseña y key');
      setLoading(false);
      return;
    }

    try {
      const newUser = register({ username, password, accessKey });
      // mark access granted so the App component will render the main Router
      sessionStorage.setItem('access_granted', '1');
      history.push('/profile');
    } catch (err) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto' }}>
  <input aria-label="nombre" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Nombre" />
  <input aria-label="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
  <input aria-label="key" type="text" value={accessKey} onChange={(e)=>setAccessKey(e.target.value)} placeholder="Key" />
      <button type="submit" disabled={loading}>{loading ? 'Registrando...' : 'Registrar'}</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default Register;