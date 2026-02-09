import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, AlertCircle, CheckCircle2, Clock, MoreHorizontal, RefreshCw, Zap, Server, Mail, Slack, Database, Briefcase, Code } from 'lucide-react';
import { Employee, OnboardingStatus } from '../types';
import { MOCK_EMPLOYEES, COMMON_TASKS, TECH_TASKS, NON_TECH_TASKS } from '../constants';

interface HRDashboardProps {
  currentView: string;
}

const HRDashboard: React.FC<HRDashboardProps> = ({ currentView }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [tasksByEmployee, setTasksByEmployee] = useState<Record<string, { loading: boolean; tasks: { id: string; title: string; isCompleted: boolean }[]; error?: string; open: boolean }>>({});
  const prefetchedEmailsRef = useRef<Set<string>>(new Set());

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Engineering',
    startDate: '',
    manager: 'John Anderson'
  });

  // Automation Simulation State
  const [automationSteps, setAutomationSteps] = useState<{ name: string, status: 'pending' | 'loading' | 'done' }[]>([]);

  const mapStatus = (rawStatus: string | undefined | null): OnboardingStatus => {
    const value = (rawStatus || '').toString().toLowerCase();
    if (value.includes('complete')) return 'COMPLETED';
    if (value.includes('progress') || value.includes('active') || value.includes('track')) return 'ON_TRACK';
    if (value.includes('stuck') || value.includes('block')) return 'STUCK';
    return 'NOT_STARTED';
  };

  // Fetch employees from API
  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (isLoading || employees.length === 0) return;
    employees.forEach((emp) => {
      if (!prefetchedEmailsRef.current.has(emp.email)) {
        prefetchedEmailsRef.current.add(emp.email);
        fetchTasksSilently(emp.email);
      }
    });
  }, [isLoading, employees]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      console.log('🔄 Fetching employees from API...');
      const response = await fetch('http://localhost:5000/api/hr/employees');
      console.log('📡 Response status:', response.status);
      const result = await response.json();
      console.log('📦 API Response:', result);
      
      if (result.success && result.data) {
        console.log(`✅ Received ${result.data.length} employees from database`);
        // Map TopboardAI data to frontend Employee type
        const mappedEmployees = result.data.map((record: any) => {
          // Determine department based on job title
          const jobTitle = (record.role || '').toLowerCase();
          let department = 'Other';
          let roleType = 'NON_TECH';
          
          if (jobTitle.includes('engineer') || jobTitle.includes('developer') || 
              jobTitle.includes('sde') || jobTitle.includes('software') || 
              jobTitle.includes('programmer') || jobTitle.includes('tech')) {
            department = 'Engineering';
            roleType = 'TECH';
          } else if (jobTitle.includes('sales') || jobTitle.includes('business development')) {
            department = 'Sales';
          } else if (jobTitle.includes('product') || jobTitle.includes('pm')) {
            department = 'Product';
          } else if (jobTitle.includes('marketing') || jobTitle.includes('growth') || 
                     jobTitle.includes('brand')) {
            department = 'Marketing';
          }
          
          const fullName = record.fullName || record.full_name || record.name || 'New Hire';
          const email = record.email || record.personal_email || record.work_email || '';
          const startDate = record.startDate || record.start_date || new Date().toISOString();
          const status = mapStatus(record.status);
          const parsedProgress = Number(record.progress);
          const progress = Number.isFinite(parsedProgress) ? Math.max(0, Math.min(parsedProgress, 100)) : 0;
          return {
            id: record.id,
            name: fullName,
            email,
            role: 'EMPLOYEE',
            managerId: 'm1',
            department: department,
            roleType: roleType,
            startDate,
            status,
            progress,
            avatarUrl: '',
            tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            tasks: [],
            syncStatus: {
              emailCreated: false,
              slackInvited: false,
              hrisRecord: true,
              equipmentOrdered: false
            }
          };
        });
        
        // Sort by start date (earliest first)
        mappedEmployees.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        
        console.log('📋 Setting employees state with:', mappedEmployees.length, 'employees');
        setEmployees(mappedEmployees);
      } else {
        console.warn('⚠️ API response missing success or data:', result);
        setLoadError(result.message || 'No data returned from server');
      }
    } catch (error) {
      console.error('❌ Error fetching employees:', error);
      setLoadError('Failed to load employees. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const displayedEmployees = normalizedSearch
    ? employees.filter((e) => {
        return (
          (e.name && e.name.toLowerCase().includes(normalizedSearch)) ||
          (e.email && e.email.toLowerCase().includes(normalizedSearch)) ||
          (e.department && e.department.toLowerCase().includes(normalizedSearch)) ||
          (e.status && e.status.toLowerCase().includes(normalizedSearch))
        );
      })
    : employees;

  const getProgress = (employee: Employee): number => {
    const entry = tasksByEmployee[employee.email];
    const tasks = entry?.tasks || [];
    if (tasks.length > 0) {
      const done = tasks.filter((t) => t.isCompleted).length;
      return Math.round((done / tasks.length) * 100);
    }
    return Math.round(employee.progress || 0);
  };

  const toggleTasks = async (employeeEmail: string) => {
    setTasksByEmployee((prev) => {
      const existing = prev[employeeEmail];
      const open = !existing?.open;
      return { ...prev, [employeeEmail]: { loading: open && !existing?.tasks, tasks: existing?.tasks || [], error: undefined, open } };
    });

    const current = tasksByEmployee[employeeEmail];
    if (current?.tasks && current.tasks.length > 0) return;

    try {
      const res = await fetch(`http://localhost:5000/api/tasks?employeeEmail=${encodeURIComponent(employeeEmail)}`);
      const result = await res.json();
      if (!result.success) throw new Error(result.message || 'Failed to load tasks');
      setTasksByEmployee((prev) => ({
        ...prev,
        [employeeEmail]: { loading: false, tasks: result.data || [], error: undefined, open: true },
      }));
    } catch (err: any) {
      setTasksByEmployee((prev) => ({
        ...prev,
        [employeeEmail]: { loading: false, tasks: [], error: err.message || 'Failed to load tasks', open: true },
      }));
    }
  };

  const fetchTasksSilently = async (employeeEmail: string) => {
    setTasksByEmployee((prev) => {
      const existing = prev[employeeEmail];
      return {
        ...prev,
        [employeeEmail]: {
          loading: true,
          tasks: existing?.tasks || [],
          error: undefined,
          open: existing?.open || false,
        },
      };
    });

    try {
      const res = await fetch(`http://localhost:5000/api/tasks?employeeEmail=${encodeURIComponent(employeeEmail)}`);
      const result = await res.json();
      if (!result.success) throw new Error(result.message || 'Failed to load tasks');
      setTasksByEmployee((prev) => ({
        ...prev,
        [employeeEmail]: {
          loading: false,
          tasks: result.data || [],
          error: undefined,
          open: prev[employeeEmail]?.open || false,
        },
      }));
    } catch (err: any) {
      setTasksByEmployee((prev) => ({
        ...prev,
        [employeeEmail]: {
          loading: false,
          tasks: prev[employeeEmail]?.tasks || [],
          error: err.message || 'Failed to load tasks',
          open: prev[employeeEmail]?.open || false,
        },
      }));
    }
  };

  // Stats
  const notStartedCount = employees.filter(e => e.status === 'NOT_STARTED').length;
  const onTrackCount = employees.filter(e => e.status === 'ON_TRACK').length;
  const completedCount = employees.filter(e => e.status === 'COMPLETED').length;
  const totalCount = employees.length || 1;

  const handleCreateHire = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate complex TopboardAI Automation Workflow
    const allSteps = [
      { name: 'Creating Employee Record in HRIS...', status: 'loading' as const },
      { name: 'Provisioning Google Workspace...', status: 'pending' as const },
      { name: 'Sending Slack Invite...', status: 'pending' as const },
      { name: 'Dispatching Welcome Email...', status: 'pending' as const },
    ];
    setAutomationSteps(allSteps);

    const runStep = (index: number) => {
      if (index >= allSteps.length) {
        finalizeCreation();
        return;
      }

      setTimeout(() => {
        setAutomationSteps(prev => prev.map((step, i) => {
          if (i === index) return { ...step, status: 'done' };
          if (i === index + 1) return { ...step, status: 'loading' };
          return step;
        }));
        runStep(index + 1);
      }, 800);
    };

    runStep(0);
  };

  const finalizeCreation = async () => {
    try {
      // Call backend API to create employee
      const payload = {
        full_name: formData.name,
        email: formData.email,
        role: formData.department,
        start_date: formData.startDate,
        manager_id: 'm1'
      };
      
      console.log('📤 Sending payload to create employee:', payload);
      
      const response = await fetch('http://localhost:5000/api/hr/new-hire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log('📥 Server response:', result);

      if (result.success) {
        // Refresh employees list from database
        await fetchEmployees();
        
        setIsSubmitting(false);
        setIsModalOpen(false);
        setAutomationSteps([]);
        setShowToast(true);
        setFormData({
          name: '',
          email: '',
          department: 'Engineering',
          startDate: '',
          manager: 'John Anderson'
        });
        setTimeout(() => setShowToast(false), 4000);
      } else {
        throw new Error(result.message || 'Failed to create employee');
      }
    } catch (error: any) {
      console.error('❌ Error creating employee:', error);
      console.error('Error details:', error.message);
      setIsSubmitting(false);
      setAutomationSteps([]);
      alert(`Failed to create employee: ${error.message || 'Please try again.'}`);
    }
  };

  const getStatusBadge = (status: OnboardingStatus) => {
    switch (status) {
      case 'ON_TRACK': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">On Track</span>;
      case 'STUCK': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Stuck</span>;
      case 'COMPLETED': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Syncing...</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            HR Command Center
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">Live</span>
          </h1>
          <p className="text-slate-500">Real-time automation and onboarding pipeline status powered by TopboardAI.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-2 font-medium shadow-lg shadow-orange-200"
        >
          <Zap size={18} className="text-white" />
          Auto-Onboard New Hire
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg"><Zap size={20} /></div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">Last 24h</span>
          </div>
          <p className="text-3xl font-bold">128</p>
          <p className="text-orange-100 text-sm mt-1">Automations Triggered</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Not Started</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{notStartedCount}</p>
            </div>
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-600">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-gray-500 h-1.5 rounded-full" style={{ width: `${(notStartedCount / totalCount) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Onboarding</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{onTrackCount}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <Clock size={20} />
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(onTrackCount / totalCount) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Fully Onboarded</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{completedCount}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${(completedCount / totalCount) * 100}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col max-h-[600px]">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-slate-900">Pipeline Status</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Employee</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Start Date</th>
                  <th className="px-6 py-4 font-medium">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">
                      Loading employees...
                    </td>
                  </tr>
                ) : loadError ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-red-600 text-sm">{loadError}</td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      No employees found. Create your first hire!
                    </td>
                  </tr>
                ) : (
                  displayedEmployees.map((employee) => (
                    <React.Fragment key={employee.id}>
                      <tr className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {employee.avatarUrl ? (
                              <img src={employee.avatarUrl} alt="" className="w-10 h-10 rounded-full ring-2 ring-gray-100 object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full ring-2 ring-gray-100 bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-semibold">
                                {employee.name?.charAt(0) || '?'}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-slate-900 leading-tight">{employee.name}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{employee.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-middle">
                          {employee.department === 'Engineering' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700">
                              <Code size={12} /> Tech
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-orange-50 text-orange-700">
                              <Briefcase size={12} /> Non-Tech
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">
                          {new Date(employee.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          <div className="text-xs text-slate-500">{new Date(employee.startDate).toLocaleDateString(undefined, { weekday: 'long' })}</div>
                        </td>
                        <td className="px-6 py-4 w-48">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${employee.status === 'COMPLETED' ? 'bg-green-500' : employee.status === 'STUCK' ? 'bg-red-500' : 'bg-blue-600'}`}
                                style={{ width: `${Math.min(Math.max(getProgress(employee), 0), 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-slate-600 font-medium min-w-[32px] text-right">{Math.round(getProgress(employee))}%</span>
                          </div>
                        </td>
                      </tr>
                      {tasksByEmployee[employee.email]?.open && (
                        <tr className="bg-slate-50/70">
                          <td colSpan={4} className="px-6 py-4">
                            <div className="rounded-xl border border-slate-100 bg-white shadow-sm p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 text-slate-700 font-medium">
                                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                  Onboarding Checklist
                                </div>
                                {tasksByEmployee[employee.email]?.loading && (
                                  <div className="text-xs text-slate-500 flex items-center gap-2">
                                    <Clock size={14} /> Loading tasks...
                                  </div>
                                )}
                                {tasksByEmployee[employee.email]?.error && (
                                  <div className="text-xs text-red-600">{tasksByEmployee[employee.email]?.error}</div>
                                )}
                              </div>

                              {!tasksByEmployee[employee.email]?.loading && !tasksByEmployee[employee.email]?.error && (
                                <div className="grid gap-2">
                                  {(tasksByEmployee[employee.email]?.tasks || []).map((task) => (
                                    <div
                                      key={task.id}
                                      className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 hover:border-orange-200 transition"
                                    >
                                      <div
                                        className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${task.isCompleted ? 'bg-green-100 border-green-200 text-green-600' : 'bg-white border-slate-200 text-slate-400'}`}
                                      >
                                        {task.isCompleted && <CheckCircle2 size={14} />}
                                      </div>
                                      <div className="text-sm text-slate-800 leading-snug">{task.title}</div>
                                    </div>
                                  ))}
                                  {(tasksByEmployee[employee.email]?.tasks || []).length === 0 && (
                                    <div className="text-sm text-slate-500">No tasks found.</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Feed / Automation Log */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col text-slate-300">
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              TopboardAI Automation Log
            </h3>
            <span className="text-xs font-mono text-slate-500">v2.1.0 running</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
            <div className="flex gap-3">
              <span className="text-slate-500 shrink-0">10:42:15</span>
              <div>
                <span className="text-blue-400">INFO</span> Sync triggered for <span className="text-white">Neo Thomas</span> (Engineering).
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-slate-500 shrink-0">10:42:18</span>
              <div>
                <span className="text-green-400">SUCCESS</span> GitHub Organization Invite sent.
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-slate-500 shrink-0">10:42:20</span>
              <div>
                <span className="text-green-400">SUCCESS</span> Slack invite sent to #engineering-team.
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-slate-500 shrink-0">10:45:00</span>
              <div>
                <span className="text-yellow-400">WARN</span> <span className="text-white">Morpheus Lawrence</span> pending task: "IT Security" {'>'} 24h.
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-slate-500 shrink-0">10:45:01</span>
              <div>
                <span className="text-blue-400">ACTION</span> Reminder email triggered for Morpheus.
              </div>
            </div>
          </div>
          <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
            <button className="text-xs text-orange-400 hover:text-orange-300">View Full Logs</button>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-slate-900">Initiate Onboarding</h2>
              <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <div className="p-6">
              {!isSubmitting ? (
                <form onSubmit={handleCreateHire} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                      <input
                        required
                        type="text"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        placeholder="e.g. Alex Johnson"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Personal Email</label>
                      <input
                        required
                        type="email"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        placeholder="alex@gmail.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                      <select
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all bg-white"
                        value={formData.department}
                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                      >
                        <option>Engineering</option>
                        <option>Sales</option>
                        <option>Product</option>
                        <option>Marketing</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                      <input
                        required
                        type="date"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        value={formData.startDate}
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-xl flex gap-3 items-start mt-4 border border-orange-100">
                    <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600 shrink-0">
                      <RefreshCw size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-orange-900">Automated Workflow Trigger</h4>
                      <p className="text-xs text-orange-700 mt-1 leading-relaxed">
                        Automation will provision standard accounts including <strong>Google Workspace</strong> and <strong>Slack</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-200 transition-all flex justify-center items-center gap-2"
                    >
                      Start Sync <Zap size={16} className="text-white" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 relative mb-6">
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Syncing New Hire...</h3>
                  <p className="text-slate-500 text-sm mb-8">Please wait while TopboardAI automates the setup.</p>

                  <div className="w-full max-w-xs space-y-3">
                    {automationSteps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm transition-all duration-300">
                        {step.status === 'done' && <div className="text-green-500"><CheckCircle2 size={18} /></div>}
                        {step.status === 'loading' && <div className="text-orange-500 animate-spin"><RefreshCw size={16} /></div>}
                        {step.status === 'pending' && <div className="text-gray-300"><Clock size={18} /></div>}

                        <span className={`${step.status === 'pending' ? 'text-gray-400' : 'text-slate-700 font-medium'}`}>
                          {step.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border-2 border-orange-200 text-slate-900 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-[slideUp_0.4s_ease-out] z-50">
          <div className="p-2 bg-orange-500 rounded-full">
            <CheckCircle2 size={24} className="text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">Onboarding Initiated</h4>
            <p className="text-xs text-slate-600">{formData.name} synced to company systems.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;
