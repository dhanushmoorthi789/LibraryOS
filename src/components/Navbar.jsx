import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../style/Navbar.css';

export default function Navbar({ currentPage, setPage }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { key: 'books', label: 'Books', icon: 'fa-book', roles: ['admin', 'staff', 'user'] },
    { key: 'my-borrows', label: 'My Borrows', icon: 'fa-book-open', roles: ['user', 'staff'] },
    { key: 'all-borrows', label: 'All Borrows', icon: 'fa-rotate', roles: ['admin', 'staff'] },
    { key: 'users', label: 'Users', icon: 'fa-users', roles: ['admin'] },
    { key: 'categories', label: 'Categories', icon: 'fa-tags', roles: ['admin', 'staff'] },
    { key: 'fines', label: 'Fine Settings', icon: 'fa-money-bill', roles: ['admin'] },
  ].filter(item => item.roles.includes(user?.role));

  const roleBadge = { admin: '#ef4444', staff: '#f59e0b', user: '#22c55e' };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="nav-logo">
          <i className="fa-solid fa-book-atlas"></i>
        </span>
        <span className="nav-name">LibraryOS</span>
      </div>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        {navItems.map(item => (
          <button
            key={item.key}
            className={`nav-link ${currentPage === item.key ? 'active' : ''}`}
            onClick={() => { setPage(item.key); setMenuOpen(false); }}
          >
            <>
              <i className={`fa-solid ${item.icon}`}></i>
              <span>{item.label}</span>
            </>
          </button>
        ))}
      </div>

      <div className="nav-user">
        <div className="nav-avatar">
          <div className="nav-avatar-circle" style={{ background: roleBadge[user?.role] }}>
            {user?.first_name?.[0] || user?.username?.[0] || '?'}
          </div>
          <div className="nav-user-info">
            <span className="nav-username">{user?.first_name || user?.username}</span>
            <span className="nav-role" style={{ color: roleBadge[user?.role] }}>{user?.role}</span>
          </div>
        </div>
        <button className="nav-logout" onClick={logout} title="Logout">
          <i className="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>

      <button className="nav-burger" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? '✕' : '☰'}
      </button>
    </nav>
  );
}
