import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
        const errs = {};
        if (!form.email.trim()) {
            errs.email = 'Моля въведи имейл';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errs.email = 'Невалиден имейл адрес';
        }
        if (!form.password) {
            errs.password = 'Моля въведи парола';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        if (!validate()) return;
        try {
            const res = await axios.post('/auth/login', form);
            login(res.data.user, res.data.token);
            navigate('/dashboard');
        } catch {
            setServerError('Грешен имейл или парола');
        }
    };

    return (
        <div style={s.container}>
            <div style={s.box}>
                <div style={s.logoMark}>T</div>
                <h2 style={s.title}>Вход в системата</h2>
                <p style={s.subtitle}>TrackFlow — управление на проекти и кандидатури</p>
                {serverError && <p style={s.serverError}>{serverError}</p>}
                <form onSubmit={handleSubmit} noValidate>
                    <label style={s.label}>Имейл</label>
                    <input
                        style={{ ...s.input, borderColor: errors.email ? '#ff6b81' : 'rgba(255,255,255,0.1)' }}
                        placeholder="ime@example.com"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                    />
                    {errors.email && <p style={s.fieldError}>{errors.email}</p>}

                    <label style={s.label}>Парола</label>
                    <input
                        style={{ ...s.input, borderColor: errors.password ? '#ff6b81' : 'rgba(255,255,255,0.1)' }}
                        type="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                    />
                    {errors.password && <p style={s.fieldError}>{errors.password}</p>}

                    <button type="submit" style={s.btn}>Влез</button>
                </form>
                <p style={s.footerText}>
                    Нямаш акаунт? <Link to="/register" style={s.link}>Регистрация</Link>
                </p>
            </div>
        </div>
    );
}

const s = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0a0a12' },
    box: { backgroundColor: '#14141f', border: '1px solid rgba(255,255,255,0.07)', padding: '40px 36px', borderRadius: '16px', width: '100%', maxWidth: '380px', boxSizing: 'border-box' },
    logoMark: { width: '40px', height: '40px', borderRadius: '11px', backgroundColor: '#e94560', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '20px' },
    title: { color: 'white', margin: '0 0 6px', fontSize: '1.4rem', fontWeight: '600' },
    subtitle: { color: 'rgba(255,255,255,0.45)', margin: '0 0 24px', fontSize: '0.85rem' },
    label: { display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '6px', marginTop: '14px', fontWeight: '500' },
    input: { width: '100%', padding: '11px 13px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0a0a12', color: 'white', boxSizing: 'border-box', fontSize: '0.9rem', outline: 'none' },
    fieldError: { color: '#ff6b81', fontSize: '0.78rem', margin: '5px 0 0' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '9px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600', marginTop: '22px' },
    serverError: { color: '#ff6b81', fontSize: '0.85rem', marginBottom: '10px' },
    footerText: { textAlign: 'center', marginTop: '20px', color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' },
    link: { color: '#ff6b81', textDecoration: 'none', fontWeight: '600' }
};
