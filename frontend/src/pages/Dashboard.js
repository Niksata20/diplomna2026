import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from '../api/axios';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [quickStats, setQuickStats] = useState(null);

    useEffect(() => {
        if (user?.role === 'admin' || user?.role === 'manager') {
            axios.get('/stats').then(res => setQuickStats(res.data)).catch(() => {});
        }
    }, [user]);

    const cards = [
        { title: 'Проекти', desc: 'Разгледай всички активни проекти', path: '/projects', icon: '▤', show: true },
        { title: 'Кандидатури', desc: 'Провери статуса на твоите кандидатури', path: '/applications', icon: '▥', show: true },
        { title: 'Статистика', desc: 'Преглед на данни и графики', path: '/stats', icon: '◫', show: user?.role === 'admin' || user?.role === 'manager' },
        { title: 'Администрация', desc: 'Управление на потребители', path: '/admin', icon: '⚙', show: user?.role === 'admin' },
    ];

    return (
        <div style={s.container}>
            <div style={s.header}>
                <div>
                    <h1 style={s.title}>Добре дошъл, {user?.name}</h1>
                    <p style={s.sub}>Роля: <span style={s.roleBadge}>{user?.role}</span></p>
                </div>
            </div>

            {quickStats && (
                <div style={s.metricsRow}>
                    <div style={s.metricCard}>
                        <p style={s.metricLabel}>Общо проекти</p>
                        <p style={s.metricValue}>{quickStats.total_projects}</p>
                    </div>
                    <div style={s.metricCard}>
                        <p style={s.metricLabel}>Активни</p>
                        <p style={s.metricValue}>{quickStats.active_projects}</p>
                    </div>
                    <div style={s.metricCard}>
                        <p style={s.metricLabel}>Кандидатури</p>
                        <p style={s.metricValue}>{quickStats.total_applications}</p>
                    </div>
                    <div style={s.metricCard}>
                        <p style={s.metricLabel}>Чакащи</p>
                        <p style={{ ...s.metricValue, color: '#ff6b81' }}>{quickStats.pending_applications}</p>
                    </div>
                </div>
            )}

            <div style={s.grid}>
                {cards.filter(c => c.show).map((c, i) => (
                    <div key={i} style={s.card} onClick={() => navigate(c.path)}>
                        <div style={s.cardIcon}>{c.icon}</div>
                        <h3 style={s.cardTitle}>{c.title}</h3>
                        <p style={s.cardDesc}>{c.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

const s = {
    container: { padding: '40px 44px', maxWidth: '1200px' },
    header: { marginBottom: '28px' },
    title: { color: 'white', fontSize: '1.7rem', margin: '0 0 6px', fontWeight: '600', letterSpacing: '-0.01em' },
    sub: { color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.9rem' },
    roleBadge: { color: '#ff6b81', fontWeight: '600', textTransform: 'capitalize' },
    metricsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '32px' },
    metricCard: {
        backgroundColor: '#14141f', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px', padding: '18px 20px'
    },
    metricLabel: { color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', margin: '0 0 8px' },
    metricValue: { color: 'white', fontSize: '1.7rem', fontWeight: '600', margin: 0 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '16px' },
    card: {
        backgroundColor: '#14141f', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px', padding: '24px', cursor: 'pointer',
        transition: 'border-color 0.15s, transform 0.15s'
    },
    cardIcon: {
        width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(233,69,96,0.14)',
        color: '#ff6b81', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.1rem', marginBottom: '14px'
    },
    cardTitle: { color: 'white', margin: '0 0 6px', fontSize: '1.05rem', fontWeight: '600' },
    cardDesc: { color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }
};
