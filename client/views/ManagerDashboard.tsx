import React, { useState, useEffect, useMemo } from 'react';
import { BellRing, Mail, CheckCircle2, Clock } from 'lucide-react';

type TeamMember = {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  startDate?: string;
  status?: string;
  department?: string;
};

type TaskItem = {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
};

const ManagerDashboard: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hrName, setHrName] = useState('');
  const [hrEmail, setHrEmail] = useState('');
  const [hrStatus, setHrStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [tasksByEmployee, setTasksByEmployee] = useState<Record<string, { loading: boolean; tasks: TaskItem[]; error?: string; open: boolean }>>({});

  const statusBadge = useMemo(() => {
    return (status?: string) => {
      const normalized = (status || '').toUpperCase();
      if (normalized === 'COMPLETED') return <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-full bg-green-50 text-green-700 border border-green-100">Completed</span>;
      if (normalized === 'STUCK') return <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-full bg-red-50 text-red-700 border border-red-100">Stuck</span>;
      return <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-full bg-orange-50 text-orange-700 border border-orange-100">Pending</span>;
    };
  }, []);

  useEffect(() => {
    const fetchTeam = async () => {
      setLoadError(null);
      try {
        const res = await fetch('http://localhost:5000/api/manager/team');
        const result = await res.json();
        if (!result.success) throw new Error(result.message || 'Failed to load team');
        setTeam(result.data || []);
      } catch (err: any) {
        setLoadError(err.message || 'Failed to load team');
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const toggleTasks = async (employeeEmail: string) => {
    setTasksByEmployee((prev) => {
      const existing = prev[employeeEmail];
      const open = !existing?.open;
      return { ...prev, [employeeEmail]: { loading: open && !existing?.tasks, tasks: existing?.tasks || [], error: undefined, open } };
    });

    const current = tasksByEmployee[employeeEmail];
    if (current?.tasks && current.tasks.length > 0) return; // already loaded

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

  const handleAddHr = async () => {
    setHrStatus(null);
    if (!hrName || !hrEmail) {
      setHrStatus('Please fill name and email.');
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/add-hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: hrName, email: hrEmail })
      });
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to add HR');
      }
      setHrStatus('HR added and invite sent.');
      setHrName('');
      setHrEmail('');
    } catch (err: any) {
      setHrStatus(err.message || 'Failed to add HR');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Team</h1>
          <p className="text-slate-500">Live data pulled from TopboardAI (no dummy profiles).</p>
        </div>
        <div className="flex gap-4">
             <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
                 <span className="text-sm font-medium text-slate-600">All Systems Operational</span>
             </div>
        </div>
      </div>

      {/* Add HR Admin */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Add HR Admin</h2>
            <p className="text-sm text-slate-500">Create an HR account (writes to Admins table).</p>
          </div>
          <div className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">Manager-only</div>
        </div>
        {hrStatus && (
          <div className={`text-sm px-3 py-2 rounded-lg border ${hrStatus.toLowerCase().includes('added') ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
            {hrStatus}
          </div>
        )}
        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            placeholder="Full name"
            value={hrName}
            onChange={(e) => setHrName(e.target.value)}
          />
          <input
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            placeholder="Email"
            type="email"
            value={hrEmail}
            onChange={(e) => setHrEmail(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleAddHr}
            disabled={isSaving}
            className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : 'Add HR'}
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {loading && (
          <div className="space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-3 w-48 bg-slate-100 rounded" />
                <div className="h-8 w-full bg-slate-50 rounded" />
              </div>
            ))}
          </div>
        )}
        {loadError && <div className="text-red-600 text-sm">{loadError}</div>}
        {!loading && !loadError && team.length === 0 && (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 text-sm text-slate-500 text-center">No team members found yet.</div>
        )}
        {team.map((employee) => (
          <div key={employee.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{employee.fullName || 'Unnamed'}</h3>
                  <p className="text-sm text-slate-500">{employee.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(employee.status)}
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">{employee.role || 'EMPLOYEE'}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                {employee.department && <span className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200">Dept: {employee.department}</span>}
                {employee.startDate && <span className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200">Start: {new Date(employee.startDate).toLocaleDateString()}</span>}
              </div>

              <div className="flex items-center gap-2">
                <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors flex items-center gap-2 shadow-sm">
                  <Mail size={16} className="text-slate-400" /> Message
                </button>
                <button
                  onClick={() => toggleTasks(employee.email)}
                  className="px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors flex items-center gap-2 shadow-sm"
                >
                  View Tasks
                </button>
              </div>
            </div>
            {tasksByEmployee[employee.email]?.open && (
              <div className="border-t border-gray-100 px-5 py-3 bg-slate-50/70">
                {tasksByEmployee[employee.email]?.loading && (
                  <div className="text-sm text-slate-500 flex items-center gap-2">
                    <Clock size={14} /> Loading tasks...
                  </div>
                )}
                {tasksByEmployee[employee.email]?.error && (
                  <div className="text-sm text-red-600">{tasksByEmployee[employee.email]?.error}</div>
                )}
                {!tasksByEmployee[employee.email]?.loading && !tasksByEmployee[employee.email]?.error && (
                  <div className="space-y-2">
                    {(tasksByEmployee[employee.email]?.tasks || []).map((task) => (
                      <div key={task.id} className="flex items-center gap-2 text-sm text-slate-700">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${task.isCompleted ? 'bg-green-100 border-green-200 text-green-600' : 'bg-white border-slate-200 text-slate-400'}`}>
                          {task.isCompleted && <CheckCircle2 size={14} />}
                        </div>
                        <span>{task.title}</span>
                      </div>
                    ))}
                    {(tasksByEmployee[employee.email]?.tasks || []).length === 0 && (
                      <div className="text-sm text-slate-500">No tasks found.</div>
                    )}
                  </div>
                )}
              </div>
            )}
            {employee.status && employee.status.toUpperCase() === 'STUCK' && (
              <div className="bg-red-50 px-5 py-4 border-t border-red-100 flex items-start gap-3">
                <div className="p-2 bg-white rounded-full text-red-600 shadow-sm shrink-0">
                  <BellRing size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-800">Action Required</h4>
                  <p className="text-sm text-red-600 mt-0.5">This team member is marked as stuck. Please follow up.</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagerDashboard;
