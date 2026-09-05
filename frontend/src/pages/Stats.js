import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import axios from '../api/axios';

const COLORS = ['#e94560', '#60a5fa', '#4ade80', '#fbbf24'];

export default function Stats() {
    const [stats, setStats] = useState(null);
    const [byStatus, setByStatus] = useState([]);

    useEffect(() => {
        axios.get('/stats').then(res => setStats(res.data));
        axios.get('/stats/by-status').then(res => setByStatus(res.data));
    }, []);

    if (!stats) return <p style={{ padding: '40px', color: 'rgba(255,255,255,0.5)' }}>Зареждане...</p>;

    const cards = [
        { label: 'Общо проекти', value: stats.total_projects },
        { label: 'Активни', value: stats.active_projects },
        { label: 'Завършени', value: stats.completed_projects },
        { label: 'Потребители', value: stats.total_users },
        { label: 'Кандидатури', value: stats.total_applications },
        { label: 'Чакащи', value: stats.pending_applications },
    ];

    return (
        <div style={s.container}>
            <h1 style={s.title}>Статистика</h1>

            <div style={s.cards}>
                {cards.map((c, i) => (
                    <div key={i} style={s.card}>
                        <p style={s.num}>{c.value}</p>
                        <p style={s.label}>{c.label}</p>
                    </div>
                ))}
            </div>

            <div style={s.charts}>
                <div style={s.chartBox}>
                    <h2 style={s.chartTitle}>Проекти по статус</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label>
                                {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#0a0a12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                            <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div style={s.chartBox}>
                    <h2 style={s.chartTitle}>Брой по статус</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={byStatus}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                            <XAxis dataKey="status" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                            <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.4)" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#0a0a12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                            <Bar dataKey="count" fill="#e94560" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

const s = {
    container: { padding: '40px 44px', maxWidth: '1200px' },
    title: { color: 'white', marginBottom: '24px', fontSize: '1.5rem', fontWeight: '600' },
    cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '32px' },
    card: { backgroundColor: '#14141f', border: '1px solid rgba(255,255,255,0.07)', padding: '20px', borderRadius: '14px', textAlign: 'center' },
    num: { color: '#ff6b81', margin: '0 0 6px', fontSize: '1.8rem', fontWeight: '700' },
    label: { color: 'rgba(255,255,255,0.45)', margin: 0, fontSize: '0.82rem' },
    charts: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
    chartBox: { backgroundColor: '#14141f', border: '1px solid rgba(255,255,255,0.07)', padding: '22px', borderRadius: '14px', flex: '1', minWidth: '320px' },
    chartTitle: { color: 'white', marginBottom: '14px', fontSize: '1rem', fontWeight: '600' }
};
