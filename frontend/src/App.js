import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Applications from './pages/Applications';
import AdminPanel from './pages/AdminPanel';
import Stats from './pages/Stats';
import Profile from './pages/Profile';

const PrivateRoute = ({ children }) => {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const { user } = useAuth();
    return user?.role === 'admin' ? children : <Navigate to="/dashboard" />;
};

function Layout({ children }) {
    const { token } = useAuth();
    if (!token) return children;
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a0a12' }}>
            <Navbar />
            <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                        <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
                        <Route path="/projects/:id" element={<PrivateRoute><ProjectDetail /></PrivateRoute>} />
                        <Route path="/applications" element={<PrivateRoute><Applications /></PrivateRoute>} />
                        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
                        <Route path="/stats" element={<PrivateRoute><Stats /></PrivateRoute>} />
                        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
