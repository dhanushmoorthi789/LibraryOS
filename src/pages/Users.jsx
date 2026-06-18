import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import '../style/Users.css';
export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ role: 'user', is_active: true });
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data.results || data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openEdit = (u) => {
    setSelected(u);
    setForm({ role: u.role, phone: u.phone, first_name: u.first_name, last_name: u.last_name });
    setModal('edit');
  };

const handleSave = async (e) => {
  e.preventDefault();
  try {
    await api.updateUser(selected.id, form);
    showToast(
      <span>
        <i className="fa-solid fa-user-pen"></i>
        {' '}User updated!
      </span>
    );
    setModal(null);
    load();
  } catch (err) {
    showToast(
      <span>
        <i className="fa-solid fa-circle-exclamation"></i>
        {' '}Error: {err.message}
      </span>
    );
  }
};

const handleDelete = async (u) => {
  if (!window.confirm(`Remove user "${u.username}"?`)) return;
  try {
    await api.deleteUser(u.id);
    showToast(
      <span>
        <i className="fa-solid fa-user-xmark"></i>
        {' '}User removed
      </span>
    );
    load();
  } catch (err) {
    showToast(
      <span>
        <i className="fa-solid fa-circle-exclamation"></i>
        {' '}Error: {err.message}
      </span>
    );
  }
};

  const roleColors = { admin: '#ef4444', staff: '#f59e0b', user: '#22c55e' };
  const fld = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="users-page">
      {toast && <div className="users-toast">{toast}</div>}
      <div className="users-header">
        <div>
          <h1 className="users-title"><i className="fas fa-users"></i> User Management</h1>
          <p className="users-sub">{users.length} registered members</p>
        </div>
      </div>

      {loading ? (
        <div className="users-loading"><div className="spinner" /></div>
      ) : (
        <div className="users-grid">
          {users.map(u => (
            <div key={u.id} className="user-card">
              <div className="user-avatar" style={{ background: roleColors[u.role] }}>
                {u.first_name?.[0] || u.username?.[0] || '?'}
              </div>
              <div className="user-info">
                <div className="user-name">{u.first_name} {u.last_name} <span className="user-username">@{u.username}</span></div>
                <div className="user-email">{u.email}</div>
                {u.phone && <div className="user-phone"><i className="fas fa-phone"></i> {u.phone}</div>}
                <div className="user-meta">
                  <span className="user-role-badge" style={{ background: `${roleColors[u.role]}22`, color: roleColors[u.role] }}>{u.role}</span>
                  <span className="user-joined">Joined {new Date(u.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="user-actions">
                <button className="btn-edit" onClick={() => openEdit(u)}> <i className="fas fa-edit"></i> Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(u)}> <i className="fas fa-trash"></i> Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal === 'edit' && selected && (
        <Modal title={`Edit User: @${selected.username}`} onClose={() => setModal(null)}>
          <form className="user-form" onSubmit={handleSave}>
            <div className="form-grid">
              <div className="form-field">
                <label>First Name</label>
                <input name="first_name" value={form.first_name || ''} onChange={fld} />
              </div>
              <div className="form-field">
                <label>Last Name</label>
                <input name="last_name" value={form.last_name || ''} onChange={fld} />
              </div>
              <div className="form-field">
                <label>Phone</label>
                <input name="phone" value={form.phone || ''} onChange={fld} />
              </div>
              <div className="form-field">
                <label>Role</label>
                <select name="role" value={form.role} onChange={fld}>
                  <option value="user">User</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setModal(null)}> <i className="fas fa-times"></i> Cancel</button>
              <button type="submit" className="btn-primary"> <i className="fas fa-save"></i> Save Changes</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
