import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ContentList from '../components/ContentList';
import SearchBar from '../components/SearchBar';

const Home = () => {
  const [query, setQuery] = useState('');

  return (
    <main className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="neon">/dev/terminal-forum</h1>
        </div>
        <div>
          <Link to="/post/new"><button>Nueva publicación</button></Link>
        </div>
      </header>

      <section style={{ marginTop: '1rem' }}>
        <SearchBar onSearch={(q)=>setQuery(q)} />
      </section>

      <section style={{ marginTop: '1rem' }}>
        <ContentList filter={query} />
      </section>
    </main>
  );
};

export default Home;