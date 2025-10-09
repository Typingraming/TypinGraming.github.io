import React from 'react';
import { useHistory } from 'react-router-dom';
import ContentForm from '../components/ContentForm';

const NewPostPage = () => {
  const history = useHistory();

  const handleCreate = ({ type, post }) => {
    // after creating a post, navigate to content list or the new post page
    if (type === 'post' && post && post.id) {
      history.push(`/post/${post.id}`);
    } else {
      history.push('/');
    }
  };

  return (
    <main className="container">
      <h2 className="neon">Nueva publicación</h2>
      <div className="card">
        <ContentForm onCreate={handleCreate} />
      </div>
    </main>
  );
};

export default NewPostPage;
