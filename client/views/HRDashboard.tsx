import React, { useState, useEffect } from 'react';
import { Plus, Search, AlertCircle, CheckCircle2, Clock, MoreHorizontal, RefreshCw, Zap, Server, Mail, Slack, Database, Briefcase, Code } from 'lucide-react';
import { Employee, OnboardingStatus } from '../types';
import { MOCK_EMPLOYEES, COMMON_TASKS, TECH_TASKS, NON_TECH_TASKS } from '../constants';

interface HRDashboardProps {
  currentView: string;
}

const HRDashboard: React.FC<HRDashboardProps> = ({ currentView }) => {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Engineering',
    roleType: 'TECH' as 'TECH' | 'NON_TECH',
    startDate: '',
    manager: 'John Anderson'
  });

  // Automation Simulation State
  const [automationSteps, setAutomationSteps] = useState<{ name: string, status: 'pending' | 'loading' | 'done' }[]>([]);

  // Stats
  const stuckCount = employees.filter(e => e.status === 'STUCK').length;
  const onTrackCount = employees.filter(e => e.status === 'ON_TRACK').length;
  const completedCount = employees.filter(e => e.status === 'COMPLETED').length;

  const handleCreateHire = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate complex Boltic Automation Workflow based on Role Type
    const baseSteps = [
      { name: 'Creating Employee Record in HRIS...', status: 'loading' as const },
      { name: 'Provisioning Google Workspace...', status: 'pending' as const },
      { name: 'Sending Slack Invite...', status: 'pending' as const },
    ];

    const specificSteps = formData.roleType === 'TECH'
      ? [
        { name: 'Provisioning GitHub Access...', status: 'pending' as const },
        { name: 'Setup Jira Engineering Board...', status: 'pending' as const },
      ]
      : [
        { name: 'Provisioning Salesforce Account...', status: 'pending' as const },
        { name: 'Assigning Marketing Assets...', status: 'pending' as const },
      ];

    const finalSteps = [
      { name: 'Dispatching Welcome Email...', status: 'pending' as const },
    ];

    const allSteps = [...baseSteps, ...specificSteps, ...finalSteps];
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

  const finalizeCreation = () => {
    const tasks = formData.roleType === 'TECH'
      ? [...COMMON_TASKS, ...TECH_TASKS]
      : [...COMMON_TASKS, ...NON_TECH_TASKS];

    const newHire: Employee = {
      id: `e${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: 'EMPLOYEE',
      managerId: 'm1',
      department: formData.department,
      roleType: formData.roleType,
      startDate: formData.startDate,
      status: 'NOT_STARTED',
      progress: 0,
      avatarUrl: `https://picsum.photos/200/200?random=${Date.now()}`,
      tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      tasks: tasks,
      syncStatus: {
        emailCreated: true,
        slackInvited: true,
        hrisRecord: true,
        equipmentOrdered: true
      }
    };
    setEmployees([newHire, ...employees]);
    setIsSubmitting(false);
    setIsModalOpen(false);
    setAutomationSteps([]);
    setShowToast(true);
    setFormData({
      name: '',
      email: '',
      department: 'Engineering',
      roleType: 'TECH',
      startDate: '',
      manager: 'John Anderson'
    });
    setTimeout(() => setShowToast(false), 4000);
  };

  const getStatusBadge = (status: OnboardingStatus) => {
    switch (status) {
      case 'ON_TRACK': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">On Track</span>;
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
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">Live</span>
          </h1>
          <p className="text-slate-500">Real-time automation and onboarding pipeline status.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-slate-200"
        >
          <Zap size={18} className="text-yellow-400" />
          Auto-Onboard New Hire
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg"><Zap size={20} /></div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">Last 24h</span>
          </div>
          <p className="text-3xl font-bold">128</p>
          <p className="text-indigo-100 text-sm mt-1">Automations Triggered</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Actions</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stuckCount}</p>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${(stuckCount / employees.length) * 100}%` }}></div>
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
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(onTrackCount / employees.length) * 100}%` }}></div>
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
            <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${(completedCount / employees.length) * 100}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-slate-900">Pipeline Status</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search employees..."
                className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 font-medium">Employee</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Auto-Sync Status</th>
                  <th className="px-6 py-3 font-medium">Progress</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img src={employee.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                      <div>
                        <div className="font-medium text-slate-900">{employee.name}</div>
                        <div className="text-xs text-slate-500">{employee.department}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {employee.roleType === 'TECH' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                          <Code size={10} /> Tech
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                          <Briefcase size={10} /> Non-Tech
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {/* Sync Indicators */}
                      <div className="flex items-center gap-2">
                        <div title="HRIS Record" className={`p-1.5 rounded-full ${employee.syncStatus.hrisRecord ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          <Database size={12} />
                        </div>
                        <div title="Email Created" className={`p-1.5 rounded-full ${employee.syncStatus.emailCreated ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          <Mail size={12} />
                        </div>
                        <div title="Slack Invited" className={`p-1.5 rounded-full ${employee.syncStatus.slackInvited ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          <Slack size={12} />
                        </div>
                        <div title="Hardware Provisioned" className={`p-1.5 rounded-full ${employee.syncStatus.equipmentOrdered ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          <Server size={12} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5 min-w-[60px]">
                          <div
                            className={`h-1.5 rounded-full ${employee.status === 'STUCK' ? 'bg-red-500' : 'bg-indigo-600'
                              }`}
                            style={{ width: `${employee.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{employee.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Feed / Automation Log */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col text-slate-300">
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Boltic Automation Log
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
            <button className="text-xs text-indigo-400 hover:text-indigo-300">View Full Logs</button>
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
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="alex@gmail.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                      <select
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
                        value={formData.department}
                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                      >
                        <option>Engineering</option>
                        <option>Sales</option>
                        <option>Product</option>
                        <option>Marketing</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Role Type</label>
                      <select
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
                        value={formData.roleType}
                        onChange={e => setFormData({ ...formData, roleType: e.target.value as 'TECH' | 'NON_TECH' })}
                      >
                        <option value="TECH">Tech (Dev/IT)</option>
                        <option value="NON_TECH">Non-Tech (Sales/Ops)</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                      <input
                        required
                        type="date"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={formData.startDate}
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-xl flex gap-3 items-start mt-4 border border-indigo-100">
                    <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600 shrink-0">
                      <RefreshCw size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-indigo-900">Automated Workflow Trigger</h4>
                      <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                        Role-based automation active. Will provision {formData.roleType === 'TECH' ? <strong>GitHub & Jira</strong> : <strong>Salesforce & CRM</strong>} alongside standard accounts.
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
                      className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all flex justify-center items-center gap-2"
                    >
                      Start Sync <Zap size={16} className="text-yellow-400" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 relative mb-6">
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Syncing New Hire...</h3>
                  <p className="text-slate-500 text-sm mb-8">Please wait while Boltic automates the setup.</p>

                  <div className="w-full max-w-xs space-y-3">
                    {automationSteps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm transition-all duration-300">
                        {step.status === 'done' && <div className="text-green-500"><CheckCircle2 size={18} /></div>}
                        {step.status === 'loading' && <div className="text-indigo-500 animate-spin"><RefreshCw size={16} /></div>}
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-[slideUp_0.4s_ease-out] z-50">
          <div className="p-2 bg-green-500/20 rounded-full">
            <CheckCircle2 size={24} className="text-green-400" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Onboarding Initiated</h4>
            <p className="text-xs text-slate-400">{formData.name} synced to {formData.roleType === 'TECH' ? 'Engineering' : 'Business'} systems.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;
