import React from 'react';
import { MoreVertical, BellRing, Mail, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { MOCK_EMPLOYEES, COMMON_TASKS } from '../constants';

const ManagerDashboard: React.FC = () => {
  const myTeam = MOCK_EMPLOYEES; // In a real app, filter by manager ID

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Team</h1>
          <p className="text-slate-500">Real-time visibility into your team's onboarding journey.</p>
        </div>
        <div className="flex gap-4">
             <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
                 <span className="text-sm font-medium text-slate-600">All Systems Operational</span>
             </div>
        </div>
      </div>

      <div className="grid gap-6">
        {myTeam.map((employee) => (
          <div key={employee.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Employee Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={employee.avatarUrl} alt={employee.name} className="w-16 h-16 rounded-full border-2 border-white shadow-md object-cover" />
                  <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                    employee.status === 'STUCK' ? 'bg-red-500' : employee.status === 'COMPLETED' ? 'bg-green-500' : 'bg-indigo-500'
                  }`}>
                      {employee.status === 'STUCK' && <AlertTriangle size={10} className="text-white" />}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-900">{employee.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                    <span>{employee.department}</span>
                    <span>•</span>
                    <span>Joined {new Date(employee.startDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors flex items-center gap-2 shadow-sm">
                   <Mail size={16} className="text-slate-400" /> Message
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200">
                   Check-in
                </button>
              </div>
            </div>

            {/* Progress & Tasks */}
            <div className="p-6 bg-slate-50/30">
              <div className="flex items-center justify-between mb-2">
                 <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Onboarding Velocity</h4>
                 <span className="text-sm font-bold text-slate-900">{employee.progress}%</span>
              </div>
              
              <div className="relative pt-1">
                <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-slate-200">
                    <div style={{ width: `${employee.progress}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${employee.status === 'STUCK' ? 'bg-red-500' : 'bg-indigo-600'} transition-all duration-1000`}></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                 {/* Completed Column */}
                 <div>
                    <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 size={16} className="text-green-600" />
                        <h5 className="text-sm font-semibold text-slate-900">Recent Wins</h5>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-2">
                        {employee.tasks.filter(t => t.isCompleted).slice(0, 3).map(t => (
                            <div key={t.id} className="flex items-start gap-2 text-sm text-slate-600">
                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0"></span>
                                <span className="line-through opacity-60">{t.title}</span>
                            </div>
                        ))}
                        {employee.tasks.filter(t => t.isCompleted).length === 0 && (
                            <div className="text-xs text-slate-400 italic">No tasks completed yet.</div>
                        )}
                    </div>
                 </div>

                 {/* Pending Column */}
                 <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Clock size={16} className="text-indigo-600" />
                        <h5 className="text-sm font-semibold text-slate-900">Up Next</h5>
                    </div>
                    {employee.status === 'COMPLETED' ? (
                       <div className="h-24 flex items-center justify-center bg-green-50 rounded-lg border border-green-100 text-green-700 text-sm font-medium">
                           All caught up! 🎉
                       </div> 
                    ) : (
                        <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-3">
                            {employee.tasks.filter(t => !t.isCompleted).slice(0, 2).map(t => (
                                <div key={t.id} className="flex items-start gap-2 text-sm text-slate-800">
                                    <div className="mt-0.5 w-4 h-4 rounded border border-gray-300 flex items-center justify-center shrink-0"></div>
                                    <div className="flex-1">
                                        <p>{t.title}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{t.category}</p>
                                    </div>
                                    {employee.status === 'STUCK' && (
                                        <span className="shrink-0 text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase">Late</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
              </div>
            </div>
            
            {employee.status === 'STUCK' && (
                <div className="bg-red-50 px-6 py-4 border-t border-red-100 flex items-start gap-3">
                    <div className="p-2 bg-white rounded-full text-red-600 shadow-sm shrink-0">
                        <BellRing size={16} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-red-800">Action Required</h4>
                        <p className="text-sm text-red-600 mt-0.5">Alex has been stuck on "Company Mission" for 48 hours. An automated nudge was sent 2 hours ago.</p>
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
