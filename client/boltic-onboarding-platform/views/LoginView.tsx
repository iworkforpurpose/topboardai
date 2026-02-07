import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Users, Briefcase } from 'lucide-react';
import { Role } from '../types';

interface LoginViewProps {
  onLogin: (role: Role) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [token, setToken] = useState('');

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      onLogin('EMPLOYEE');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
        
        {/* Left Side: Brand */}
        <div className="text-center md:text-left space-y-6">
          <div className="inline-flex items-center justify-center md:justify-start gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Boltic</h1>
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
          
          {/* Token Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-slate-900">New Employee Access</h3>
            <p className="text-sm text-slate-500">Enter the access token sent to your email.</p>
            <form onSubmit={handleTokenSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="e.g. BLTC-8821-X9"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-mono text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-medium py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                Access Dashboard <ArrowRight size={16} />
              </button>
            </form>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400">Or simulate role</span>
            </div>
          </div>

          {/* Role Simulation Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onLogin('HR')}
              className="p-4 border border-gray-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-100 transition-all group text-left"
            >
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Briefcase size={18} />
              </div>
              <div className="font-semibold text-slate-900">HR Admin</div>
              <div className="text-xs text-slate-500 mt-1">Manage pipeline</div>
            </button>

            <button
              onClick={() => onLogin('MANAGER')}
              className="p-4 border border-gray-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-100 transition-all group text-left"
            >
              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Users size={18} />
              </div>
              <div className="font-semibold text-slate-900">Manager</div>
              <div className="text-xs text-slate-500 mt-1">Track team</div>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginView;
