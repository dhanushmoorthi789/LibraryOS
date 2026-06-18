import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import '../style/Categories.css';

export default function Categories() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = async () => {
    setLoading(true);
    const data = await api.getCategories().catch(() => ({ results: [] }));
    setCats(data.results || data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm({ name: '', description: '' }); setModal('add'); };
  const openEdit = (c) => { setSelected(c); setForm({ name: c.name, description: c.description }); setModal('edit'); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.createCategory(form);
        showToast(
          <span>
            <i className="fa-solid fa-circle-plus"></i>
            {' '}Category added!
          </span>
        );
      } else {
        await api.updateCategory(selected.id, form);
        showToast(
          <span>
            <i className="fa-solid fa-pen-to-square"></i>
            {' '}Category updated!
          </span>
        );
      }
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
    setSaving(false);
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    await api.deleteCategory(c.id).catch(() => { });
    showToast(
      <span>
        <i className="fa-solid fa-trash"></i>
        {' '}Category deleted
      </span>
    );
    load();
  };

  const catIcons = ['📚', '🔬', '📖', '🌍', '💻', '👤', '🎨', '🏛️', '🎵', '🌿'];

//   const catIcons = [
//   'fa-book',
//   'fa-flask',
//   'fa-book-open',
//   'fa-earth-americas',
//   'fa-computer',
//   'fa-user',
//   'fa-palette',
//   'fa-landmark',
//   'fa-music',
//   'fa-leaf'
// ];

  return (
    <div className="cats-page">
      {toast && <div className="cats-toast">{toast}</div>}
      <div className="cats-header">
        <div>
          <h1 className="cats-title"><i className="fa-solid fa-tags"></i> Categories</h1>
          <p className="cats-sub">{cats.length} categories</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><i className="fa-solid fa-plus"></i> Add Category</button>
      </div>

      {loading ? <div className="cats-loading"><div className="spinner" /></div> : (
        <div className="cats-grid">
          {cats.map((c, i) => (
            <div key={c.id} className="cat-card">
              <div className="cat-icon">{catIcons[i % catIcons.length]}</div>
              {/* <div className="category-icon">
                <i className={`fa-solid ${catIcons[ i % catIcons.length]}`}></i>
              </div> */}
              <div className="cat-info">
                <div className="cat-name">{c.name}</div>
                {c.description && <div className="cat-desc">{c.description}</div>}
              </div>
              <div className="cat-actions">
                <button className="btn-edit" onClick={() => openEdit(c)}><i className="fa-solid fa-pen-to-square"></i> Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(c)}><i className="fa-solid fa-trash"></i> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Category' : 'Edit Category'} onClose={() => setModal(null)} size="sm">
          <form className="cat-form" onSubmit={handleSave}>
            <div className="form-field">
              <label>Category Name *</label>
              <input name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Description</label>
              <textarea name="description" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
