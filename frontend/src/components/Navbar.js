import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        if (user?.role === 'admin' || user?.role === 'manager') {
            const fetchCount = () => axios.get('/applications/pending-count').then(res => setPendingCount(res.data.count)).catch(() => {});
            fetchCount();
            const interval = setInterval(fetchCount, 15000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const links = [
        { to: '/dashboard', label: 'Начало', icon: '⌂' },
        { to: '/projects', label: 'Проекти', icon: '▤' },
        { to: '/applications', label: 'Кандидатури', icon: '▥', badge: pendingCount },
        ...(user.role === 'admin' || user.role === 'manager' ? [{ to: '/stats', label: 'Статистика', icon: '◫' }] : []),
        ...(user.role === 'admin' ? [{ to: '/admin', label: 'Админ', icon: '⚙' }] : []),
    ];

    return (
        <div style={s.sidebar}>
            <div style={s.logoBox}>
                <div style={s.logoMark}>T</div>
                <span style={s.logoText}>TrackFlow</span>
            </div>

            <nav style={s.nav}>
                {links.map(link => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        style={({ isActive }) => ({
                            ...s.navItem,
                            ...(isActive ? s.navItemActive : {})
                        })}
                    >
                        <span style={s.navIcon}>{link.icon}</span>
                        <span style={{ flex: 1 }}>{link.label}</span>
                        {!!link.badge && (
                            <span style={s.badge}>{link.badge > 9 ? '9+' : link.badge}</span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div style={s.footer}>
                <NavLink to="/profile" style={({ isActive }) => ({ ...s.profileLink, ...(isActive ? s.navItemActive : {}) })}>
                    <div style={s.avatarSmall}>{user.name?.charAt(0).toUpperCase()}</div>
                    <div style={s.profileText}>
                        <span style={s.profileName}>{user.name}</span>
                        <span style={s.profileRole}>{user.role}</span>
                    </div>
                </NavLink>
                <button onClick={handleLogout} style={s.logoutBtn}>Изход</button>
            </div>
        </div>
    );
}

const s = {
    sidebar: {
        width: '240px', minHeight: '100vh', backgroundColor: '#0d0d17',
        display: 'flex', flexDirection: 'column', padding: '24px 16px',
        position: 'sticky', top: 0, boxSizing: 'border-box',
        borderRight: '1px solid rgba(255,255,255,0.06)'
    },
    logoBox: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', padding: '0 8px' },
    logoMark: {
        width: '32px', height: '32px', borderRadius: '9px', backgroundColor: '#e94560',
        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 'bold', fontSize: '1rem', flexShrink: 0
    },
    logoText: { color: 'white', fontSize: '1.05rem', fontWeight: '600', letterSpacing: '-0.01em' },
    nav: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 },
    navItem: {
        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
        borderRadius: '8px', color: 'rgba(255,255,255,0.55)', textDecoration: 'none',
        fontSize: '0.9rem', fontWeight: '500', transition: 'background 0.15s, color 0.15s'
    },
    navItemActive: {
        backgroundColor: 'rgba(233,69,96,0.14)', color: '#ff6b81'
    },
    navIcon: { fontSize: '1rem', width: '18px', textAlign: 'center', opacity: 0.9 },
    badge: {
        backgroundColor: '#e94560', color: 'white', fontSize: '0.7rem', fontWeight: '700',
        borderRadius: '20px', padding: '1px 7px', minWidth: '18px', textAlign: 'center'
    },
    footer: { borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' },
    profileLink: {
        display: 'flex', alignItems: 'center', gap: '10px', padding: '8px',
        borderRadius: '8px', textDecoration: 'none', color: 'inherit'
    },
    avatarSmall: {
        width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e94560',
        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0
    },
    profileText: { display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    profileName: { color: 'white', fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    profileRole: { color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'capitalize' },
    logoutBtn: {
        padding: '9px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', cursor: 'pointer',
        fontSize: '0.85rem', fontWeight: '500'
    }
};
