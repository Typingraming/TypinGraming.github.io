import React from 'react';
import Register from '../components/Register';

const RegisterPage = () => {
  return (
    <main style={{ padding: '1rem' }}>
      <h1>Crear cuenta</h1>
      <p>Regístrate para guardar tus progresos y acceder a más ejercicios.</p>
      <Register />
    </main>
  );
};

export default RegisterPage;