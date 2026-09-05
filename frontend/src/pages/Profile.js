import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

export default function Profile() {
    const { user, login, token } = useAuth();
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({ name: '', email: '' });
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [stats, setStats] = useState(null);
    const [msg, setMsg] = useState('');
    const [pwMsg, setPwMsg] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarMsg, setAvatarMsg] = useState('');
    const apiBase = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');

    const loadProfile = () => {
        axios.get('/profile').then(res => {
            setProfile(res.data);
            setForm({ name: res.data.name, email: res.data.email });
        });
    };

    useEffect(() => {
        loadProfile();
        axios.get('/profile/stats').then(res => setStats(res.data));
    }, []);

    const handleSaveProfile = async () => {
        setMsg('');
        try {
            const res = await axios.put('/profile', form);
            login({ ...user, name: res.data.user.name }, token);
            setMsg('Профилът е обновен успешно');
            loadProfile();
        } catch (err) {
            setMsg(err.response?.data?.message || 'Грешка при обновяване');
        }
    };

    const handleChangePassword = async () => {
        setPwMsg('');
        if (pwForm.newPassword !== pwForm.confirmPassword) return setPwMsg('Новите пароли не съвпадат');
        if (pwForm.newPassword.length < 4) return setPwMsg('Паролата трябва да е поне 4 символа');
        try {
            await axios.put('/profile/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
            setPwMsg('Паролата е сменена успешно');
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPwMsg(err.response?.data?.message || 'Грешка при смяна на паролата');
        }
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) return;
        setAvatarMsg('');
        const data = new FormData();
        data.append('avatar', avatarFile);
        try {
            await axios.post('/profile/avatar', data);
            setAvatarMsg('Снимката е качена успешно');
            setAvatarFile(null);
            loadProfile();
        } catch {
            setAvatarMsg('Грешка при качване');
        }
    };

    const roleLabels = { user: 'Потребител', manager: 'Мениджър', admin: 'Администратор' };
    const isSuccess = (m) => m.includes('успешно');

    if (!profile) return <p style={{ padding: '40px', color: 'rgba(255,255,255,0.5)' }}>Зареждане...</p>;

    return (
        <div style={s.container}>
            <h1 style={s.title}>Моят профил</h1>

            <div style={s.card}>
                <div style={s.avatarRow}>
                    {profile.avatar_path ? (
                        <img src={`${apiBase}/${profile.avatar_path}`} alt="Avatar" style={s.avatarImg} />
                    ) : (
                        <div style={s.avatarPlaceholder}>{profile.name?.charAt(0).toUpperCase()}</div>
                    )}
                    <div style={{ flex: 1 }}>
                        <p style={s.nameText}>{profile.name}</p>
                        <p style={s.metaText}>{roleLabels[profile.role]} · Регистриран на {profile.created_at?.split('T')[0]}</p>
                        <input type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files[0])} style={s.fileInput} />
                        {avatarFile && (
                            <button style={s.btnSmall} onClick={handleAvatarUpload}>Качи снимка</button>
                        )}
                        {avatarMsg && <p style={{ ...s.msg, color: isSuccess(avatarMsg) ? '#4ade80' : '#ff6b81' }}>{avatarMsg}</p>}
                    </div>
                </div>
            </div>

            {stats && (
                <div style={s.card}>
                    <h2 style={s.cardTitle}>Моята активност</h2>
                    <div style={s.statsGrid}>
                        <div style={s.statBox}><p style={s.statNum}>{stats.my_projects}</p><p style={s.statLabel}>Мои проекти</p></div>
                        <div style={s.statBox}><p style={s.statNum}>{stats.my_applications}</p><p style={s.statLabel}>Кандидатури</p></div>
                        <div style={s.statBox}><p style={{ ...s.statNum, color: '#4ade80' }}>{stats.approved_applications}</p><p style={s.statLabel}>Одобрени</p></div>
                        <div style={s.statBox}><p style={{ ...s.statNum, color: '#fbbf24' }}>{stats.pending_applications}</p><p style={s.statLabel}>Чакащи</p></div>
                        <div style={s.statBox}><p style={{ ...s.statNum, color: '#ff6b81' }}>{stats.rejected_applications}</p><p style={s.statLabel}>Отказани</p></div>
                        <div style={s.statBox}><p style={s.statNum}>{stats.assigned_tasks}</p><p style={s.statLabel}>Назначени задачи</p></div>
                        <div style={s.statBox}><p style={{ ...s.statNum, color: '#4ade80' }}>{stats.completed_tasks}</p><p style={s.statLabel}>Завършени задачи</p></div>
                    </div>
                </div>
            )}

            <div style={s.card}>
                <h2 style={s.cardTitle}>Лична информация</h2>
                {msg && <p style={{ ...s.msg, color: isSuccess(msg) ? '#4ade80' : '#ff6b81' }}>{msg}</p>}
                <label style={s.label}>Пълно име</label>
                <input style={s.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <label style={s.label}>Имейл</label>
                <input style={s.input} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                <p style={s.roleInfo}>Роля: <strong>{roleLabels[profile.role]}</strong> — само администратор може да променя роли</p>
                <button style={s.btn} onClick={handleSaveProfile}>Запази промените</button>
            </div>

            <div style={s.card}>
                <h2 style={s.cardTitle}>Смяна на парола</h2>
                {pwMsg && <p style={{ ...s.msg, color: isSuccess(pwMsg) ? '#4ade80' : '#ff6b81' }}>{pwMsg}</p>}
                <label style={s.label}>Текуща парола</label>
                <input style={s.input} type="password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
                <label style={s.label}>Нова парола</label>
                <input style={s.input} type="password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} />
                <label style={s.label}>Потвърди новата парола</label>
                <input style={s.input} type="password" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} />
                <button style={s.btn} onClick={handleChangePassword}>Смени паролата</button>
            </div>
        </div>
    );
}

const s = {
    container: { padding: '40px 44px', maxWidth: '650px' },
    title: { color: 'white', marginBottom: '24px', fontSize: '1.5rem', fontWeight: '600' },
    card: { backgroundColor: '#14141f', border: '1px solid rgba(255,255,255,0.07)', padding: '26px', borderRadius: '14px', marginBottom: '20px' },
    cardTitle: { color: 'white', marginBottom: '16px', fontSize: '1.05rem', fontWeight: '600' },
    label: { display: 'block', fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', marginBottom: '6px', marginTop: '14px', fontWeight: '500' },
    input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0a0a12', color: 'white', boxSizing: 'border-box', fontSize: '0.9rem' },
    roleInfo: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '14px' },
    btn: { marginTop: '18px', padding: '10px 22px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
    btnSmall: { marginLeft: '10px', padding: '6px 14px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' },
    avatarRow: { display: 'flex', gap: '18px', alignItems: 'flex-start', flexWrap: 'wrap' },
    avatarImg: { width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' },
    avatarPlaceholder: { width: '84px', height: '84px', borderRadius: '50%', backgroundColor: '#e94560', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '700', flexShrink: 0 },
    nameText: { margin: '0 0 4px', fontWeight: '600', color: 'white', fontSize: '1.05rem' },
    metaText: { margin: '0 0 12px', color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' },
    fileInput: { fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' },
    msg: { fontSize: '0.85rem', fontWeight: '500', marginTop: '8px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: '10px' },
    statBox: { backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '14px', borderRadius: '10px', textAlign: 'center' },
    statNum: { fontSize: '1.5rem', fontWeight: '700', margin: '0 0 4px', color: 'white' },
    statLabel: { fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', margin: 0 }
};
