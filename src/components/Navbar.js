import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const history = useHistory();

  const handleLogout = () => { logout(); history.push('/'); };

  return (
    <nav style={{ background: '#061214', color: 'white', padding: '0.6rem 1rem' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link to="/" style={{ color: '#8fffc1', fontWeight: 700, fontSize: '1.05rem' }}>
            <span style={{ fontWeight: 700 }}>TypinGramingPage</span>
            <span style={{ marginLeft: 6 }}>&lt;/&gt;</span>
          </Link>
        </div>

        <div>
          <Link to="/" style={{ color: '#8fffc1', marginRight: '1rem' }}>Publicaciones</Link>
          {!currentUser ? (
            <>
              <Link to="/login" style={{ color: '#c7f9cc', marginRight: '0.75rem' }}>Entrar</Link>
              <Link to="/register" style={{ color: '#c7f9cc' }}>Registro</Link>
            </>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/profile" style={{ color: '#9fffd7' }}>{currentUser.displayName || currentUser.username}</Link>
              <button onClick={handleLogout} style={{ marginLeft: '0.5rem' }}>Salir</button>
            </span>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;