import React from 'react';
import { LogOut, LayoutDashboard, Users, UserPlus, Shield } from 'lucide-react';
import { Role, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  role: Role;
  onLogout: () => void;
  currentView: string;
  onChangeView: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, role, onLogout, currentView, onChangeView }) => {
  if (role === 'GUEST') return <>{children}</>;

  const getNavItems = () => {
    switch (role) {
      case 'HR':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ];
      case 'MANAGER':
        return [
          { id: 'managerdashboard', label: 'Team Overview', icon: Users },
        ];
      case 'EMPLOYEE':
        return [
          { id: 'employeedashboard', label: 'My Tasks', icon: LayoutDashboard },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex-shrink-0 sticky top-0 md:h-screen z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="font-bold text-xl text-slate-900">TopboardAI</span>
        </div>

        <div className="px-4 py-2">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-6">
            <img
              src={user?.avatarUrl || (role === 'MANAGER'
                ? 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80'
                : role === 'HR'
                  ? 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80'
                  : 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80')}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover border border-white shadow-sm"
            />
            <div className="overflow-hidden">
              <p className="font-medium text-sm text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{role.toLowerCase()}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {getNavItems().map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onChangeView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-white md:bg-transparent">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
