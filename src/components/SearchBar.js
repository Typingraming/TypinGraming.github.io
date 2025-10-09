import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleChange = (e) => setQuery(e.target.value);
  const handleSubmit = (e) => { e.preventDefault(); onSearch(query); };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', maxWidth: 600 }}>
      <input aria-label="buscar" type="text" value={query} onChange={handleChange} placeholder="Buscar ejercicios por título..." />
      <button type="submit">Buscar</button>
    </form>
  );
};

export default SearchBar;