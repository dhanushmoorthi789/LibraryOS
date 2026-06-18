import { useState, useEffect } from 'react';
import { api } from '../services/api';
import '../style/FineSettings.css';

export default function FineSettings() {
  const [fines, setFines] = useState([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    api.getFines()
      .then(d => {
        const list = d.results || d;
        setFines(list);
        if (list.length > 0) setAmount(list[list.length - 1].amount_per_day);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const last = fines[fines.length - 1];
      if (last) {
        const updated = await api.updateFine(last.id, {
          amount_per_day: parseFloat(amount)
        });
        setFines(
          fines.map(f => f.id === updated.id ? updated : f)
        );
      } else {
        const created = await api.createFine({
          amount_per_day: parseFloat(amount)
        });
        setFines([created]);
      }
      showToast(
        <span>
          <i className="fa-solid fa-money-bill-wave"></i>
          {' '}Fine rate updated!
        </span>
      );
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

  const current = fines[fines.length - 1];

  return (
    <div className="fine-page">
      {toast && <div className="fine-toast">{toast}</div>}

      <div className="fine-header">
        <h1 className="fine-title"><i className="fas fa-coins"></i> Fine Settings</h1>
        <p className="fine-sub">Configure overdue fine rates for the library</p>
      </div>

      {loading ? (
        <div className="fine-loading"><div className="spinner" /></div>
      ) : (
        <div className="fine-content">
          <div className="fine-current-card">
            <div className="fine-card-label">Current Fine Rate</div>
            <div className="fine-card-amount"><i className="fas fa-indian-rupee-sign"></i>{current?.amount_per_day || 0}<span>/day</span></div>
            <div className="fine-card-meta">
              Last updated by: <strong>{current?.updated_by_name || 'N/A'}</strong>
            </div>
            {current?.updated_at && (
              <div className="fine-card-meta">
                On: {new Date(current.updated_at).toLocaleString()}
              </div>
            )}
          </div>

          <div className="fine-rules-card">
            <h3>Fine Rules</h3>
            <ul>
              <li><i className="fas fa-info-circle"></i> Books must be returned within <strong>10 days</strong> from borrow date</li>
              <li><i className="fas fa-coins"></i> Fine is charged <strong>per day</strong> after the due date</li>
              <li><i className="fas fa-chart-bar"></i> Fine accumulates until the book is returned</li>
              <li><i className="fas fa-check-circle"></i> Fine is calculated automatically on return</li>
            </ul>
          </div>

          <div className="fine-update-card">
            <h3>Update Fine Rate</h3>
            <form onSubmit={handleSave} className="fine-form">
              <div className="fine-input-wrap">
                <span className="fine-currency"><i className="fas fa-indian-rupee-sign"></i></span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
                <span className="fine-per">per day</span>
              </div>
              <button type="submit" className="btn-primary" disabled={saving} >
                <i className={`fa-solid ${saving ? 'fa-spinner fa-spin' : 'fa-coins'  }`}  ></i>
                {' '}
                {saving ? 'Updating...' : 'Update Fine Rate'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
