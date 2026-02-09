import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import LoginView from './views/LoginView';
import HRDashboard from './views/HRDashboard';
import ManagerDashboard from './views/ManagerDashboard';
import NewHireDashboard from './views/NewHireDashboard';
import { Role, User } from './types';
import { MOCK_EMPLOYEES, MOCK_HR, MOCK_MANAGER } from './constants';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Employee login + dashboard */}
        <Route path="/employeelogin" element={<NewHireDashboard />} />
        <Route path="/employeedashboard" element={<Navigate to="/employeelogin" replace />} />
        <Route path="/tasks" element={<Navigate to="/employeelogin" replace />} />

        {/* All other routes - use wildcard to capture all */}
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
};

const MainApp: React.FC = () => {
  const [role, setRole] = useState<Role>('GUEST');
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Load persisted session on refresh
  useEffect(() => {
    const saved = localStorage.getItem('adminSession');
    if (!saved) {
      setIsBootstrapping(false);
      return;
    }
    try {
      const parsed = JSON.parse(saved) as { token: string; role: Role };
      fetch('http://localhost:5000/api/auth/admin-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${parsed.token}` },
        body: JSON.stringify({ token: parsed.token })
      })
        .then(async (res) => {
          const body = await res.json();
          if (!body.success) throw new Error(body.message || 'Invalid session');
          const payload = body.data;
          const rawRole = (payload.role as Role) || parsed.role;
          const restoredRole: Role = rawRole === 'HR ADMIN' ? 'HR' : rawRole;
          setRole(restoredRole);
          setUser({
            id: payload.id || 'admin',
            name: payload.email?.split('@')[0] || 'Admin',
            email: payload.email || '',
            role: restoredRole,
            avatarUrl: ''
          });
          navigate(restoredRole === 'MANAGER' ? '/managerdashboard' : '/dashboard', { replace: true });
        })
        .catch((err) => {
          console.error('Session restore failed', err.message);
          localStorage.removeItem('adminSession');
        })
        .finally(() => setIsBootstrapping(false));
    } catch (err) {
      console.error('Session parse failed');
      localStorage.removeItem('adminSession');
      setIsBootstrapping(false);
    }
  }, [navigate]);

  const handleLogin = (selectedRole: Role, userData?: Partial<User>, token?: string) => {
    setRole(selectedRole);
    // Set User based on role
    if (selectedRole === 'HR') {
      setUser(userData ? {
        id: userData.id || 'hr-1',
        name: userData.name || 'HR Admin',
        email: userData.email || 'hr@example.com',
        role: 'HR',
        avatarUrl: userData.avatarUrl || ''
      } : MOCK_HR);
      if (token) localStorage.setItem('adminSession', JSON.stringify({ token, role: 'HR' }));
      navigate('/dashboard');
    } else if (selectedRole === 'MANAGER') {
      setUser(userData ? {
        id: userData.id || 'mgr-1',
        name: userData.name || 'Manager',
        email: userData.email || 'manager@example.com',
        role: 'MANAGER',
        avatarUrl: userData.avatarUrl || ''
      } : MOCK_MANAGER);
      if (token) localStorage.setItem('adminSession', JSON.stringify({ token, role: 'MANAGER' }));
      navigate('/managerdashboard');
    } else if (selectedRole === 'EMPLOYEE') {
      setUser(MOCK_EMPLOYEES[0]);
      navigate('/employeelogin');
    }
  };

  const handleLogout = () => {
    setRole('GUEST');
    setUser(null);
    localStorage.removeItem('adminSession');
    navigate('/');
  };

  // Protected Route wrapper - memoized to prevent re-renders
  const ProtectedRoute = useMemo(() => {
    return ({ children, allowedRole }: { children: React.ReactNode, allowedRole: Role }) => {
      if (role === 'GUEST') {
        return <Navigate to="/" replace />;
      }
      if (role !== allowedRole) {
        return <Navigate to="/" replace />;
      }
      return <>{children}</>;
    };
  }, [role]);

  if (isBootstrapping) {
    return <div className="min-h-screen flex items-center justify-center text-slate-600">Loading session...</div>;
  }

  return (
    <Layout 
      user={user} 
      role={role} 
      onLogout={handleLogout}
      currentView={location.pathname.split('/')[1] || 'dashboard'}
      onChangeView={(view) => navigate(`/${view}`)}
    >
      <Routes>
        <Route path="/" element={
          role === 'GUEST'
            ? <LoginView onLogin={handleLogin} />
            : role === 'MANAGER'
                ? <Navigate to="/managerdashboard" replace />
              : <Navigate to="/dashboard" replace />
        } />
        
        {/* HR Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRole="HR">
            <HRDashboard currentView="dashboard" />
          </ProtectedRoute>
        } />
        
        {/* Manager Routes */}
        <Route path="/managerdashboard" element={
          <ProtectedRoute allowedRole="MANAGER">
            <ManagerDashboard />
          </ProtectedRoute>
        } />

        {/* Legacy admin login aliases route back to root login */}
        <Route path="/hrlogin" element={<Navigate to="/" replace />} />
        <Route path="/managerlogin" element={<Navigate to="/" replace />} />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
