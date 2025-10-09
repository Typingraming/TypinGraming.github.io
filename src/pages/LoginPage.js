import React from 'react';
import Login from '../components/Login';

const LoginPage = () => {
  return (
    <main className="container">
      <h1 className="neon">Iniciar Sesión</h1>
      <div className="card">
        <Login />
      </div>
    </main>
  );
};

export default LoginPage;