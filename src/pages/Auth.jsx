import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../style/Auth.css';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '', first_name: '', last_name: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login({ username: form.username, password: form.password });
      } else {
        await register(form);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-bg">
        <div className="auth-orb auth-orb1" />
        <div className="auth-orb auth-orb2" />
        <div className="auth-orb auth-orb3" />
      </div>

      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">
            <i className="fa-solid fa-book-atlas"></i>
          </span>
          <h1 className="auth-title">LibraryOS</h1>
          <p className="auth-sub">Knowledge at your fingertips</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); }}>Sign In</button>
          <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => { setMode('register'); setError(''); }}>Register</button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === 'register' && (
            <div className="auth-row">
              <div className="auth-field">
                <label>First Name</label>
                <input name="first_name" value={form.first_name} onChange={handle} placeholder="First Name" required />
              </div>
              <div className="auth-field">
                <label>Last Name</label>
                <input name="last_name" value={form.last_name} onChange={handle} placeholder="Last Name" />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label>Username</label>
            <input name="username" value={form.username} onChange={handle} placeholder="Enter username" required />
          </div>

          {mode === 'register' && (
            <>
              <div className="auth-field">
                <label>Email</label>
                <input name="email" type="email" value={form.email} onChange={handle} placeholder="your@email.com" required />
              </div>
              <div className="auth-field">
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={handle} placeholder="+91 98765 43210" />
              </div>
            </>
          )}

          <div className="auth-field">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" required />
          </div>

          {error && <div className="auth-error">⚠ {error}</div>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-hint">
          <p>Demo accounts:</p>
          <div className="auth-demos">
            <span onClick={() => setForm({ ...form, username: 'admin', password: 'admin123' })}>Admin</span>
            <span onClick={() => setForm({ ...form, username: 'staff1', password: 'staff123' })}>Staff</span>
            <span onClick={() => setForm({ ...form, username: 'user1', password: 'user123' })}>User</span>
          </div>
        </div>
      </div>
    </div>
  );
}
