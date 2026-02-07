import React, { useState, useEffect } from 'react';
import { CheckSquare, ExternalLink, Calendar, Trophy, ChevronRight, Gift, ArrowRight, Laptop, Briefcase, Code } from 'lucide-react';
import { Task, Employee, TaskCategory } from '../types';
import { MOCK_EMPLOYEES } from '../constants';
import BolticChat from '../components/BolticChat';
import confetti from 'canvas-confetti';

const NewHireDashboard: React.FC = () => {
  // Simulate logged in user
  const [user, setUser] = useState<Employee>(MOCK_EMPLOYEES[0]);
  const [tasks, setTasks] = useState<Task[]>(user.tasks);

  const pendingTasks = tasks.filter(t => !t.isCompleted).length;
  const progress = Math.round(((tasks.length - pendingTasks) / tasks.length) * 100);

  const handleTaskToggle = (taskId: string) => {
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    setTasks(updatedTasks);
    
    // Check if task completed
    const task = updatedTasks.find(t => t.id === taskId);
    if (task?.isCompleted) {
        // Trigger small confetti
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 }
        });
    }
  };

  useEffect(() => {
    // If all tasks complete
    if (pendingTasks === 0) {
        setTimeout(() => {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 }
            });
        }, 500);
    }
  }, [pendingTasks]);

  const taskGroups: Record<TaskCategory, Task[]> = {
    'Pre-boarding': tasks.filter(t => t.category === 'Pre-boarding'),
    'Orientation': tasks.filter(t => t.category === 'Orientation'),
    'Role Specific': tasks.filter(t => t.category === 'Role Specific'),
  };

  const getCategoryIcon = (category: TaskCategory) => {
    switch (category) {
        case 'Pre-boarding': return <Laptop size={20} className="text-indigo-600" />;
        case 'Orientation': return <Briefcase size={20} className="text-indigo-600" />;
        case 'Role Specific': return <Code size={20} className="text-indigo-600" />;
    }
  };

  const getCategoryTitle = (category: TaskCategory) => {
    switch (category) {
        case 'Pre-boarding': return 'Hardware & Essentials';
        case 'Orientation': return 'Day 1 - Orientation';
        case 'Role Specific': return `${user.roleType === 'TECH' ? 'Engineering' : 'Department'} Onboarding`;
    }
  };

  return (
    <div className="relative min-h-[80vh] pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
                <h1 className="text-4xl font-bold mb-3 tracking-tight">Welcome aboard, {user.name.split(' ')[0]}! 👋</h1>
                <p className="text-slate-300 text-lg leading-relaxed max-w-lg">
                    We've prepared a personalized {user.roleType === 'TECH' ? 'Engineering' : ''} onboarding plan for you.
                </p>
                
                <div className="mt-8">
                    <div className="flex justify-between text-sm font-medium mb-2 text-slate-300">
                        <span>Onboarding Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-sm">
                        <div 
                            className="bg-indigo-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
            
            {/* Right side of banner - Next Action */}
            <div className="hidden md:block">
                 <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
                    <h3 className="text-indigo-300 font-semibold text-sm uppercase tracking-wider mb-2">Up Next</h3>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-600 rounded-lg text-white">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold">Team Intro Meeting</h4>
                            <p className="text-slate-300 text-sm mt-1">Today, 2:00 PM • Google Meet</p>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Task List (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-8">
            {(Object.keys(taskGroups) as TaskCategory[]).map((category) => {
                const categoryTasks = taskGroups[category];
                if (categoryTasks.length === 0) return null;

                return (
                    <div key={category}>
                        <div className="flex items-center gap-3 mb-4">
                             <div className="p-2 bg-indigo-50 rounded-lg">
                                {getCategoryIcon(category)}
                             </div>
                             <h2 className="text-xl font-bold text-slate-800">{getCategoryTitle(category)}</h2>
                             <span className="h-px flex-1 bg-gray-200"></span>
                        </div>
                        
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {categoryTasks.map(task => (
                                    <div 
                                        key={task.id} 
                                        className={`p-5 flex gap-5 transition-all group ${
                                            task.isCompleted ? 'bg-gray-50/50 opacity-75' : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        <button 
                                            onClick={() => handleTaskToggle(task.id)}
                                            className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                                                task.isCompleted 
                                                    ? 'bg-indigo-600 border-indigo-600 text-white scale-100' 
                                                    : 'border-gray-300 hover:border-indigo-400 text-transparent scale-95 hover:scale-100'
                                            }`}
                                        >
                                            <CheckSquare size={14} fill="currentColor" />
                                        </button>
                                        
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className={`font-semibold text-lg text-slate-900 ${task.isCompleted ? 'line-through text-slate-400' : ''}`}>
                                                    {task.title}
                                                </h3>
                                                {task.isCompleted && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">COMPLETED</span>}
                                            </div>
                                            
                                            <p className={`text-slate-500 mt-1 leading-relaxed ${task.isCompleted ? 'text-slate-400' : ''}`}>
                                                {task.description}
                                            </p>
                                            
                                            {!task.isCompleted && task.link && (
                                                <div className="mt-3">
                                                    <a href={task.link} className="inline-flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                                                        Start Task <ArrowRight size={14} />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Sidebar Widgets (Right col) */}
        <div className="space-y-6">
            {/* Rewards Card */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-orange-100 shadow-sm p-6 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-yellow-500">
                         <Trophy size={24} />
                    </div>
                    <h3 className="font-bold text-slate-900">Swag Unlocks</h3>
                </div>
                <p className="text-slate-600 text-sm mb-4 relative z-10">
                    Complete all "Orientation" tasks to unlock your personalized company swag box! 🎁
                </p>
                <div className="p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/50 flex items-center justify-between relative z-10">
                    <span className="text-sm font-medium text-slate-700">Progress</span>
                    <span className="text-xs font-bold bg-slate-800 text-white px-2 py-1 rounded-full">{progress}%</span>
                </div>
                {/* Decor */}
                <Gift className="absolute -bottom-4 -right-4 text-orange-200 opacity-50" size={100} />
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 mb-4">Quick Resources</h3>
                <ul className="space-y-3">
                    <li>
                        <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 group">
                            <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors"><ExternalLink size={14} /></span>
                            <span className="text-sm font-medium">Employee Handbook</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 group">
                            <span className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100 transition-colors"><ExternalLink size={14} /></span>
                            <span className="text-sm font-medium">IT Support Portal</span>
                        </a>
                    </li>
                </ul>
            </div>

            {/* AI Helper Teaser */}
            <div className="bg-indigo-900 rounded-xl p-6 text-white relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]">
                <div className="relative z-10">
                    <h3 className="font-bold mb-2 text-lg">Questions?</h3>
                    <p className="text-indigo-200 text-sm mb-4">
                        "What is the wifi password?"<br/>"When is payday?"
                    </p>
                    <div className="flex items-center gap-2 text-sm font-medium text-white/90 group-hover:text-white">
                        Ask Boltic Assistant <ChevronRight size={16} />
                    </div>
                </div>
                {/* Decoration */}
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                    </svg>
                </div>
            </div>
        </div>
      </div>

      <BolticChat />
    </div>
  );
};

export default NewHireDashboard;
