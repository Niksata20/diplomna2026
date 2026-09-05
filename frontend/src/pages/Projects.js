import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [progress, setProgress] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', deadline: '' });
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const load = () => {
        axios.get('/projects').then(res => setProjects(res.data));
        axios.get('/projects/progress/all').then(res => setProgress(res.data));
    };
    useEffect(() => { load(); }, []);

    const handleCreate = async () => {
        if (!form.title) return alert('Заглавието е задължително');
        await axios.post('/projects', form);
        setShowForm(false);
        setForm({ title: '', description: '', deadline: '' });
        load();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Сигурен ли си, че искаш да изтриеш проекта?')) return;
        await axios.delete(`/projects/${id}`);
        load();
    };

    const filters = ['all', 'active', 'completed', 'terminated'];
    const filterLabels = { all: 'Всички', active: 'Активни', completed: 'Завършени', terminated: 'Прекратени' };
    const statusStyle = {
        active: { color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
        completed: { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
        terminated: { color: '#ff6b81', bg: 'rgba(233,69,96,0.12)' }
    };

    const filtered = projects
        .filter(p => filter === 'all' ? true : p.status === filter)
        .filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={s.container}>
            <div style={s.header}>
                <h1 style={s.title}>Проекти</h1>
                {(user?.role === 'admin' || user?.role === 'manager') && (
                    <button style={s.btn} onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Затвори' : '+ Нов проект'}
                    </button>
                )}
            </div>

            <div style={s.toolbar}>
                <input
                    style={s.searchInput}
                    placeholder="Търси по име на проект..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <div style={s.filters}>
                    {filters.map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            style={{ ...s.filterBtn, ...(filter === f ? s.filterBtnActive : {}) }}>
                            {filterLabels[f]}
                        </button>
                    ))}
                </div>
            </div>

            {showForm && (
                <div style={s.form}>
                    <input style={s.input} placeholder="Заглавие *" value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })} />
                    <input style={s.input} placeholder="Описание" value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })} />
                    <input style={s.input} type="date" value={form.deadline}
                        onChange={e => setForm({ ...form, deadline: e.target.value })} />
                    <button style={s.btn} onClick={handleCreate}>Създай проект</button>
                </div>
            )}

            <div style={s.grid}>
                {filtered.map(p => {
                    const prog = progress[p.id] || { percent: 0, completed: 0, total: 0 };
                    return (
                        <div key={p.id} style={s.card}>
                            <h3 style={s.cardTitle}>{p.title}</h3>
                            <p style={s.cardDesc}>{p.description || 'Без описание'}</p>
                            <div style={{ ...s.badge, color: statusStyle[p.status]?.color, backgroundColor: statusStyle[p.status]?.bg }}>
                                {filterLabels[p.status]}
                            </div>

                            <div style={s.progressSection}>
                                <div style={s.progressLabelRow}>
                                    <span style={s.progressLabel}>Прогрес</span>
                                    <span style={s.progressPercent}>{prog.percent}%</span>
                                </div>
                                <div style={s.progressTrack}>
                                    <div style={{ ...s.progressFill, width: `${prog.percent}%` }} />
                                </div>
                                <span style={s.progressSub}>{prog.completed} от {prog.total} задачи завършени</span>
                            </div>

                            <p style={s.deadline}>Краен срок: {p.deadline ? p.deadline.split('T')[0] : 'Няма'}</p>
                            <div style={s.cardBtns}>
                                <button style={s.btnSmall} onClick={() => navigate(`/projects/${p.id}`)}>Детайли</button>
                                {user?.role === 'admin' && (
                                    <button style={s.btnDanger} onClick={() => handleDelete(p.id)}>Изтрий</button>
                                )}
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && <p style={s.empty}>Няма намерени проекти.</p>}
            </div>
        </div>
    );
}

const s = {
    container: { padding: '40px 44px', maxWidth: '1200px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
    title: { color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: '600' },
    toolbar: { display: 'flex', gap: '14px', marginBottom: '22px', flexWrap: 'wrap', alignItems: 'center' },
    searchInput: { padding: '9px 14px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#14141f', color: 'white', fontSize: '0.88rem', minWidth: '240px', flex: '0 1 300px' },
    filters: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    filterBtn: { padding: '7px 15px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#14141f', color: 'rgba(255,255,255,0.55)', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' },
    filterBtnActive: { backgroundColor: '#e94560', color: 'white', borderColor: '#e94560' },
    form: { backgroundColor: '#14141f', border: '1px solid rgba(255,255,255,0.07)', padding: '20px', borderRadius: '14px', marginBottom: '24px', display: 'flex', gap: '10px', flexWrap: 'wrap' },
    input: { padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0a0a12', color: 'white', flex: '1', minWidth: '150px', fontSize: '0.9rem' },
    btn: { padding: '10px 20px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '16px' },
    card: { backgroundColor: '#14141f', border: '1px solid rgba(255,255,255,0.07)', padding: '20px', borderRadius: '14px' },
    cardTitle: { color: 'white', margin: '0 0 6px', fontSize: '1.05rem', fontWeight: '600' },
    cardDesc: { color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', margin: '0 0 12px', lineHeight: 1.5 },
    badge: { display: 'inline-block', padding: '4px 11px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', marginBottom: '14px' },
    progressSection: { marginBottom: '14px' },
    progressLabelRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' },
    progressLabel: { color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', fontWeight: '500' },
    progressPercent: { color: 'white', fontSize: '0.75rem', fontWeight: '700' },
    progressTrack: { height: '6px', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: '4px', overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#e94560', borderRadius: '4px', transition: 'width 0.3s ease' },
    progressSub: { color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', marginTop: '5px', display: 'block' },
    deadline: { color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', margin: '0 0 14px' },
    cardBtns: { display: 'flex', gap: '8px' },
    btnSmall: { padding: '7px 16px', backgroundColor: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '500' },
    btnDanger: { padding: '7px 16px', backgroundColor: 'rgba(233,69,96,0.14)', color: '#ff6b81', border: '1px solid rgba(233,69,96,0.25)', borderRadius: '7px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '500' },
    empty: { color: 'rgba(255,255,255,0.35)' }
};
