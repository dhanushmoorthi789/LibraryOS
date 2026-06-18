import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import '../style/Books.css';

const EMPTY_BOOK = { title: '', author: '', isbn: '', category: '', total_quantity: 1, available_quantity: 1, published_year: '', description: '', cover_image: '' };

export default function Books() {
  const { user } = useAuth();
  const isStaff = ['admin', 'staff'].includes(user?.role);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [modal, setModal] = useState(null); // 'add' | 'edit' | 'detail' | 'borrow-confirm'
  const [selectedBook, setSelectedBook] = useState(null);
  const [form, setForm] = useState(EMPTY_BOOK);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };


const loadBooks = useCallback(async () => {
  setLoading(true);

  try {
    const params = {};

    if (search) params.search = search;
    if (catFilter) params.category = catFilter;

    const data = await api.getBooks({
      ...params,
      page_size: 1000
    });

    setBooks(data.results || data);

  } catch (e) {
    console.error(e);
  }

  setLoading(false);
}, [search, catFilter]);


  useEffect(() => { loadBooks(); }, [loadBooks]);
  useEffect(() => { api.getCategories().then(d => setCategories(d.results || d)).catch(() => { }); }, []);

  const openAdd = () => { setForm(EMPTY_BOOK); setError(''); setModal('add'); };
  const openEdit = (book) => {
    setSelectedBook(book);
    setForm({ ...book, category: book.category || '' });
    setError('');
    setModal('edit');
  };
  const openDetail = (book) => { setSelectedBook(book); setModal('detail'); };
  const openBorrow = (book) => { setSelectedBook(book); setModal('borrow-confirm'); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (modal === 'add') {
        await api.createBook(form);
        showToast(
          <span>
            <i className="fa-solid fa-circle-check"></i> Book added successfully!
          </span>
        );

      } else {
        await api.updateBook(selectedBook.id, form);

        showToast(
          <span>
            <i className="fa-solid fa-pen-to-square"></i> Book updated!
          </span>
        );
      }
      setModal(null);
      loadBooks();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Delete "${book.title}"?`)) return;
    try {
      await api.deleteBook(book.id);
      showToast(
        <span>
          <i className="fa-solid fa-trash"></i> Book deleted
        </span>
      );
      loadBooks();
    } catch (err) {
      showToast(
        <span>
          <i className="fa-solid fa-circle-exclamation"></i> Error: {err.message}
        </span>
      );
    }
  };

  const handleBorrow = async () => {
    setSaving(true);
    try {
      await api.borrowBook(selectedBook.id);
      showToast(
        <span>
          <i className="fa-solid fa-book-open-reader"></i>
          {' '}Book borrowed! Return within 10 days.
        </span>
      );
      setModal(null);
      loadBooks();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const fld = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="books-page">
      {toast && <div className="books-toast">{toast}</div>}

      <div className="books-header">
        <div>
          <h1 className="books-title"><i className="fa-solid fa-book"></i> Book Catalog</h1>
          <p className="books-sub">{books.length} books available</p>
        </div>
        {isStaff && <button className="btn-primary" onClick={openAdd}><i className="fa-solid fa-plus"></i> Add Book</button>}
      </div>

      <div className="books-filters">
        <input
          className="filter-input"
          placeholder=" Search title or author..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="books-loading"><div className="spinner" /></div>
      ) : (
        <div className="books-grid">
          {books.map(book => (
            <div key={book.id} className={`book-card ${!book.is_available ? 'unavailable' : ''}`}>
              <div className="book-cover" onClick={() => openDetail(book)}>
                {book.cover_image
                  ? <img src={book.cover_image} alt={book.title} />
                  : <div className="book-cover-placeholder">{book.title[0]}</div>
                }
                <div className="book-badge" style={{ background: book.is_available ? '#22c55e' : '#ef4444' }}>
                  {book.available_quantity}/{book.total_quantity}
                </div>
              </div>
              <div className="book-info">
                <h3 className="book-title" onClick={() => openDetail(book)}>{book.title}</h3>
                <p className="book-author">{book.author}</p>
                <span className="book-cat">{book.category_name}</span>
                <div className="book-actions">
                  {user?.role === 'user' && (
                    <button
                      className="btn-borrow"
                      disabled={!book.is_available}
                      onClick={() => openBorrow(book)}
                    >
                      {book.is_available ? 'Borrow' : 'Unavailable'}
                    </button>
                  )}
                  {isStaff && (
                    <>
                      <button className="btn-edit" onClick={() => openEdit(book)}> <i className="fa-solid fa-pencil"></i> Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(book)}> <i className="fa-solid fa-trash"></i> Delete</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add New Book' : 'Edit Book'} onClose={() => setModal(null)}>
          <form className="book-form" onSubmit={handleSave}>
            <div className="form-grid">
              <div className="form-field">
                <label>Title *</label>
                <input name="title" value={form.title} onChange={fld} required />
              </div>
              <div className="form-field">
                <label>Author *</label>
                <input name="author" value={form.author} onChange={fld} required />
              </div>
              <div className="form-field">
                <label>ISBN *</label>
                <input name="isbn" value={form.isbn} onChange={fld} required />
              </div>
              <div className="form-field">
                <label>Category</label>
                <select name="category" value={form.category} onChange={fld}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Total Quantity</label>
                <input name="total_quantity" type="number" min="1" value={form.total_quantity} onChange={fld} />
              </div>
              <div className="form-field">
                <label>Available Quantity</label>
                <input name="available_quantity" type="number" min="0" value={form.available_quantity} onChange={fld} />
              </div>
              <div className="form-field">
                <label>Published Year</label>
                <input name="published_year" type="number" value={form.published_year} onChange={fld} />
              </div>
              <div className="form-field">
                <label>Cover Image URL</label>
                <input name="cover_image" value={form.cover_image} onChange={fld} placeholder="https://..." />
              </div>
            </div>
            <div className="form-field">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={fld} rows={3} />
            </div>
            {error && <div className="form-error">⚠ {error}</div>}
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setModal(null)}>
                <i className="fas fa-times"></i> Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving} >
                <i className={`fa-solid ${saving ? 'fa-spinner fa-spin' : modal === 'add' ? 'fa-book-medical' : 'fa-floppy-disk'}`} ></i>
                {' '}
                {saving ? 'Saving...' : modal === 'add' ? 'Add Book' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Detail Modal */}
      {modal === 'detail' && selectedBook && (
        <Modal title="Book Details" onClose={() => setModal(null)}>
          <div className="book-detail">
            {selectedBook.cover_image && <img src={selectedBook.cover_image} alt={selectedBook.title} className="detail-img" />}
            <h2 className="detail-title">{selectedBook.title}</h2>
            <p className="detail-author">by {selectedBook.author}</p>
            <div className="detail-meta">
              <span>ISBN: {selectedBook.isbn}</span>
              <span>Category: {selectedBook.category_name}</span>
              <span>Year: {selectedBook.published_year}</span>
              <span style={{ color: selectedBook.is_available ? '#22c55e' : '#ef4444' }}>
                {selectedBook.available_quantity} of {selectedBook.total_quantity} available
              </span>
            </div>
            {selectedBook.description && <p className="detail-desc">{selectedBook.description}</p>}
            {user?.role === 'user' && selectedBook.is_available && (
              <button className="btn-primary" style={{ width: '100%', marginTop: '16px' }}
                onClick={() => { setModal('borrow-confirm'); }}>
                <i className="fas fa-book"></i> Borrow This Book
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* Borrow Confirm Modal */}
      {modal === 'borrow-confirm' && selectedBook && (
        <Modal title="Confirm Borrow" onClose={() => setModal(null)} size="sm">
          <div className="borrow-confirm">
            <div className="borrow-icon"><i className="fa-solid fa-book-open-reader"></i></div>
            <h3>{selectedBook.title}</h3>
            <p>by {selectedBook.author}</p>
            <div className="borrow-info">
              <div>Borrow period: <strong>10 days</strong></div>
              <div>Fine after due date: <strong>₹5/day</strong></div>
            </div>
            {error && <div className="form-error">⚠ {error}</div>}
            <div className="form-actions">
              <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleBorrow} disabled={saving}>
                {saving ? 'Processing...' : 'Confirm Borrow'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
