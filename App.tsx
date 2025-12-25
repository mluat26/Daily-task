
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Clock, 
  BrainCircuit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  Target,
  CheckCheck,
  Banknote,
  Flame,
  Palette,
  Edit2,
  Save,
  X,
  Sun,
  Moon,
  Coins
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import { Project, ProjectStatus, PaymentStatus, Task } from './types';
import { getWorkloadAdvice, parseTasksFromText } from './services/geminiService';

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const TASK_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Violet', value: '#8b5cf6' },
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    clientName: 'Công ty ABC',
    projectName: 'Thiết kế Key Visual Tết',
    description: 'Thiết kế bộ nhận diện cho chiến dịch Tết 2025.',
    status: ProjectStatus.IN_PROGRESS,
    deadline: '2024-12-25',
    budget: 15000000,
    tasks: [
      { id: 't1', title: 'Phác thảo ý tưởng', dueDate: '2024-12-10', completed: true, color: '#6366f1' },
      { id: 't2', title: 'Hoàn thiện bản vẽ', dueDate: '2024-12-20', completed: false, color: '#f43f5e' }
    ],
    paymentStatus: PaymentStatus.PENDING,
    createdAt: new Date().toISOString(),
    isUrgent: true
  }
];

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('ff_projects_v7');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('ff_theme') === 'dark');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'finance'>('dashboard');
  const [projectFilter, setProjectFilter] = useState<'all' | 'urgent' | 'active' | 'completed'>('all');
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [creationMode, setCreationMode] = useState<'manual' | 'ai'>('ai');
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isParsingTasks, setIsParsingTasks] = useState(false);
  const [formDeadline, setFormDeadline] = useState('');

  useEffect(() => {
    localStorage.setItem('ff_projects_v7', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('ff_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const stats = useMemo(() => {
    const totalEarned = projects.filter(p => p.paymentStatus === PaymentStatus.PAID).reduce((sum, p) => sum + p.budget, 0);
    const pendingInvoices = projects.filter(p => p.paymentStatus === PaymentStatus.PENDING).reduce((sum, p) => sum + p.budget, 0);
    const totalTasks = projects.reduce((sum, p) => sum + p.tasks.length, 0);
    const completedTasks = projects.reduce((sum, p) => sum + p.tasks.filter(t => t.completed).length, 0);
    const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    return { totalEarned, pendingInvoices, overallProgress, activeCount: projects.filter(p => p.status !== ProjectStatus.COMPLETED).length };
  }, [projects]);

  const chartData = useMemo(() => {
    return projects.map(p => {
      const completed = p.tasks.filter(t => t.completed).length;
      const total = p.tasks.length;
      return {
        name: p.projectName.length > 12 ? p.projectName.substring(0, 10) + '...' : p.projectName,
        budget: p.budget / 1000000,
        progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  }, [projects]);

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, ...updates } : p));
  };

  const updateTask = (projectId: string, taskId: string, updates: Partial<Task>) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
        };
      }
      return p;
    }));
  };

  const addTaskToProject = (projectId: string, title: string) => {
    if (!title.trim()) return;
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      dueDate: new Date().toISOString().split('T')[0],
      completed: false,
      color: TASK_COLORS[Math.floor(Math.random() * TASK_COLORS.length)].value
    };
    setProjects(projects.map(p => p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p));
  };

  const handleSmartTasksBlur = async (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.trim() && creationMode === 'ai') {
      setIsParsingTasks(true);
      const aiTasks = await parseTasksFromText(text);
      if (aiTasks.length > 0) {
        const dates = aiTasks.map(t => new Date(t.dueDate || '').getTime()).filter(d => !isNaN(d));
        if (dates.length > 0) {
          const latest = new Date(Math.max(...dates));
          setFormDeadline(latest.toISOString().split('T')[0]);
        }
      }
      setIsParsingTasks(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let parsedTasks: Task[] = [];
    if (creationMode === 'ai') {
      const rawTasks = formData.get('smartTasks') as string;
      setIsParsingTasks(true);
      const aiTasks = await parseTasksFromText(rawTasks);
      parsedTasks = aiTasks.map((t, idx) => ({
        id: Math.random().toString(36).substr(2, 9),
        title: t.title || 'Công việc không tên',
        dueDate: t.dueDate || new Date().toISOString().split('T')[0],
        completed: false,
        color: TASK_COLORS[idx % TASK_COLORS.length].value
      }));
      setIsParsingTasks(false);
    }

    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      clientName: formData.get('clientName') as string,
      projectName: formData.get('projectName') as string,
      description: (formData.get('description') as string) || '',
      status: ProjectStatus.PLANNING,
      deadline: formDeadline || (formData.get('deadline') as string) || new Date().toISOString().split('T')[0],
      budget: Number(formData.get('budget')),
      tasks: parsedTasks,
      paymentStatus: PaymentStatus.PENDING,
      createdAt: new Date().toISOString(),
      isUrgent: formData.get('isUrgent') === 'on'
    };
    
    setProjects([...projects, newProject]);
    setIsAddingProject(false);
    setFormDeadline('');
  };

  const filteredProjects = projects.filter(p => {
    if (projectFilter === 'all') return true;
    if (projectFilter === 'urgent') return p.isUrgent;
    if (projectFilter === 'active') return p.status !== ProjectStatus.COMPLETED;
    if (projectFilter === 'completed') return p.status === ProjectStatus.COMPLETED;
    return true;
  });

  return (
    <div className={`flex flex-col md:flex-row min-h-screen transition-all duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      {/* Sidebar */}
      <aside className={`w-full md:w-72 border-r p-6 flex flex-col gap-8 transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl shadow-lg text-white ${isDarkMode ? 'bg-indigo-500 shadow-indigo-500/20' : 'bg-slate-900 shadow-slate-200'}`}>
              <Sparkles size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tight italic">FreeFlow.</h1>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <nav className="space-y-1">
          <NavItem isDarkMode={isDarkMode} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20}/>} label="Tổng quan" />
          <NavItem isDarkMode={isDarkMode} active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} icon={<Target size={20}/>} label="Dự án & Task" />
          <NavItem isDarkMode={isDarkMode} active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<DollarSign size={20}/>} label="Doanh thu" />
        </nav>

        <div className="mt-auto">
          <div className={`p-6 rounded-[2rem] text-white shadow-xl ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-900'}`}>
            <div className="flex items-center gap-2 mb-3 opacity-90"><BrainCircuit size={18} className="text-indigo-400" /><span className="text-[10px] font-bold uppercase tracking-widest">Trợ lý Chiến lược</span></div>
            <p className="text-sm font-medium leading-relaxed mb-4 text-slate-300">Tư vấn ưu tiên & dòng tiền.</p>
            <button onClick={async () => { setIsAiLoading(true); const advice = await getWorkloadAdvice(projects); setAiAdvice(advice); setIsAiLoading(false); }} disabled={isAiLoading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2">
              {isAiLoading ? <Loader2 className="animate-spin w-3 h-3" /> : 'Phân tích'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-6xl mx-auto w-full">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-black tracking-tight">{activeTab === 'dashboard' ? 'Chào ngày mới!' : activeTab === 'projects' ? 'Dự án của bạn' : 'Quản lý tài chính'}</h2>
            <p className="text-slate-500 font-medium">Bạn có {stats.activeCount} dự án đang tiến hành.</p>
          </div>
          <button onClick={() => setIsAddingProject(true)} className="group flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 active:scale-95">
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            Dự án mới
          </button>
        </header>

        {aiAdvice && (
          <div className={`mb-10 p-6 border shadow-sm rounded-[2rem] relative overflow-hidden transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex gap-5">
              <div className="bg-indigo-600 p-3.5 rounded-2xl text-white h-fit shadow-lg shadow-indigo-500/20"><BrainCircuit size={24} /></div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">Tư vấn AI</h3>
                <p className={`text-sm leading-relaxed whitespace-pre-line mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{aiAdvice}</p>
                <button onClick={() => setAiAdvice('')} className="text-xs font-bold text-indigo-500 hover:text-indigo-400 uppercase tracking-widest">Đã ghi nhận</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard isDarkMode={isDarkMode} label="Thực thu" value={formatVND(stats.totalEarned)} icon={<CheckCircle2 className="text-emerald-500"/>} trend="Tiền đã về ví" />
              <DashboardCard isDarkMode={isDarkMode} label="Chưa thu" value={formatVND(stats.pendingInvoices)} icon={<Clock className="text-amber-500"/>} trend="Hóa đơn chờ" />
              <DashboardCard isDarkMode={isDarkMode} label="Hoàn thành" value={`${Math.round(stats.overallProgress)}%`} icon={<Target className="text-indigo-500"/>} trend="Tổng tiến độ" />
              <DashboardCard isDarkMode={isDarkMode} label="Dự án active" value={stats.activeCount.toString()} icon={<Briefcase className="text-slate-500"/>} trend="Đang làm" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className={`lg:col-span-2 p-8 rounded-[2.5rem] border shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <h3 className="text-xl font-bold mb-8">Ngân sách (Triệu VNĐ)</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1E293B' : '#F1F5F9'} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                      <Tooltip 
                        cursor={{fill: isDarkMode ? '#1E293B' : '#F8FAFC'}} 
                        contentStyle={{borderRadius: '16px', border: 'none', backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', color: isDarkMode ? '#F8FAFC' : '#0F172A'}}
                        formatter={(val: any) => [`${val}M VNĐ`, 'Budget']}
                      />
                      <Bar dataKey="budget" radius={[8, 8, 0, 0]} barSize={45}>
                        {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.progress === 100 ? '#10B981' : '#6366F1'} />))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className={`p-8 rounded-[2.5rem] border shadow-sm flex flex-col transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Flame size={20} className="text-orange-500" />Việc GẤP</h3>
                <div className="space-y-4 flex-1 overflow-y-auto">
                  {projects.filter(p => p.isUrgent && p.status !== ProjectStatus.COMPLETED).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).slice(0, 5).map(p => (
                    <div key={p.id} className={`flex items-center justify-between p-4 rounded-2xl border ${isDarkMode ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-50/50 border-orange-100'}`}>
                      <div><h4 className="font-bold text-sm">{p.projectName}</h4><p className="text-[10px] text-orange-500 font-black uppercase">DL: {new Date(p.deadline).toLocaleDateString('vi-VN')}</p></div>
                    </div>
                  ))}
                  {projects.filter(p => p.isUrgent && p.status !== ProjectStatus.COMPLETED).length === 0 && <p className="text-xs text-slate-500 italic text-center py-10">Không có việc gấp nào.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-8">
            <div className={`flex p-1.5 rounded-2xl w-fit ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <FilterButton isDarkMode={isDarkMode} active={projectFilter === 'all'} onClick={() => setProjectFilter('all')} label="Tất cả" />
              <FilterButton isDarkMode={isDarkMode} active={projectFilter === 'urgent'} onClick={() => setProjectFilter('urgent')} label="Gấp" />
              <FilterButton isDarkMode={isDarkMode} active={projectFilter === 'active'} onClick={() => setProjectFilter('active')} label="Đang làm" />
              <FilterButton isDarkMode={isDarkMode} active={projectFilter === 'completed'} onClick={() => setProjectFilter('completed')} label="Đã xong" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredProjects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  isDarkMode={isDarkMode}
                  project={project} 
                  onDelete={() => setProjects(projects.filter(p => p.id !== project.id))}
                  onUpdateTask={(tid, updates) => updateTask(project.id, tid, updates)}
                  onUpdateProject={(updates) => updateProject(project.id, updates)}
                  onAddTask={(title) => addTaskToProject(project.id, title)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className={`rounded-[2.5rem] border shadow-sm overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className={`p-10 border-b flex justify-between items-center ${isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50/50 border-slate-50'}`}>
              <h3 className="text-2xl font-black">Thu nhập</h3>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đã thực nhận</p>
                <p className="text-4xl font-black text-emerald-500 tracking-tighter">{formatVND(stats.totalEarned)}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className={`text-[11px] font-black text-slate-400 uppercase tracking-widest ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
                    <th className="px-10 py-6">Dự án</th>
                    <th className="px-10 py-6">Budget</th>
                    <th className="px-10 py-6 text-center">Trạng thái</th>
                    <th className="px-10 py-6 text-right">Ngày nhận</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-50'}`}>
                  {projects.map(p => (
                    <tr key={p.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/50'}`}>
                      <td className="px-10 py-6 font-bold">{p.projectName}</td>
                      <td className="px-10 py-6 font-mono font-bold">{formatVND(p.budget)}</td>
                      <td className="px-10 py-6 text-center">
                        <button 
                          onClick={() => updateProject(p.id, { paymentStatus: p.paymentStatus === PaymentStatus.PAID ? PaymentStatus.PENDING : PaymentStatus.PAID })} 
                          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${p.paymentStatus === PaymentStatus.PAID ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}
                        >
                          {p.paymentStatus}
                        </button>
                      </td>
                      <td className="px-10 py-6 text-sm text-slate-400 font-medium text-right">{new Date(p.createdAt).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Creation Modal */}
      {isAddingProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className={`rounded-[3rem] w-full max-w-2xl p-12 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-slate-900 text-slate-100 border border-slate-800' : 'bg-white text-slate-900'}`}>
            <h2 className="text-3xl font-black mb-6 tracking-tight">Thêm dự án mới</h2>
            
            <div className={`flex p-1.5 rounded-2xl w-full mb-8 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <button onClick={() => setCreationMode('ai')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${creationMode === 'ai' ? (isDarkMode ? 'bg-slate-700 text-white' : 'bg-white text-slate-900 shadow-sm') : 'text-slate-400'}`}><Sparkles size={16}/> Smart AI</button>
              <button onClick={() => setCreationMode('manual')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${creationMode === 'manual' ? (isDarkMode ? 'bg-slate-700 text-white' : 'bg-white text-slate-900 shadow-sm') : 'text-slate-400'}`}><Edit2 size={16}/> Thủ công</button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên dự án</label><input required name="projectName" type="text" className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-800 focus:border-indigo-500' : 'bg-slate-50 border-slate-50 focus:border-indigo-500'}`} placeholder="VD: Landing Page..." /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách hàng</label><input required name="clientName" type="text" className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-800 focus:border-indigo-500' : 'bg-slate-50 border-slate-50 focus:border-indigo-500'}`} placeholder="VD: Agency X" /></div>
              </div>
              
              {creationMode === 'ai' ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">Gõ danh sách task để AI lọc ngày</label>
                  <textarea name="smartTasks" onBlur={handleSmartTasksBlur} className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-medium h-32 ${isDarkMode ? 'bg-slate-800 border-slate-800 focus:border-indigo-500' : 'bg-slate-50 border-slate-50 focus:border-indigo-500'}`} placeholder="20/2 Design Banner, 25/2 Feedback, 1/3 Final..." />
                </div>
              ) : (
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mô tả dự án</label><textarea name="description" className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-medium h-24 ${isDarkMode ? 'bg-slate-800 border-slate-800 focus:border-indigo-500' : 'bg-slate-50 border-slate-50 focus:border-indigo-500'}`} placeholder="Chi tiết..." /></div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline {creationMode === 'ai' && '(AI Auto)'}</label><input required name="deadline" type="date" value={formDeadline} onChange={(e) => setFormDeadline(e.target.value)} className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-800 focus:border-indigo-500' : 'bg-indigo-50/50 border-indigo-100 focus:border-indigo-500 text-indigo-700'}`} /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget (VNĐ)</label><input required name="budget" type="number" className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-black ${isDarkMode ? 'bg-slate-800 border-slate-800 focus:border-indigo-500' : 'bg-slate-50 border-slate-50 focus:border-indigo-500'}`} placeholder="0" /></div>
              </div>

              <div className="flex items-center gap-3 py-2"><input type="checkbox" name="isUrgent" id="isUrgent" className="w-6 h-6 rounded-lg text-orange-500 focus:ring-orange-500" /><label htmlFor="isUrgent" className="text-sm font-black text-orange-500 uppercase tracking-widest flex items-center gap-1.5"><Flame size={16} />Dự án này đang GẤP</label></div>

              <div className="flex gap-4 pt-8">
                <button type="button" onClick={() => setIsAddingProject(false)} className={`flex-1 py-5 font-bold rounded-2xl transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Hủy</button>
                <button type="submit" disabled={isParsingTasks} className="flex-[2] py-5 font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3">{isParsingTasks ? <Loader2 className="animate-spin" size={24} /> : <><CheckCircle2 size={24} />Tạo dự án</>}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterButton: React.FC<{ active: boolean; onClick: () => void; label: string; isDarkMode: boolean }> = ({ active, onClick, label, isDarkMode }) => (
  <button onClick={onClick} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${active ? (isDarkMode ? 'bg-slate-700 text-white' : 'bg-white text-slate-900 shadow-sm') : 'text-slate-400 hover:text-slate-500'}`}>{label}</button>
);

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; isDarkMode: boolean }> = ({ active, onClick, icon, label, isDarkMode }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${active ? (isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-slate-100 text-slate-900') : (isDarkMode ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50/50')}`}>{icon}{label}</button>
);

const DashboardCard: React.FC<{ label: string; value: string; icon: React.ReactNode; trend: string; isDarkMode: boolean }> = ({ label, value, icon, trend, isDarkMode }) => (
  <div className={`p-7 rounded-[2rem] border shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
    <div className="flex justify-between items-start mb-4"><div className={`p-3.5 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>{icon}</div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{trend}</span></div>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <h4 className="text-2xl font-black tracking-tight">{value}</h4>
  </div>
);

const ProjectCard: React.FC<{ 
  project: Project; 
  isDarkMode: boolean;
  onDelete: () => void; 
  onUpdateTask: (tid: string, updates: Partial<Task>) => void;
  onUpdateProject: (updates: Partial<Project>) => void;
  onAddTask: (title: string) => void;
}> = ({ project, isDarkMode, onDelete, onUpdateTask, onUpdateProject, onAddTask }) => {
  const [expanded, setExpanded] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showColorPickerFor, setShowColorPickerFor] = useState<string | null>(null);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');

  const completedCount = project.tasks.filter(t => t.completed).length;
  const progress = project.tasks.length > 0 ? (completedCount / project.tasks.length) * 100 : 0;

  const handleQuickTaskAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onAddTask(quickTaskTitle);
      setQuickTaskTitle('');
    }
  };
  
  return (
    <div className={`rounded-[2.5rem] border p-8 flex flex-col hover:shadow-2xl transition-all group relative ${isDarkMode ? 'bg-slate-900 hover:shadow-indigo-500/5' : 'bg-white hover:shadow-slate-100'} ${project.isUrgent ? 'border-orange-500/30' : (isDarkMode ? 'border-slate-800' : 'border-slate-100')}`}>
      {project.isUrgent && <div className="absolute -top-3 left-8 bg-orange-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-1 shadow-lg shadow-orange-500/20"><Flame size={12} /> GẤP</div>}
      
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <select value={project.status} onChange={(e) => onUpdateProject({ status: e.target.value as ProjectStatus })} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest outline-none border-none cursor-pointer ${project.status === ProjectStatus.COMPLETED ? 'bg-emerald-500/10 text-emerald-500' : project.status === ProjectStatus.IN_PROGRESS ? 'bg-indigo-500/10 text-indigo-500' : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600')}`}>
              {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <h3 className="text-2xl font-black leading-tight group-hover:text-indigo-500 transition-colors">{project.projectName}</h3><p className="text-sm font-bold text-slate-500 mt-1">{project.clientName}</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onUpdateProject({ isUrgent: !project.isUrgent })} className={`p-2.5 rounded-xl transition-colors ${project.isUrgent ? 'text-orange-500 bg-orange-500/10' : 'text-slate-500 hover:bg-slate-800'}`}><Flame size={20} /></button>
          <button onClick={onDelete} className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'text-slate-600 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}><Trash2 size={20} /></button>
        </div>
      </div>

      <div className={`mb-6 p-5 rounded-3xl border transition-colors ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50/50 border-slate-100/50'}`}>
        <div className="flex justify-between items-center mb-3"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiến độ</p><p className="text-xs font-black text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md">{completedCount}/{project.tasks.length} task</p></div>
        <div className={`h-3 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}><div className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out" style={{width: `${progress}%`}} /></div>
        <div className="mt-4 flex gap-2">
          <button onClick={() => onUpdateProject({ tasks: project.tasks.map(t => ({ ...t, completed: true })) })} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-500' : 'bg-white border border-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'}`}><CheckCheck size={14} /> Done All</button>
          <button onClick={() => onUpdateProject({ paymentStatus: project.paymentStatus === PaymentStatus.PAID ? PaymentStatus.PENDING : PaymentStatus.PAID })} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${project.paymentStatus === PaymentStatus.PAID ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : (isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-amber-500/10' : 'bg-white border border-slate-100 text-slate-600 hover:bg-amber-50')}`}><Banknote size={14} /> {project.paymentStatus === PaymentStatus.PAID ? 'ĐÃ NHẬN' : 'CHƯA NHẬN'}</button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {project.tasks.slice(0, expanded ? undefined : 2).map(task => (
          <div key={task.id} className={`relative group/task flex items-center gap-3 p-4 rounded-2xl border transition-all shadow-sm overflow-hidden ${isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: task.color || '#e2e8f0' }} />
            <input type="checkbox" checked={task.completed} onChange={() => onUpdateTask(task.id, { completed: !task.completed })} className="ml-2 w-5 h-5 rounded-lg border-2 border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
            <div className="flex-1 min-w-0">
              {editingTaskId === task.id ? (
                <div className="flex flex-col gap-2">
                  <input autoFocus value={task.title} onChange={(e) => onUpdateTask(task.id, { title: e.target.value })} className={`w-full text-sm font-bold border-none rounded p-1 outline-none ring-1 ring-indigo-500 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`} />
                  <input type="date" value={task.dueDate} onChange={(e) => onUpdateTask(task.id, { dueDate: e.target.value })} className={`w-full text-[10px] font-bold border-none rounded p-1 outline-none ring-1 ring-indigo-200 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`} />
                </div>
              ) : (
                <div onClick={() => setEditingTaskId(task.id)} className="cursor-pointer">
                  <p className={`text-sm font-bold truncate ${task.completed ? 'text-slate-500 line-through opacity-50' : ''}`}>{task.title}</p>
                  <div className="flex items-center gap-1 mt-0.5"><Clock size={10} className="text-slate-500" /><p className="text-[10px] font-bold text-slate-500">{new Date(task.dueDate).toLocaleDateString('vi-VN')}</p></div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover/task:opacity-100 transition-opacity">
              {editingTaskId === task.id ? <button onClick={() => setEditingTaskId(null)} className="p-1.5 rounded-lg bg-indigo-600 text-white"><Save size={14}/></button> : <><button onClick={() => setShowColorPickerFor(showColorPickerFor === task.id ? null : task.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-500 hover:bg-slate-700/50"><Palette size={14}/></button><button onClick={() => setEditingTaskId(task.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-500 hover:bg-slate-700/50"><Edit2 size={14}/></button></>}
            </div>
            {showColorPickerFor === task.id && (<div className={`absolute right-10 top-2 bottom-2 border rounded-xl shadow-xl z-10 flex items-center gap-1.5 px-3 py-1 animate-in slide-in-from-right-2 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>{TASK_COLORS.map(c => <button key={c.value} onClick={() => { onUpdateTask(task.id, { color: c.value }); setShowColorPickerFor(null); }} className="w-5 h-5 rounded-full hover:scale-125 transition-transform border border-white" style={{backgroundColor: c.value}} />)}<button onClick={() => setShowColorPickerFor(null)} className="ml-1 text-slate-500"><X size={12}/></button></div>)}
          </div>
        ))}
        
        {/* Quick Task Input */}
        <div className={`flex items-center gap-2 p-1.5 rounded-2xl border border-dashed transition-all ${isDarkMode ? 'border-slate-800 hover:border-indigo-500/50' : 'border-slate-200 hover:border-indigo-500/50'}`}>
          <div className="flex-1 flex items-center gap-2 pl-2">
            <Plus size={14} className="text-indigo-500" />
            <input 
              value={quickTaskTitle}
              onChange={(e) => setQuickTaskTitle(e.target.value)}
              onKeyDown={handleQuickTaskAdd}
              placeholder="Thêm task nhanh (Enter)..." 
              className={`w-full text-xs font-bold bg-transparent border-none outline-none ${isDarkMode ? 'placeholder:text-slate-600' : 'placeholder:text-slate-300'}`}
            />
          </div>
        </div>

        {project.tasks.length > 2 && <button onClick={() => setExpanded(!expanded)} className="w-full text-[11px] font-black text-indigo-500 uppercase tracking-widest py-2 hover:bg-indigo-500/10 rounded-xl transition-all flex items-center justify-center gap-1">{expanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}{expanded ? 'Thu gọn' : `Xem thêm ${project.tasks.length - 2} task`}</button>}
      </div>

      <div className={`pt-8 border-t mt-auto flex justify-between items-end ${isDarkMode ? 'border-slate-800' : 'border-slate-50'}`}>
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Hạn cuối</p>
          <div className={`flex items-center gap-2 text-sm font-black px-3 py-1.5 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}><Calendar size={16} className="text-indigo-500" />{new Date(project.deadline).toLocaleDateString('vi-VN')}</div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Budget</p>
          <div className="flex flex-col items-end gap-1">
            {isEditingBudget ? (
              <input 
                type="number" 
                autoFocus
                onBlur={() => setIsEditingBudget(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingBudget(false)}
                value={project.budget}
                onChange={(e) => onUpdateProject({ budget: Number(e.target.value) })}
                className={`w-32 text-right px-2 py-1 rounded-lg text-xl font-black outline-none ring-2 ring-indigo-500 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}
              />
            ) : (
              <div onClick={() => setIsEditingBudget(true)} className="flex items-center gap-2 cursor-pointer group/budget">
                <p className="text-2xl font-black tracking-tighter transition-colors group-hover/budget:text-indigo-500">{formatVND(project.budget)}</p>
                <div className={`p-1 rounded-md opacity-0 group-hover/budget:opacity-100 transition-opacity ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}><Coins size={14}/></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
