import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../style/Borrows.css';

export default function Borrows({ all = false }) {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = all
        ? await api.getBorrows(params)
        : await api.getBorrows(params);
      setRecords(data.results || data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter, all]);

  const handleReturn = async (record) => {
    if (!window.confirm('Confirm return of this book?')) return;
    try {
      await api.returnBook(record.id);
      showToast('✅ Book returned successfully!');
      load();
    } catch (err) { showToast('Error: ' + err.message); }
  };

  const getDaysInfo = (record) => {
    const today = new Date();
    const due = new Date(record.due_date);
    const diff = Math.floor((due - today) / (1000 * 60 * 60 * 24));
    if (record.status === 'returned') return { label: 'Returned', color: '#6b7280' };
    if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, color: '#ef4444' };
    if (diff === 0) return { label: 'Due today!', color: '#f59e0b' };
    return { label: `${diff}d left`, color: '#22c55e' };
  };

  const statusColors = { borrowed: '#6c63ff', returned: '#6b7280', overdue: '#ef4444' };

  return (
    <div className="borrows-page">
      {toast && <div className="borrows-toast">{toast}</div>}

      <div className="borrows-header">
        <div>
          <h1 className="borrows-title">
            <i
              className={`fa-solid ${all ? 'fa-rotate' : 'fa-book-open-reader'  }`}
            ></i> 
            {' '}
            {all ? 'All Borrow Records' : 'My Borrowed Books'}
          </h1>

          <p className="borrows-sub">{records.length} records</p>
        </div>
        <div className="borrows-filters">
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="borrowed">Borrowed</option>
            <option value="returned">Returned</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="borrows-loading"><div className="spinner" /></div>
      ) : records.length === 0 ? (
        <div className="borrows-empty">
          <div className="empty-icon"><i className="fa-solid fa-explosion"></i></div>
          <p>No borrow records found</p>
        </div>
      ) : (
        <div className="borrows-table-wrap">
          <table className="borrows-table">
            <thead>
              <tr>
                {all && <th>Member</th>}
                <th>Book</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Fine</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map(rec => {
                const daysInfo = getDaysInfo(rec);
                const fine = rec.current_fine || 0;
                return (
                  <tr key={rec.id}>
                    {all && (
                      <td>
                        <div className="cell-user">
                          <div className="cell-avatar">{rec.user_name?.[0]?.toUpperCase()}</div>
                          <div>
                            <div className="cell-name">{rec.user_name}</div>
                            <div className="cell-email">{rec.user_email}</div>
                          </div>
                        </div>
                      </td>
                    )}
                    <td>
                      <div className="cell-book">
                        <div className="cell-book-title">{rec.book_title}</div>
                        <div className="cell-book-author">{rec.book_author}</div>
                      </div>
                    </td>
                    <td className="cell-date">{rec.borrow_date}</td>
                    <td>
                      <span className="due-badge" style={{ color: daysInfo.color }}>
                        {rec.due_date}
                        <small>{daysInfo.label}</small>
                      </span>
                    </td>
                    <td className="cell-date">{rec.return_date || '—'}</td>
                    <td>
                      <span className="status-pill" style={{ background: `${statusColors[rec.status]}22`, color: statusColors[rec.status] }}>
                        {rec.status}
                      </span>
                    </td>
                    <td>
                      {fine > 0
                        ? <span className="fine-badge">₹{fine.toFixed(2)}</span>
                        : <span className="fine-zero">₹0</span>
                      }
                    </td>
                    <td>
                      {rec.status !== 'returned' && (user?.role !== 'user' || rec.user === user?.id) && (
                        <button className="btn-return" onClick={() => handleReturn(rec)}>
                          Return
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
