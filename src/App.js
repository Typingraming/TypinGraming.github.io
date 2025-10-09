import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ContentPage from './pages/ContentPage';
import Profile from './pages/Profile';
import PostPage from './pages/PostPage';
import NewPostPage from './pages/NewPostPage';
import { AuthProvider } from './contexts/AuthContext';
import AccessGate from './components/AccessGate';

function App() {
  const [accessOk, setAccessOk] = React.useState(() => !!sessionStorage.getItem('access_granted'));

  return (
    <AuthProvider>
      {!accessOk ? (
        <AccessGate onPassed={() => setAccessOk(true)} />
      ) : (
        <Router>
          <Navbar />
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/login" component={LoginPage} />
            <Route path="/register" component={RegisterPage} />
            {/* legacy /content route removed — content is shown on the home page */}
            <Route path="/post/new" component={NewPostPage} />
            <Route path="/profile" component={Profile} />
            <Route path="/post/:id" component={PostPage} />
          </Switch>
        </Router>
      )}
    </AuthProvider>
  );
}

export default App;