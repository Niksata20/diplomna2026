import { useState, useEffect } from 'react';
import axios from '../api/axios';

export default function AdminPanel() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        axios.get('/admin/users').then(res => setUsers(res.data));
    }, []);

    const handleRole = async (id, role) => {
        await axios.put(`/admin/users/${id}/role`, { role });
        setUsers(users.map(u => u.id === id ? { ...u, role } : u));
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Сигурен ли си, че искаш да изтриеш потребителя?')) return;
        await axios.delete(`/admin/users/${id}`);
        setUsers(users.filter(u => u.id !== id));
    };

    return (
        <div style={s.container}>
            <h1 style={s.title}>Администраторски панел</h1>
            <p style={s.subtitle}>Управление на потребители ({users.length})</p>
            <div style={s.tableWrap}>
                <table style={s.table}>
                    <thead>
                        <tr>
                            <th style={s.th}>Име</th>
                            <th style={s.th}>Имейл</th>
                            <th style={s.th}>Роля</th>
                            <th style={s.th}>Регистриран</th>
                            <th style={s.th}>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td style={s.td}>{u.name}</td>
                                <td style={s.td}>{u.email}</td>
                                <td style={s.td}>
                                    <select value={u.role} onChange={e => handleRole(u.id, e.target.value)} style={s.select}>
                                        <option value="user">user</option>
                                        <option value="manager">manager</option>
                                        <option value="admin">admin</option>
                                    </select>
                                </td>
                                <td style={s.td}>{u.created_at?.split('T')[0]}</td>
                                <td style={s.td}>
                                    <button style={s.btnDel} onClick={() => handleDelete(u.id)}>Изтрий</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const s = {
    container: { padding: '40px 44px', maxWidth: '1100px' },
    title: { color: 'white', marginBottom: '4px', fontSize: '1.5rem', fontWeight: '600' },
    subtitle: { color: 'rgba(255,255,255,0.45)', marginBottom: '24px', fontSize: '0.9rem' },
    tableWrap: { overflowX: 'auto', backgroundColor: '#14141f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '14px 18px', textAlign: 'left', fontWeight: '600', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.03em', borderBottom: '1px solid rgba(255,255,255,0.07)' },
    td: { padding: '13px 18px', color: 'white', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.04)' },
    select: { padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0a0a12', color: 'white', fontSize: '0.85rem' },
    btnDel: { padding: '6px 14px', backgroundColor: 'rgba(233,69,96,0.14)', color: '#ff6b81', border: '1px solid rgba(233,69,96,0.25)', borderRadius: '7px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }
};
