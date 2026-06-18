import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import Navbar from './components/Navbar';
import Books from './pages/Books';
import Borrows from './pages/Borrows';
import Users from './pages/Users';
import Categories from './pages/Categories';
import FineSettings from './pages/FineSettings';
import './App.css';

function AppInner() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('books');

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-inner">
          <span className="app-loading-logo"><i className="fas fa-book"></i></span>
          <div className="app-loading-spinner" />
          <p>Loading LibraryOS…</p>
        </div>
      </div>
    );
  }

  if (!user ) return <Auth />;

  const renderPage = () => {
    switch (page) {
      case 'books':        return <Books />;
      case 'my-borrows':  return <Borrows all={false} />;
      case 'all-borrows': return <Borrows all={true} />;
      case 'users':       return <Users />;
      case 'categories':  return <Categories />;
      case 'fines':       return <FineSettings />;
      default:            return <Books />;
    }
  };

  return (
    <div className="app-root">
      <Navbar currentPage={page} setPage={setPage} />
      <main className="app-main">
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
