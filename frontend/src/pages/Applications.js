import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

export default function Applications() {
    const [applications, setApplications] = useState([]);
    const [filter, setFilter] = useState('all');
    const { user } = useAuth();
    const apiUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');

    useEffect(() => {
        const url = (user?.role === 'admin' || user?.role === 'manager') ? '/applications' : '/applications/my';
        axios.get(url).then(res => setApplications(res.data));
    }, [user]);

    const handleStatus = async (id, status) => {
        await axios.put(`/applications/${id}/status`, { status });
        setApplications(applications.map(a => a.id === id ? { ...a, status } : a));
    };

    const filters = ['all', 'pending', 'approved', 'rejected'];
    const labels = { all: 'Всички', pending: 'Чакащи', approved: 'Одобрени', rejected: 'Отказани' };
    const statusStyle = {
        pending: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
        approved: { color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
        rejected: { color: '#ff6b81', bg: 'rgba(233,69,96,0.12)' }
    };
    const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

    return (
        <div style={s.container}>
            <h1 style={s.title}>Кандидатури</h1>
            <div style={s.filters}>
                {filters.map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        style={{ ...s.filterBtn, ...(filter === f ? s.filterBtnActive : {}) }}>
                        {labels[f]}
                    </button>
                ))}
            </div>

            {filtered.map(app => (
                <div key={app.id} style={s.card}>
                    <h3 style={s.cardTitle}>{app.project_title}</h3>
                    {app.user_name && <p style={s.field}><strong>Кандидат:</strong> {app.user_name}</p>}
                    {app.message && <p style={s.field}><strong>Съобщение:</strong> {app.message}</p>}
                    <p style={s.field}><strong>Дата:</strong> {app.created_at?.split('T')[0]}</p>
                    <div style={{ ...s.badge, color: statusStyle[app.status]?.color, backgroundColor: statusStyle[app.status]?.bg }}>
                        {labels[app.status]}
                    </div>
                    {app.document_path && (
                        <div>
                            <a href={`${apiUrl}/${app.document_path}`} target="_blank" rel="noreferrer" style={s.docLink}>
                                Преглед на документа
                            </a>
                        </div>
                    )}
                    {(user?.role === 'admin' || user?.role === 'manager') && app.status === 'pending' && (
                        <div style={s.actionBtns}>
                            <button style={s.btnApprove} onClick={() => handleStatus(app.id, 'approved')}>Одобри</button>
                            <button style={s.btnReject} onClick={() => handleStatus(app.id, 'rejected')}>Откажи</button>
                        </div>
                    )}
                </div>
            ))}
            {filtered.length === 0 && <p style={s.empty}>Няма намерени кандидатури.</p>}
        </div>
    );
}

const s = {
    container: { padding: '40px 44px', maxWidth: '850px' },
    title: { color: 'white', marginBottom: '20px', fontSize: '1.5rem', fontWeight: '600' },
    filters: { display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' },
    filterBtn: { padding: '7px 15px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#14141f', color: 'rgba(255,255,255,0.55)', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' },
    filterBtnActive: { backgroundColor: '#e94560', color: 'white', borderColor: '#e94560' },
    card: { backgroundColor: '#14141f', border: '1px solid rgba(255,255,255,0.07)', padding: '22px', borderRadius: '14px', marginBottom: '14px' },
    cardTitle: { color: 'white', marginBottom: '10px', fontSize: '1.05rem', fontWeight: '600' },
    field: { color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', margin: '4px 0' },
    badge: { display: 'inline-block', padding: '4px 11px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', marginTop: '8px' },
    docLink: { display: 'inline-block', marginTop: '10px', color: '#ff6b81', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '500' },
    actionBtns: { display: 'flex', gap: '10px', marginTop: '15px' },
    btnApprove: { padding: '8px 18px', backgroundColor: 'rgba(74,222,128,0.14)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
    btnReject: { padding: '8px 18px', backgroundColor: 'rgba(233,69,96,0.14)', color: '#ff6b81', border: '1px solid rgba(233,69,96,0.25)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
    empty: { color: 'rgba(255,255,255,0.35)' }
};
