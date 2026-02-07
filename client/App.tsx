import React, { useState } from 'react';
import Layout from './components/Layout';
import LoginView from './views/LoginView';
import HRDashboard from './views/HRDashboard';
import ManagerDashboard from './views/ManagerDashboard';
import NewHireDashboard from './views/NewHireDashboard';
import { Role, User } from './types';
import { MOCK_EMPLOYEES, MOCK_HR, MOCK_MANAGER } from './constants';

const App: React.FC = () => {
  const [role, setRole] = useState<Role>('GUEST');
  const [user, setUser] = useState<User | null>(null);
  
  // View state management (acts as router)
  const [currentView, setCurrentView] = useState('dashboard');

  const handleLogin = (selectedRole: Role) => {
    setRole(selectedRole);
    // Set Mock User based on role
    if (selectedRole === 'HR') {
      setUser(MOCK_HR);
      setCurrentView('dashboard');
    } else if (selectedRole === 'MANAGER') {
      setUser(MOCK_MANAGER);
      setCurrentView('team');
    } else if (selectedRole === 'EMPLOYEE') {
      setUser(MOCK_EMPLOYEES[0]);
      setCurrentView('tasks');
    }
  };

  const handleLogout = () => {
    setRole('GUEST');
    setUser(null);
  };

  const renderContent = () => {
    switch (role) {
      case 'GUEST':
        return <LoginView onLogin={handleLogin} />;
      case 'HR':
        return <HRDashboard currentView={currentView} />;
      case 'MANAGER':
        return <ManagerDashboard />;
      case 'EMPLOYEE':
        return <NewHireDashboard />;
      default:
        return <div>Unknown Role</div>;
    }
  };

  return (
    <Layout 
      user={user} 
      role={role} 
      onLogout={handleLogout}
      currentView={currentView}
      onChangeView={setCurrentView}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
