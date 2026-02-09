import React, { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, Users, Briefcase, Mail, Lock } from 'lucide-react';
import { Role } from '../types';

interface LoginViewProps {
  onLogin: (role: Role, userData?: { id?: string; name?: string; email?: string; avatarUrl?: string }, token?: string) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [hrEmail, setHrEmail] = useState('');
  const [hrPassword, setHrPassword] = useState('');
  const [mgrEmail, setMgrEmail] = useState('');
  const [mgrPassword, setMgrPassword] = useState('');
  const [error, setError] = useState('');
  const [submittingRole, setSubmittingRole] = useState<Role | null>(null);

  const handleAdminLogin = async (role: Role, email: string, password: string) => {
    setError('');
    setSubmittingRole(role);
    try {
      const res = await fetch(`${API_BASE}/api/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message || 'Invalid credentials');
      }
      const data = result.data;
      onLogin(role, {
        id: data.id,
        name: data.fullName || data.name,
        email: data.email,
        avatarUrl: ''
      }, result.token);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmittingRole(null);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteToken = params.get('invite');
    if (!inviteToken) return;

    const consume = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/consume-invite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: inviteToken })
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.message || 'Invalid or expired invite link');
        const { email, tempPassword } = result.data || {};
        if (!email || !tempPassword) throw new Error('Invite link missing credentials');
        setHrEmail(email);
        setHrPassword(tempPassword);
        // Clear query params to avoid repeat
        window.history.replaceState({}, document.title, window.location.pathname);
        await handleAdminLogin('HR', email, tempPassword);
      } catch (err: any) {
        setError(err.message || 'Invite link failed');
      }
    };

    consume();
  }, [API_BASE]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
        
        {/* Left Side: Brand */}
        <div className="text-center md:text-left space-y-6">
          <div className="inline-flex items-center justify-center md:justify-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <span className="text-white font-bold text-2xl">T</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">TopboardAI</h1>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
            Seamless Onboarding <br className="hidden md:block"/> for Modern Teams.
          </h2>
          <p className="text-lg text-slate-600 max-w-md mx-auto md:mx-0">
            Automate your new hire journey, track progress, and ensure a smooth start for everyone.
          </p>
        </div>

        {/* Right Side: Login Cards */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 space-y-8">
          
          {/* Employee Access Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-slate-900">New Employee Access</h3>
            <p className="text-sm text-slate-500">Have an onboarding token from HR?</p>
            <a
              href="/employeelogin"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
            >
              Enter Token & Start Onboarding <ArrowRight size={16} />
            </a>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400">Admin Access</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {/* HR Login */}
            <div className="p-4 border border-gray-100 rounded-xl bg-slate-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                  <Briefcase size={18} />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">HR Admin</div>
                  <div className="text-xs text-slate-500">Manage pipeline</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white">
                  <Mail size={16} className="text-gray-400" />
                  <input
                    type="email"
                    value={hrEmail}
                    onChange={(e) => setHrEmail(e.target.value)}
                    className="w-full text-sm outline-none"
                    placeholder="hr@company.com"
                  />
                </div>
                <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white">
                  <Lock size={16} className="text-gray-400" />
                  <input
                    type="password"
                    value={hrPassword}
                    onChange={(e) => setHrPassword(e.target.value)}
                    className="w-full text-sm outline-none"
                    placeholder="Password"
                  />
                </div>
                <button
                  disabled={submittingRole === 'HR'}
                  onClick={() => handleAdminLogin('HR', hrEmail, hrPassword)}
                  className="w-full bg-slate-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-60"
                >
                  {submittingRole === 'HR' ? 'Signing in...' : 'Sign in as HR'}
                </button>
              </div>
            </div>

            {/* Manager Login */}
            <div className="p-4 border border-gray-100 rounded-xl bg-slate-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                  <Users size={18} />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Manager</div>
                  <div className="text-xs text-slate-500">Track team</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white">
                  <Mail size={16} className="text-gray-400" />
                  <input
                    type="email"
                    value={mgrEmail}
                    onChange={(e) => setMgrEmail(e.target.value)}
                    className="w-full text-sm outline-none"
                    placeholder="manager@company.com"
                  />
                </div>
                <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white">
                  <Lock size={16} className="text-gray-400" />
                  <input
                    type="password"
                    value={mgrPassword}
                    onChange={(e) => setMgrPassword(e.target.value)}
                    className="w-full text-sm outline-none"
                    placeholder="Password"
                  />
                </div>
                <button
                  disabled={submittingRole === 'MANAGER'}
                  onClick={() => handleAdminLogin('MANAGER', mgrEmail, mgrPassword)}
                  className="w-full bg-slate-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-60"
                >
                  {submittingRole === 'MANAGER' ? 'Signing in...' : 'Sign in as Manager'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginView;
