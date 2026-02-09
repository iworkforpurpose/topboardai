import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckSquare, 
  ChevronRight, 
  Laptop, 
  Briefcase, 
  Code, 
  Clock, 
  ArrowRight, 
  Lock,
  Award,
  MessageCircle,
  Calendar,
  BookOpen,
  Target,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  isCompleted: boolean;
  dueDate?: string;
  link?: string;
}

// Minimal onboarding checklist; ideally sourced from onboarding_tasks table when backend endpoint is ready
const HARDCODED_TASKS: Task[] = [
  {
    id: 'placeholder-1',
    title: 'Did you receive a laptop?',
    description: 'Confirm hardware delivery from IT.',
    category: 'Logistics',
    isCompleted: false,
  },
  {
    id: 'placeholder-2',
    title: 'Did you receive company login details?',
    description: 'Confirm you got your company email and SSO credentials.',
    category: 'Access',
    isCompleted: false,
  },
  {
    id: 'placeholder-3',
    title: 'Did you receive Slack invitation and complete setup?',
    description: 'Join Slack and finish profile setup.',
    category: 'Access',
    isCompleted: false,
  },
];

const NewHireDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>(HARDCODED_TASKS);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken('');
    setEmployeeName('');
    setEmployeeData(null);
    setTasks(HARDCODED_TASKS);
    sessionStorage.removeItem('employeeData');
    navigate('/employeelogin');
  };

  const loadTasks = async (employeeEmail: string) => {
    setIsLoadingTasks(true);
    try {
      const response = await fetch(`${API_BASE}/api/tasks?employeeEmail=${encodeURIComponent(employeeEmail)}`);
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setTasks(result.data.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          category: t.category,
          isCompleted: !!t.isCompleted,
        })));
      } else {
        setTasks(HARDCODED_TASKS);
      }
    } catch (err) {
      console.error('Task fetch error', err);
      setTasks(HARDCODED_TASKS);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token.trim() })
      });

      const result = await response.json();

      if (result.success && result.data) {
        setIsAuthenticated(true);
        setEmployeeName(result.data.fullName);
        setEmployeeData(result.data);
        setError('');
        sessionStorage.setItem('employeeData', JSON.stringify(result.data));
        await loadTasks(result.data.email);
        navigate('/employeelogin');
      } else {
        setError(result.message || 'Invalid token. Please check your email.');
      }
    } catch (err) {
      console.error('Token verification error:', err);
      setError('Failed to verify token. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const totalTasks = tasks.length;
  const progress = Math.round((completedTasks / totalTasks) * 100);
  const pendingTasks = tasks.filter(t => !t.isCompleted);
  const completedTasksList = tasks.filter(t => t.isCompleted);

  const handleTaskToggle = async (taskId: string) => {
    const current = tasks.find(t => t.id === taskId);
    const nextCompleted = !current?.isCompleted;

    setTasks(tasks.map(t => t.id === taskId ? { ...t, isCompleted: nextCompleted } : t));

    try {
      await fetch(`${API_BASE}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: nextCompleted }),
      });
    } catch (err) {
      console.error('Task update failed', err);
    }

    if (nextCompleted) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  useEffect(() => {
    if (completedTasks === totalTasks && isAuthenticated && completedTasks > 0) {
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 }
        });
      }, 500);
    }
  }, [completedTasks, totalTasks, isAuthenticated]);

  useEffect(() => {
    const stored = sessionStorage.getItem('employeeData');
    if (stored) {
      const parsed = JSON.parse(stored);
      setIsAuthenticated(true);
      setEmployeeName(parsed.fullName);
      setEmployeeData(parsed);
      loadTasks(parsed.email).catch(() => setTasks(HARDCODED_TASKS));
    } else if (location.pathname === '/tasks' || location.pathname === '/employeedashboard') {
      navigate('/employeelogin', { replace: true });
    }
  }, [location.pathname, navigate]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Setup': return <Laptop size={18} className="text-orange-500" />;
      case 'Orientation': return <Briefcase size={18} className="text-blue-500" />;
      case 'Technical': return <Code size={18} className="text-purple-500" />;
      case 'Meetings': return <Calendar size={18} className="text-green-500" />;
      default: return <BookOpen size={18} className="text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Setup': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Orientation': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Technical': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Meetings': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Token Input Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg mb-4">
                <Lock size={28} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Fynd! 👋</h1>
              <p className="text-gray-600">Enter your onboarding token to get started</p>
            </div>

            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Onboarding Token
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your token here"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none font-mono text-sm"
                  required
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {error}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Check your email for the token sent by HR at 10:00 AM
                </p>
              </div>

              <button
                type="submit"
                disabled={isVerifying || !token.trim()}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    Access Dashboard <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
              <p className="text-xs text-orange-800">
                <strong>Need help?</strong> Contact HR at hr@fynd.com
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Fynd Onboarding</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{employeeName}</p>
                <p className="text-xs text-gray-500">New Employee</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-semibold text-sm">
                  {employeeName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Banner */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start gap-3 mb-2">
            <span className="text-3xl">✨</span>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Welcome to Fynd, {employeeName.split(' ')[0]}! 👋
              </h2>
              <p className="text-gray-600 mt-1">
                We're excited to have you on board! Let's get you started with your onboarding journey.
              </p>
            </div>
          </div>
          
          {employeeData && (
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="font-medium">Start Date:</span>
                <span>{new Date(employeeData.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Role:</span>
                <span>{employeeData.role}</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Card */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold mb-1">Your Onboarding Progress</h3>
                  <p className="text-orange-100 text-sm">Keep going! You're doing great ⭐</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Target size={24} className="text-white" />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span>Overall Completion</span>
                  <span className="text-2xl font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm overflow-hidden">
                  <div 
                    className="bg-white h-3 rounded-full transition-all duration-500 ease-out shadow-lg" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target size={16} />
                    <span className="text-xs font-medium">Tasks</span>
                  </div>
                  <p className="text-2xl font-bold">{completedTasks}/{totalTasks}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar size={16} />
                    <span className="text-xs font-medium">Days Left</span>
                  </div>
                  <p className="text-2xl font-bold">28</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Award size={16} />
                    <span className="text-xs font-medium">Completed</span>
                  </div>
                  <p className="text-2xl font-bold">{progress}%</p>
                </div>
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    Pending Tasks ({pendingTasks.length})
                  </h3>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {pendingTasks.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <Award size={32} className="text-green-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">All tasks completed! 🎉</h4>
                    <p className="text-gray-600">You've finished your onboarding journey. Welcome to the team!</p>
                  </div>
                ) : (
                  pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => handleTaskToggle(task.id)}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 transition-all ${
                            task.isCompleted
                              ? 'bg-orange-500 border-orange-500'
                              : 'border-gray-300 group-hover:border-orange-500'
                          }`}
                        >
                          {task.isCompleted && (
                            <CheckCircle2 size={16} className="text-white" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                              {task.title}
                            </h4>
                            <span className={`flex-shrink-0 text-xs px-2 py-1 rounded-md border ${getCategoryColor(task.category)}`}>
                              {task.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                          {task.dueDate && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-orange-600">
                              <Clock size={14} />
                              <span className="font-medium">{task.dueDate}</span>
                            </div>
                          )}
                        </div>

                        <ChevronRight size={20} className="text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Completed Tasks */}
            {completedTasksList.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">
                    Completed ({completedTasksList.length})
                  </h3>
                </div>

                <div className="divide-y divide-gray-100">
                  {completedTasksList.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 line-through">{task.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
              </div>
              
              <div className="p-4 space-y-3">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-left group">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">Schedule 1:1</p>
                    <p className="text-xs text-gray-600">Meet with your manager</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </button>

                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors text-left group">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">Team Chat</p>
                    <p className="text-xs text-gray-600">Connect with colleagues</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-green-500 transition-colors" />
                </button>

                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors text-left group">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">View Calendar</p>
                    <p className="text-xs text-gray-600">Check your schedule</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                </button>

                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors text-left group">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">Resources</p>
                    <p className="text-xs text-gray-600">Browse documentation</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewHireDashboard;