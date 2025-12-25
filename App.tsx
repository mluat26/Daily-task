import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Trash2,
  ChevronDown,
  ChevronUp,
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
  Coins,
  Sparkles,
  Layers,
  FileType,
  Building2,
  Check,
  TrendingUp,
  CreditCard,
  FileSpreadsheet,
  RefreshCw,
  Link as LinkIcon,
  Copy,
  Bot,
  ExternalLink,
  MessageSquare,
  FileText,
  Printer,
  Filter,
  MoreHorizontal,
  PieChart,
  RotateCcw,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowRight,
  ClipboardList,
  ArrowUpDown,
  CheckSquare,
  Zap, 
  Play,
  Pause,
  Youtube,
  Search,
  Headphones,
  Maximize2,
  Minimize2,
  Coffee,
  Timer,
  History,
  Volume2,
  CalendarDays,
  Image,
  Lock,
  CalendarCheck,
  ListTodo,
  AlertCircle,
  Pencil,
  GraduationCap,
  BookOpen,
  NotebookPen,
  Library
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
import { Project, ProjectStatus, PaymentStatus, Task, Client } from './types';

// Hàm helper format số: 1000000 -> 1.000.000
const formatNumber = (num: number | string | undefined): string => {
  if (num === undefined || num === null || num === '') return '';
  const str = num.toString().replace(/\./g, '');
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Hàm helper parse số: 1.000.000 -> 1000000
const parseNumber = (str: string): number => {
  if (!str) return 0;
  return Number(str.replace(/\./g, ''));
};

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Hàm xử lý ngày thông minh
const parseSmartDate = (input: string): string => {
  if (!input) return "";
  if (input.match(/^\d{4}-\d{2}-\d{2}$/)) return input;

  const cleanInput = input.replace(/\D/g, '/');
  const parts = cleanInput.split('/').filter(Boolean);
  const currentYear = new Date().getFullYear();

  let day, month, year = currentYear;

  if (parts.length === 1) {
    const text = parts[0];
    if (text.length === 3) {
      day = parseInt(text.substring(0, 2));
      month = parseInt(text.substring(2, 3));
    } else if (text.length === 4) {
      day = parseInt(text.substring(0, 2));
      month = parseInt(text.substring(2, 4));
    } else if (text.length >= 6) { 
      day = parseInt(text.substring(0, 2));
      month = parseInt(text.substring(2, 4));
      const yearStr = text.substring(4);
      year = parseInt(yearStr.length === 2 ? '20' + yearStr : yearStr);
    } else {
        return input; 
    }
  } else {
    day = parseInt(parts[0]);
    month = parseInt(parts[1] || new Date().getMonth() + 1 + "");
    if (parts[2]) {
      year = parseInt(parts[2].length === 2 ? '20' + parts[2] : parts[2]);
    }
  }

  if (day > 31 || day < 1 || month > 12 || month < 1) return input;

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const formatDateDisplay = (isoDate: string) => {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}`;
}

const getFullDateDisplay = () => {
    const date = new Date();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return `${days[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

// Hàm tính toán deadline dự án dựa trên task con
const calculateProjectDeadline = (tasks: Task[], currentDeadline: string): string => {
    if (!tasks || tasks.length === 0) return currentDeadline;
    const timestamps = tasks.map(t => new Date(t.dueDate).getTime()).filter(n => !isNaN(n));
    if (timestamps.length === 0) return currentDeadline;
    const maxTs = Math.max(...timestamps);
    
    // Luôn trả về ngày xa nhất của task con
    return new Date(maxTs).toISOString().split('T')[0];
};

const generateInvoiceHTML = (project: Project) => {
  const date = new Date().toLocaleDateString('vi-VN');
  const totalAmount = formatVND(project.budget);
  
  return `
    <html>
      <head>
        <title>Invoice - ${project.projectName}</title>
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
          .brand h1 { margin: 0; color: #4f46e5; font-size: 28px; }
          .brand p { margin: 5px 0 0; color: #666; font-size: 14px; }
          .invoice-title { text-align: right; }
          .invoice-title h2 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
          .invoice-title p { margin: 5px 0 0; color: #888; }
          
          .info-grid { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .info-col h3 { font-size: 12px; text-transform: uppercase; color: #888; letter-spacing: 1px; margin-bottom: 10px; }
          .info-col p { margin: 0; font-weight: bold; font-size: 14px; }
          .info-col .sub { font-weight: normal; font-size: 13px; color: #666; margin-top: 4px; }

          table { w-full; width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { text-align: left; padding: 15px 10px; border-bottom: 2px solid #eee; font-size: 12px; text-transform: uppercase; color: #888; }
          td { padding: 15px 10px; border-bottom: 1px solid #eee; font-size: 14px; }
          .total-row td { border-bottom: none; border-top: 2px solid #333; font-weight: bold; font-size: 16px; padding-top: 20px; }
          
          .bank-info { background: #f9fafb; padding: 20px; border-radius: 12px; margin-top: 40px; border: 1px solid #e5e7eb; }
          .bank-info h3 { margin: 0 0 10px; font-size: 14px; color: #4f46e5; }
          .bank-info p { margin: 5px 0; font-size: 14px; font-family: monospace; }
          
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">
            <h1>Nguyen Minh Luat</h1>
            <p>Freelance Designer & Developer</p>
          </div>
          <div class="invoice-title">
            <h2>Hóa Đơn</h2>
            <p>#INV-${project.id.toUpperCase().substring(0,6)}</p>
            <p>Ngày: ${date}</p>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-col">
            <h3>Khách hàng</h3>
            <p>${project.clientName}</p>
          </div>
          <div class="info-col">
            <h3>Dự án</h3>
            <p>${project.projectName}</p>
            <p class="sub">${project.description || ''}</p>
          </div>
          <div class="info-col">
             <h3>Trạng thái</h3>
             <p style="color: ${project.paymentStatus === 'Paid' ? 'green' : 'orange'}">${project.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%">#</th>
              <th style="width: 55%">Hạng mục công việc (Task)</th>
              <th style="width: 20%">Deadline</th>
              <th style="width: 20%; text-align: right;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${project.tasks.length > 0 ? project.tasks.map((t, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${t.title} ${t.completed ? '(Đã xong)' : ''}</td>
                <td>${formatDateDisplay(t.dueDate)}</td>
                <td style="text-align: right;">${t.budget ? new Intl.NumberFormat('vi-VN').format(t.budget) : '0'} ₫</td>
              </tr>
            `).join('') : `
              <tr>
                <td>1</td>
                <td>Triển khai dự án trọn gói: ${project.projectName}</td>
                <td>${formatDateDisplay(project.deadline)}</td>
                <td style="text-align: right;">${totalAmount}</td>
              </tr>
            `}
            <tr class="total-row">
              <td colspan="3" style="text-align: right;">TỔNG CỘNG</td>
              <td style="text-align: right; color: #4f46e5;">${totalAmount}</td>
            </tr>
          </tbody>
        </table>

        <div class="bank-info">
          <h3>Thông tin thanh toán</h3>
          <p>Ngân hàng: <strong>Vietcombank</strong></p>
          <p>Số tài khoản: <strong>1015530875</strong></p>
          <p>Chủ tài khoản: <strong>NGUYEN MINH LUAT</strong></p>
        </div>

        <div class="footer">
          <p>Cảm ơn quý khách đã tin tưởng hợp tác!</p>
        </div>
        
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;
};

const TASK_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Violet', value: '#8b5cf6' },
];

const PASTEL_PALETTE = [
  { hex: '#bfdbfe', name: 'Blue' },   // blue-200
  { hex: '#bbf7d0', name: 'Green' },  // green-200
  { hex: '#e9d5ff', name: 'Purple' }, // purple-200
  { hex: '#fbcfe8', name: 'Pink' },   // pink-200
  { hex: '#fed7aa', name: 'Orange' }, // orange-200
  { hex: '#fef08a', name: 'Yellow' }, // yellow-200
  { hex: '#99f6e4', name: 'Teal' },   // teal-200
  { hex: '#e2e8f0', name: 'Slate' },  // slate-200
];

const AI_SUGGESTIONS = [
  "Phân tích tổng doanh thu và xu hướng thu nhập tháng này.",
  "Đánh giá hiệu quả của các dự án đang chạy (Active).",
  "Lập kế hoạch chi tiêu dựa trên dòng tiền sắp về.",
  "Dự báo doanh thu tháng sau dựa trên các deal đang pending.",
  "So sánh tỷ suất lợi nhuận giữa các khách hàng khác nhau."
];

// Changed to empty array to start fresh as requested
const INITIAL_CLIENTS: Client[] = [];

const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    clientName: 'Công ty Mẫu',
    clientColor: '#fed7aa',
    projectName: 'Thiết kế Key Visual Tết',
    description: 'Thiết kế bộ nhận diện cho chiến dịch Tết 2025.',
    status: ProjectStatus.IN_PROGRESS,
    deadline: '2024-12-25',
    budget: 15000000,
    tasks: [
      { id: 't1', title: 'Phác thảo ý tưởng', dueDate: '2024-12-10', completed: true, color: '#6366f1', budget: 5000000 },
      { id: 't2', title: 'Hoàn thiện bản vẽ', dueDate: '2024-12-20', completed: false, color: '#f43f5e', budget: 10000000 }
    ],
    paymentStatus: PaymentStatus.PENDING,
    createdAt: new Date().toISOString(),
    isUrgent: true,
    type: 'complex'
  }
];

const GOOGLE_SCRIPT_CODE = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  // Xóa dữ liệu cũ (giữ lại hàng tiêu đề)
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 6).clearContent();
  } else {
    // Tạo tiêu đề nếu chưa có
    sheet.appendRow(["Ngày tạo", "Công ty", "Dự án", "Budget", "Trạng thái", "Deadline"]);
  }

  // Thêm dữ liệu mới
  data.forEach(function(item) {
    sheet.appendRow([item.date, item.client, item.project, item.budget, item.status, item.deadline]);
  });

  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}`;

const NavItem: React.FC<{
  isDarkMode: boolean;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  isSpecial?: boolean; // New prop for Focus tab
}> = ({ isDarkMode, active, onClick, icon, label, isCollapsed, isSpecial }) => (
  <button
    onClick={onClick}
    title={isCollapsed ? label : ''}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm group relative ${
      active
        ? isSpecial 
            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/20' 
            : 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
        : isDarkMode
        ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    } ${isCollapsed ? 'justify-center w-12 mx-auto px-0' : 'w-full'}`}
  >
    <div className={`transition-transform duration-300 group-hover:scale-110 ${isSpecial && !active ? 'text-violet-500' : ''}`}>{icon}</div>
    {!isCollapsed && <span className="animate-in fade-in duration-300 slide-in-from-left-2 whitespace-nowrap">{label}</span>}
  </button>
);

const MiniFocusTimer: React.FC<{
    timeLeft: number;
    phase: 'setup' | 'active' | 'break';
    isActive: boolean;
    isDarkMode: boolean;
    isSidebarCollapsed: boolean;
    onToggle: () => void;
    onClick: () => void;
}> = ({ timeLeft, phase, isActive, isDarkMode, isSidebarCollapsed, onToggle, onClick }) => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`transition-all duration-500 z-50 ${isSidebarCollapsed ? 'fixed bottom-6 right-6 w-80 shadow-2xl animate-in slide-in-from-right-4' : 'mx-4 mb-4 animate-in slide-in-from-left-2'}`}>
            <div className={`p-3 rounded-xl border shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-slate-900/95 border-slate-700 backdrop-blur-md' : 'bg-white/95 border-slate-200 backdrop-blur-md'}`}>
                <div className="flex items-center justify-between gap-3" onClick={onClick}>
                    <div className={`p-2 rounded-lg ${phase === 'break' ? 'bg-emerald-100 text-emerald-600' : 'bg-violet-100 text-violet-600'}`}>
                        {phase === 'break' ? <Coffee size={16}/> : <Zap size={16}/>}
                    </div>
                    <div className="flex-1">
                        <p className={`text-lg font-black font-mono leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formatTime(timeLeft)}</p>
                        <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">{phase === 'break' ? 'Break' : 'Focus'}</p>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggle(); }}
                        className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                    >
                        {isActive ? <Pause size={14} fill="currentColor"/> : <Play size={14} fill="currentColor"/>}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- UPDATED COMPONENT: Daily Task Card for Sidebar ---
const DailyTaskCard: React.FC<{
    isDarkMode: boolean;
    isCollapsed: boolean;
    onClick: () => void;
    isActive: boolean;
    taskCount: number;
}> = ({ isDarkMode, isCollapsed, onClick, isActive, taskCount }) => {
    return (
        <div 
            onClick={onClick}
            className={`relative overflow-hidden cursor-pointer transition-all duration-300 group hover:scale-[1.02] ${isCollapsed ? 'w-12 h-12 rounded-xl mx-auto' : 'w-full h-[88px] rounded-2xl mx-auto shadow-lg'}`}
        >
            {/* Background Gradient & Effects - Blue Sea Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 ${isActive ? 'opacity-100' : 'opacity-90 hover:opacity-100'}`}></div>
            
            {/* Large Icon in Background */}
            {!isCollapsed && <ListTodo size={80} className="absolute -right-4 -bottom-6 text-white opacity-10 rotate-12 transition-transform group-hover:scale-110" />}

            {/* Content */}
            {isCollapsed ? (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                    <ListTodo size={24} />
                </div>
            ) : (
                <div className="relative p-4 h-full flex flex-col justify-center text-white">
                    <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Công việc hôm nay</div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black tracking-tight leading-none">{taskCount}</span>
                        <span className="text-sm font-bold opacity-90">Tasks</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- UPDATED COMPONENT: Mini Task Item for Daily View ---
const MiniTaskCard: React.FC<{
    task: Task;
    projectTitle: string;
    clientName: string;
    projectColor?: string;
    isDarkMode: boolean;
    onToggle: () => void;
    isOverdue?: boolean;
}> = ({ task, projectTitle, clientName, projectColor, isDarkMode, onToggle, isOverdue }) => (
    <div className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${task.completed ? 'opacity-50' : ''} ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className="flex items-start gap-3">
            <button 
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : (isDarkMode ? 'border-slate-600 hover:border-emerald-500' : 'border-slate-200 hover:border-emerald-500')}`}
            >
                {task.completed && <Check size={12} strokeWidth={4} />}
            </button>
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {/* Client Name Tag */}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                        {clientName}
                    </span>
                    {/* Project Tag */}
                    <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded text-white truncate max-w-[120px]" style={{backgroundColor: projectColor || '#94a3b8'}}>
                        {projectTitle}
                    </span>
                    {isOverdue && !task.completed && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                            <AlertCircle size={10} /> Quá hạn
                        </span>
                    )}
                </div>
                <h4 className={`font-bold text-sm mb-2 ${task.completed ? 'line-through text-slate-500' : ''}`}>{task.title}</h4>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className={`flex items-center gap-1 font-bold ${isOverdue && !task.completed ? 'text-red-400' : ''}`}>
                        <Calendar size={12}/> {formatDateDisplay(task.dueDate)}
                    </div>
                    {task.budget && task.budget > 0 && (
                        <div className="flex items-center gap-1 font-mono">
                            <Banknote size={12}/> {formatNumber(task.budget)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
);

// Interface for FocusMode Props
interface FocusModeProps {
    isDarkMode: boolean;
    setIsDarkMode: (val: boolean) => void;
    phase: 'setup' | 'active' | 'break';
    setPhase: (phase: 'setup' | 'active' | 'break') => void;
    setupMinutes: number;
    setSetupMinutes: React.Dispatch<React.SetStateAction<number>>;
    targetSessions: number;
    setTargetSessions: React.Dispatch<React.SetStateAction<number>>;
    timeLeft: number;
    setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
    isActive: boolean;
    setIsActive: (val: boolean) => void;
    sessionsCompleted: number;
    stats: { todayMins: number; weekMins: number; monthMins: number };
    startFocus: () => void;
    stopFocus: () => void;
    formatTime: (seconds: number) => string;
    projects?: Project[];
}

const FocusMode: React.FC<FocusModeProps> = ({ 
    isDarkMode, 
    phase, 
    setupMinutes, 
    setSetupMinutes, 
    targetSessions, 
    setTargetSessions, 
    timeLeft, 
    isActive, 
    setIsActive, 
    sessionsCompleted, 
    stats,
    startFocus,
    stopFocus,
    formatTime
}) => {
    // Content State
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [embeddedId, setEmbeddedId] = useState('');

    const handleYoutubeEmbed = (e: React.FormEvent) => {
        e.preventDefault();
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = youtubeUrl.match(regExp);
        if (match && match[2].length === 11) {
            setEmbeddedId(match[2]);
        }
    };

    if (phase === 'setup') {
        return (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={`p-8 rounded-3xl border shadow-sm text-center relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-2xl mx-auto flex items-center justify-center mb-6">
                        <Zap size={32} fill="currentColor"/>
                    </div>
                    <h2 className="text-3xl font-black mb-2">Focus Session Setup</h2>
                    <p className="text-slate-500 text-sm font-medium mb-8">Thiết lập thời gian để tối ưu sự tập trung.</p>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian (Phút)</label>
                            <div className="flex items-center justify-center gap-4">
                                <button onClick={() => setSetupMinutes(m => Math.max(5, m - 5))} className="p-2 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-800"><ArrowUpDown size={16} className="rotate-90 text-slate-400"/></button>
                                <span className="text-4xl font-black font-mono w-20">{setupMinutes}</span>
                                <button onClick={() => setSetupMinutes(m => Math.min(120, m + 5))} className="p-2 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-800"><ArrowUpDown size={16} className="-rotate-90 text-slate-400"/></button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mục tiêu (Session)</label>
                            <div className="flex items-center justify-center gap-4">
                                <button onClick={() => setTargetSessions(s => Math.max(1, s - 1))} className="p-2 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-800"><ArrowUpDown size={16} className="rotate-90 text-slate-400"/></button>
                                <span className="text-4xl font-black font-mono w-20">{targetSessions}</span>
                                <button onClick={() => setTargetSessions(s => Math.min(10, s + 1))} className="p-2 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-800"><ArrowUpDown size={16} className="-rotate-90 text-slate-400"/></button>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={startFocus}
                        className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-2xl shadow-xl shadow-violet-500/20 text-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Play fill="currentColor"/> Bắt đầu Focus
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                     <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hôm nay</p>
                         <p className="text-xl font-black text-violet-500">{stats.todayMins}p</p>
                     </div>
                     <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tuần này</p>
                         <p className="text-xl font-black text-fuchsia-500">{stats.weekMins}p</p>
                     </div>
                     <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tháng này</p>
                         <p className="text-xl font-black text-indigo-500">{stats.monthMins}p</p>
                     </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-700">
            {/* Top Bar with Mini Timer Card */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg"><Youtube size={20}/></div>
                    <form onSubmit={handleYoutubeEmbed} className="flex gap-2">
                        <input 
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="Dán link Youtube..."
                            className={`w-64 px-3 py-2 rounded-xl outline-none border font-medium text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                        />
                        <button type="submit" className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700"><Search size={16}/></button>
                    </form>
                    <div className="flex gap-1">
                        {['jfKfPfyJRdk', '5qap5aO4i9A', 'DWcJFNfaw9c'].map((id, i) => (
                             <button key={id} onClick={() => setEmbeddedId(id)} className={`px-3 py-2 rounded-lg text-[10px] font-bold ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-50'}`}>{['Lofi Girl', 'Lofi Boy', 'Piano'][i]}</button>
                        ))}
                    </div>
                </div>

                {/* Main Timer Display */}
                <div className={`p-4 rounded-2xl border shadow-lg flex items-center gap-5 min-w-[280px] backdrop-blur-md transition-colors ${isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
                    <div className="text-center">
                        <div className={`text-3xl font-black font-mono tabular-nums leading-none ${phase === 'break' ? 'text-emerald-500' : 'text-white'}`}>
                            {formatTime(timeLeft)}
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{phase === 'break' ? 'Nghỉ ngơi' : 'Đang Focus'}</p>
                    </div>
                    
                    <div className="h-8 w-[1px] bg-slate-700 mx-1"></div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsActive(!isActive)} className={`p-3 rounded-xl transition-all ${isActive ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                            {isActive ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}
                        </button>
                        <button onClick={stopFocus} className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-red-400 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Youtube Area */}
            <div className="flex-1 rounded-3xl overflow-hidden border border-slate-800 bg-black relative group shadow-2xl">
                 {embeddedId ? (
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src={`https://www.youtube.com/embed/${embeddedId}?autoplay=1`} 
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="absolute inset-0 w-full h-full object-cover"
                    ></iframe>
                 ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700">
                        <Headphones size={64} className="mb-4 opacity-50"/>
                        <p className="font-bold text-lg">Chọn nhạc để bắt đầu không gian Focus</p>
                    </div>
                 )}
                 
                 {/* Session Progress Overlay */}
                 <div className="absolute bottom-6 left-6 flex gap-2">
                     {Array.from({length: targetSessions}).map((_, i) => (
                         <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i < sessionsCompleted ? 'bg-violet-500' : 'bg-slate-800 border border-slate-700'}`} />
                     ))}
                 </div>
            </div>
        </div>
    );
};

const DashboardCard: React.FC<{
  isDarkMode: boolean;
  label: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
}> = ({ isDarkMode, label, value, icon, trend }) => (
  <div className={`p-6 rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px] ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>{icon}</div>
      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{trend}</span>
    </div>
    <h3 className="text-3xl font-black mb-1 tracking-tight">{value}</h3>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
  </div>
);

const FilterButton: React.FC<{
  isDarkMode: boolean;
  active: boolean;
  onClick: () => void;
  label: string;
}> = ({ isDarkMode, active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200 ${
      active
        ? isDarkMode
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
          : 'bg-white text-indigo-600 shadow-md'
        : isDarkMode
        ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
        : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'
    }`}
  >
    {label}
  </button>
);

const TaskItem: React.FC<{
  task: Task;
  isDarkMode: boolean;
  onUpdate: (updates: Partial<Task>) => void;
}> = ({ task, isDarkMode, onUpdate }) => {
  const [dateStr, setDateStr] = useState(formatDateDisplay(task.dueDate));
  const [budgetStr, setBudgetStr] = useState(formatNumber(task.budget));
  const [titleStr, setTitleStr] = useState(task.title);

  useEffect(() => { setDateStr(formatDateDisplay(task.dueDate)); }, [task.dueDate]);
  useEffect(() => { setBudgetStr(formatNumber(task.budget)); }, [task.budget]);
  useEffect(() => { setTitleStr(task.title); }, [task.title]);

  const handleDateBlur = () => {
      const newDate = parseSmartDate(dateStr);
      if (newDate && newDate !== task.dueDate) {
          onUpdate({ dueDate: newDate });
          setDateStr(formatDateDisplay(newDate)); 
      } else {
          setDateStr(formatDateDisplay(task.dueDate));
      }
  };

  const handleBudgetBlur = () => {
      const num = parseNumber(budgetStr);
      if (num !== task.budget) {
          onUpdate({ budget: num });
      }
  };

  const handleTitleBlur = () => {
      if (titleStr !== task.title) {
          onUpdate({ title: titleStr });
      }
  }

  return (
    <div className={`flex items-center gap-3 py-2 px-3 rounded-lg border transition-all duration-200 group/item ${isDarkMode ? 'bg-slate-900 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
         <button
            onClick={() => onUpdate({ completed: !task.completed })}
            className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors duration-300 ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : (isDarkMode ? 'border-slate-600 hover:border-emerald-500' : 'border-slate-300 hover:border-emerald-500')}`}
         >
            {task.completed && <Check size={10} strokeWidth={4} />}
         </button>
         
         <input
            value={titleStr}
            onChange={(e) => setTitleStr(e.target.value)}
            onBlur={handleTitleBlur}
            className={`text-xs font-medium block flex-1 bg-transparent outline-none truncate transition-colors duration-300 ${task.completed ? 'text-slate-400 line-through' : (isDarkMode ? 'text-slate-200' : 'text-slate-700')}`}
         />
            
         <div className="flex items-center gap-3">
            {/* Date Edit */}
            <div className="flex items-center gap-1 group/date relative opacity-80 hover:opacity-100 transition-opacity duration-200">
                <Clock size={10} className={isDarkMode ? "text-slate-500" : "text-slate-400"}/>
                <input
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    onBlur={handleDateBlur}
                    placeholder="dd/mm"
                    className={`text-[10px] font-bold bg-transparent border-b border-transparent hover:border-dashed outline-none w-10 text-right transition-all ${isDarkMode ? 'text-slate-400 border-slate-600' : 'text-slate-500 border-slate-300'}`}
                />
            </div>

            {/* Budget Edit */}
            <div className="flex items-center gap-1 group/budget relative opacity-80 hover:opacity-100 transition-opacity duration-200">
                <input
                    value={budgetStr}
                    onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setBudgetStr(formatNumber(val));
                    }}
                    onBlur={handleBudgetBlur}
                    placeholder="0"
                    className={`text-[10px] font-mono font-bold bg-transparent border-b border-transparent hover:border-dashed outline-none w-16 text-right transition-all ${isDarkMode ? 'text-slate-400 border-slate-600' : 'text-slate-500 border-slate-300'}`}
                />
            </div>
         </div>
    </div>
  );
}

const ProjectRow: React.FC<{
  isDarkMode: boolean;
  project: Project;
  onDelete: () => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onUpdateProject: (updates: Partial<Project>) => void;
  onAddTask: (title: string) => void;
  onPrintInvoice: (project: Project) => void;
  isHighlighted?: boolean;
}> = ({ isDarkMode, project, onDelete, onUpdateTask, onUpdateProject, onAddTask, onPrintInvoice, isHighlighted }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(isHighlighted || false);
  const [localBudget, setLocalBudget] = useState(formatNumber(project.budget));
  const [localDate, setLocalDate] = useState(formatDateDisplay(project.deadline));

  useEffect(() => {
    setLocalBudget(formatNumber(project.budget));
  }, [project.budget]);

  useEffect(() => {
    setLocalDate(formatDateDisplay(project.deadline));
  }, [project.deadline]);

  useEffect(() => {
      if (isHighlighted) {
          setIsExpanded(true);
      }
  }, [isHighlighted]);

  const completedTasks = project.tasks.filter(t => t.completed).length;
  const totalTasks = project.tasks.length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const isComplex = totalTasks > 0;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle);
      setNewTaskTitle('');
    }
  };

  const getStatusColorClass = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.COMPLETED: return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case ProjectStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-600 border-blue-200';
      case ProjectStatus.PLANNING: return 'bg-slate-100 text-slate-600 border-slate-200';
      case ProjectStatus.REVIEW: return 'bg-purple-100 text-purple-600 border-purple-200';
      case ProjectStatus.ON_HOLD: return 'bg-amber-100 text-amber-600 border-amber-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const togglePaymentStatus = () => {
    onUpdateProject({ 
        paymentStatus: project.paymentStatus === PaymentStatus.PAID ? PaymentStatus.PENDING : PaymentStatus.PAID 
    });
  };

  const handleProjectBudgetBlur = () => {
      const num = parseNumber(localBudget);
      if (num !== project.budget) {
          onUpdateProject({ budget: num });
      }
  };

  const handleProjectDateBlur = () => {
      const newDate = parseSmartDate(localDate);
      if (newDate && newDate !== project.deadline) {
          onUpdateProject({ deadline: newDate });
          setLocalDate(formatDateDisplay(newDate));
      } else {
          setLocalDate(formatDateDisplay(project.deadline));
      }
  };

  return (
    <div 
        id={`project-${project.id}`}
        // Added overflow-hidden to clip progress bar
        className={`group relative transition-all duration-300 rounded-2xl border overflow-hidden ${isHighlighted ? 'ring-2 ring-indigo-500 shadow-xl scale-[1.01]' : (isExpanded ? 'shadow-lg ring-1 ring-indigo-500/10' : 'shadow-sm hover:shadow-md hover:translate-y-[-2px]')} ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
    >
        {/* Main Row Content */}
        <div className="flex flex-col md:flex-row items-center gap-4 p-5">
            
            {/* NEW: Isolated Done Button Area at Start */}
            <div className={`pr-4 border-r ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                 <button 
                    onClick={() => {
                        if (project.status === ProjectStatus.COMPLETED) {
                            onUpdateProject({ status: ProjectStatus.IN_PROGRESS });
                        } else {
                            onUpdateProject({ status: ProjectStatus.COMPLETED });
                        }
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${project.status === ProjectStatus.COMPLETED ? 'bg-emerald-500 text-white scale-100 shadow-lg shadow-emerald-500/30' : (isDarkMode ? 'bg-slate-800 text-slate-500 hover:text-emerald-500 hover:bg-slate-700' : 'bg-slate-100 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50')}`}
                    title={project.status === ProjectStatus.COMPLETED ? "Mở lại dự án" : "Hoàn thành dự án"}
                >
                    <Check size={20} strokeWidth={3} />
                </button>
            </div>

            {/* Left: Info */}
            <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center gap-3 mb-1.5">
                    {/* Status Dropdown - FIXED FORMATTING */}
                    <div className="relative group/status">
                        <select 
                            value={project.status}
                            onChange={(e) => onUpdateProject({ status: e.target.value as ProjectStatus })}
                            className={`appearance-none pl-3 pr-8 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider cursor-pointer outline-none transition-colors border ${getStatusColorClass(project.status)}`}
                        >
                            <option value={ProjectStatus.PLANNING}>Planning</option>
                            <option value={ProjectStatus.IN_PROGRESS}>In Progress</option>
                            <option value={ProjectStatus.REVIEW}>Review</option>
                            <option value={ProjectStatus.ON_HOLD}>On Hold</option>
                            <option value={ProjectStatus.COMPLETED}>Completed</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 transition-transform group-hover/status:rotate-180" />
                    </div>

                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 truncate max-w-[100px]">
                        {project.clientName}
                    </span>
                    
                    {/* Urgent Toggle Button */}
                    <button 
                        onClick={() => onUpdateProject({ isUrgent: !project.isUrgent })}
                        className={`p-1 rounded-md transition-all duration-300 ${project.isUrgent ? 'text-orange-500 bg-orange-100 scale-110' : 'text-slate-300 hover:text-orange-400 hover:scale-110'}`}
                        title={project.isUrgent ? "Bỏ gấp" : "Đánh dấu Gấp"}
                    >
                        <Flame size={14} fill={project.isUrgent ? "currentColor" : "none"} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold truncate transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400" title={project.projectName}>{project.projectName}</h3>
                </div>
            </div>

            {/* Middle: Stats (Budget & Deadline) */}
            <div className="flex items-center gap-6 md:gap-8 w-full md:w-auto mt-2 md:mt-0 justify-between md:justify-end">
                
                {/* Deadline */}
                <div className="flex flex-col items-start md:items-end min-w-[80px]">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Deadline</span>
                    <div className="flex items-center gap-1.5 group/date">
                        <Calendar size={12} className="opacity-50 text-slate-400"/> 
                        <input 
                            value={localDate}
                            disabled={isComplex}
                            onChange={(e) => setLocalDate(e.target.value)}
                            onBlur={handleProjectDateBlur}
                            placeholder="dd/mm"
                            className={`text-xs font-bold bg-transparent border-b border-transparent outline-none w-12 text-right transition-all ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} ${!isComplex ? 'hover:border-dashed border-slate-300 dark:border-slate-600' : 'opacity-70 cursor-not-allowed'}`}
                            title={isComplex ? "Ngày được tính tự động từ các task con" : "Sửa ngày deadline"}
                        />
                    </div>
                </div>

                {/* Budget */}
                <div className="flex flex-col items-start md:items-end min-w-[120px]">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Ngân sách</span>
                        {/* Payment Status Toggle */}
                        <button 
                            onClick={togglePaymentStatus}
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${project.paymentStatus === PaymentStatus.PAID ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20' : 'bg-amber-100 text-amber-600 hover:bg-amber-200'}`}
                        >
                            {project.paymentStatus === PaymentStatus.PAID ? 'Đã thu' : 'Chờ thu'}
                        </button>
                    </div>
                    <div className="flex items-center gap-1 group/input">
                        <input
                            type="text"
                            value={localBudget}
                            readOnly={isComplex}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                setLocalBudget(formatNumber(val));
                            }}
                            onBlur={handleProjectBudgetBlur}
                            title={isComplex ? "Ngân sách được cộng từ các task con" : "Nhập số tiền"}
                            className={`w-full text-right bg-transparent border-b border-transparent outline-none font-mono font-bold text-sm transition-colors ${isDarkMode ? 'text-slate-200' : 'text-slate-700'} ${!isComplex ? 'hover:border-dashed border-slate-300 dark:border-slate-700' : 'cursor-default opacity-80'}`}
                        />
                        <span className="text-[9px] font-bold text-slate-400">₫</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 pl-4 border-l border-slate-100 dark:border-slate-800">
                    <button 
                        onClick={() => onPrintInvoice(project)}
                        className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-indigo-400' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600 hover:scale-110'}`}
                        title="Xuất Hóa đơn"
                    >
                        <Printer size={16} />
                    </button>
                    
                    <button 
                        onClick={() => onDelete()}
                        className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-red-400' : 'text-slate-400 hover:bg-slate-50 hover:text-red-600 hover:scale-110'}`}
                        title="Xóa dự án"
                    >
                        <Trash2 size={16} />
                    </button>
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`p-2 rounded-lg transition-all duration-300 ${isExpanded ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : (isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-50')}`}
                    >
                        <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>
        </div>
        
        {/* Progress Bar (Very thin line at bottom of row) */}
        <div className={`absolute bottom-0 left-0 right-0 h-[3px] bg-transparent rounded-b-2xl transition-all duration-500 ${isExpanded ? 'opacity-0' : 'opacity-100'}`}>
             <div className={`h-full ${project.status === ProjectStatus.COMPLETED ? 'bg-emerald-500' : 'bg-indigo-500'} transition-all duration-1000 ease-out`} style={{ width: `${progress}%` }} />
        </div>

        {/* Expanded Area */}
        {isExpanded && (
            <div className={`px-5 pb-5 pt-2 border-t animate-in slide-in-from-top-2 duration-300 ${isDarkMode ? 'border-slate-800' : 'border-slate-50'}`}>
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Danh sách công việc ({completedTasks}/{totalTasks})</span>
                    <span className="text-[10px] font-bold text-indigo-500">{progress}% Hoàn thành</span>
                </div>
                
                <div className="space-y-2">
                    {project.tasks.map(task => (
                        <TaskItem 
                            key={task.id}
                            task={task}
                            isDarkMode={isDarkMode}
                            onUpdate={(updates) => onUpdateTask(task.id, updates)}
                        />
                    ))}
                </div>

                <form onSubmit={handleAddTask} className="flex gap-2 mt-4">
                  <input 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Thêm đầu việc mới..."
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border outline-none bg-transparent transition-all duration-200 ${isDarkMode ? 'border-slate-700 focus:border-indigo-500' : 'border-slate-200 focus:border-indigo-500'}`}
                  />
                  <button type="submit" disabled={!newTaskTitle.trim()} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"><Plus size={14}/></button>
               </form>
            </div>
        )}
    </div>
  );
};

const App: React.FC = () => {
  // Data State
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
        const saved = localStorage.getItem('ff_projects_v9');
        return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch (e) {
        return INITIAL_PROJECTS;
    }
  });
  
  const [clients, setClients] = useState<Client[]>(() => {
      try {
          const saved = localStorage.getItem('ff_clients_v1');
          return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
      } catch (e) {
          return INITIAL_CLIENTS;
      }
  });

  const [sheetWebhookUrl, setSheetWebhookUrl] = useState(() => {
      return localStorage.getItem('ff_sheet_url') || '';
  });

  // UI State
  const [isDarkMode, setIsDarkMode] = useState(() => {
      try {
          return localStorage.getItem('ff_theme') === 'dark';
      } catch (e) {
          return false;
      }
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // State for Sidebar
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'finance' | 'clients' | 'ai' | 'focus' | 'daily'>('dashboard');
  const [appMode, setAppMode] = useState<'work' | 'study'>('work'); // New: Switch between Work/Study Mode

  // Daily View State
  const [showTaskHistory, setShowTaskHistory] = useState(false);

  // Sort & Filter State
  const [projectFilter, setProjectFilter] = useState<'all' | 'urgent' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'deadline-asc' | 'deadline-desc' | 'budget-desc' | 'newest'>('deadline-asc');
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  const [financeFilter, setFinanceFilter] = useState<'all' | 'completed' | 'active'>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSheetConfig, setShowSheetConfig] = useState(false);
  
  // AI Tab State
  const [aiPrompt, setAiPrompt] = useState('');
  
  // Creation Modal State
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectType, setProjectType] = useState<'single' | 'complex'>('single');
  const [formDeadline, setFormDeadline] = useState('');
  const [tempTasks, setTempTasks] = useState<Task[]>([]);
  const [smartInput, setSmartInput] = useState('');
  const [complexBudget, setComplexBudget] = useState<number>(0);
  const [formBudgetDisplay, setFormBudgetDisplay] = useState(''); // State riêng để hiển thị budget có dấu chấm
  
  // Client Selector State
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [isAddingNewClient, setIsAddingNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientColor, setNewClientColor] = useState(PASTEL_PALETTE[0].hex);
  const clientDropdownRef = useRef<HTMLDivElement>(null);

  // Tab Clients Management State
  const [tabClientName, setTabClientName] = useState('');
  const [tabClientColor, setTabClientColor] = useState(PASTEL_PALETTE[0].hex);

  // --- LIFTED FOCUS MODE STATE ---
  const [focusPhase, setFocusPhase] = useState<'setup' | 'active' | 'break'>('setup');
  const [focusSetupMinutes, setFocusSetupMinutes] = useState(25);
  const [focusTargetSessions, setFocusTargetSessions] = useState(4);
  const [focusTimeLeft, setFocusTimeLeft] = useState(25 * 60);
  const [focusIsActive, setFocusIsActive] = useState(false);
  const [focusSessionsCompleted, setFocusSessionsCompleted] = useState(0);
  const [focusStats, setFocusStats] = useState(() => {
      const today = new Date().toDateString();
      const stored = localStorage.getItem('ff_focus_stats');
      if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.date === today) return parsed;
      }
      return { date: today, todayMins: 0, weekMins: 0, monthMins: 0 };
  });
  
  // Audio Ref for Timer
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
      audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audioRef.current.volume = 0.5;
  }, []);

  // --- GLOBAL TIMER LOGIC ---
  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (focusIsActive && focusTimeLeft > 0) {
          interval = setInterval(() => {
              setFocusTimeLeft((prev) => {
                  if (prev === 11 && audioRef.current) {
                      audioRef.current.play().catch(e => console.log("Audio play failed", e));
                  }
                  return prev - 1;
              });
          }, 1000);
      } else if (focusTimeLeft === 0 && focusIsActive) {
          setFocusIsActive(false);
          handleSessionComplete();
      }
      return () => clearInterval(interval);
  }, [focusIsActive, focusTimeLeft]);

  const handleSessionComplete = () => {
      // Update Stats
      const addedMins = focusPhase === 'active' ? focusSetupMinutes : 0; 
      if (addedMins > 0) {
          const newStats = {
              ...focusStats,
              todayMins: focusStats.todayMins + addedMins,
              weekMins: focusStats.weekMins + addedMins, 
              monthMins: focusStats.monthMins + addedMins
          };
          setFocusStats(newStats);
          localStorage.setItem('ff_focus_stats', JSON.stringify(newStats));
          setFocusSessionsCompleted(prev => prev + 1);
      }

      if (window.confirm("Hết giờ! Bạn có muốn nghỉ ngơi chút không?\n\nOK: Nghỉ 5 phút.\nCancel: Tiếp tục làm việc.")) {
          startBreak(5);
      } else {
          setFocusPhase('active');
          setFocusTimeLeft(focusSetupMinutes * 60);
      }
  };

  const startFocus = () => {
      setFocusPhase('active');
      setFocusTimeLeft(focusSetupMinutes * 60);
      setFocusIsActive(true);
      setIsDarkMode(true);
  };

  const startBreak = (mins: number) => {
      setFocusPhase('break');
      setFocusTimeLeft(mins * 60);
      setFocusIsActive(true);
  };

  const stopFocus = () => {
      setFocusIsActive(false);
      setFocusPhase('setup');
  };

  const formatFocusTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  // --- END FOCUS MODE STATE ---

  // Date & Summary Helper
  const currentDateDisplay = useMemo(() => getFullDateDisplay(), []);
  
  // Logic ngày cuối tháng chính xác
  const { isMonthEnd, daysToMonthEnd } = useMemo(() => {
      const today = new Date();
      // Lấy ngày cuối cùng của tháng hiện tại: ngày 0 của tháng sau
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const isEnd = today.getDate() === lastDayOfMonth.getDate();
      const diffDays = lastDayOfMonth.getDate() - today.getDate();
      
      return { isMonthEnd: isEnd, daysToMonthEnd: diffDays };
  }, []);

  // Daily View Data Logic
  const getDailyTasks = useMemo(() => {
      const allTasks = projects.flatMap(p => p.tasks.map(t => ({
          ...t,
          projectId: p.id,
          projectTitle: p.projectName,
          projectColor: p.clientColor,
          clientName: p.clientName // Added Client Name
      })));

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Sắp xếp: Quá hạn -> Hôm nay -> Tương lai
      const sorted = allTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

      // Calculate simple Today's task count for the Sidebar Card
      const todayTaskCount = sorted.filter(t => {
          if (t.completed) return false;
          const due = new Date(t.dueDate);
          due.setHours(0,0,0,0);
          return due.getTime() === today.getTime();
      }).length;

      return {
          pending: sorted.filter(t => !t.completed),
          completed: sorted.filter(t => t.completed),
          urgent: sorted.filter(t => {
              if (t.completed) return false;
              const due = new Date(t.dueDate);
              due.setHours(0,0,0,0);
              const diffTime = due.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
              // Urgent if overdue or due within 3 days
              return diffDays <= 3;
          }),
          upcoming: sorted.filter(t => {
              if (t.completed) return false;
              const due = new Date(t.dueDate);
              due.setHours(0,0,0,0);
              const diffTime = due.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              // Upcoming if due in more than 3 days
              return diffDays > 3;
          }),
          todayTaskCount // Export this count
      };
  }, [projects]);

  const handleGenerateMonthSummary = () => {
      if (!isMonthEnd) return;

      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      // Lọc các dự án trong tháng này (dựa trên created date hoặc deadline)
      const monthProjects = projects.filter(p => {
          const d = new Date(p.createdAt);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      const totalEarnedMonth = monthProjects.reduce((sum, p) => sum + (p.paymentStatus === PaymentStatus.PAID ? p.budget : 0), 0);
      const focusHours = Math.round(focusStats.monthMins / 60 * 10) / 10;
      
      const prompt = `Create a vertical 9:16 infographic image for my freelance monthly summary.
Style: Clean, Minimalist, Modern, High-contrast, Swiss Design. Use bold typography for numbers. Limited color palette (mainly white background with bold accent colors like Indigo, Emerald, and Slate). Avoid clutter.
Content to display clearly:
- Month: ${currentMonth + 1}/${currentYear} (Make this the title)
- Total Income: ${formatVND(totalEarnedMonth)} (Highlight this number)
- Projects Completed: ${monthProjects.filter(p => p.status === ProjectStatus.COMPLETED).length}
- Focus Hours: ${focusHours} hours
- Active Projects: ${monthProjects.length}

The vibe should be professional yet celebrating a month of hard work. Focus on the stats.`;

      navigator.clipboard.writeText(prompt);
      window.open('https://gemini.google.com/app', '_blank');
      alert('Đã copy dữ liệu tổng kết tháng! Hãy dán vào Gemini để tạo ảnh.');
  };

  // Persistence
  useEffect(() => {
    localStorage.setItem('ff_projects_v9', JSON.stringify(projects));
  }, [projects]);
  
  useEffect(() => {
    localStorage.setItem('ff_clients_v1', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('ff_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
      localStorage.setItem('ff_sheet_url', sheetWebhookUrl);
  }, [sheetWebhookUrl]);

  // Click outside to close client dropdown
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
              setIsClientDropdownOpen(false);
              setIsAddingNewClient(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset modal state
  useEffect(() => {
    if (isAddingProject) {
        setProjectType('single');
        setTempTasks([]);
        setFormDeadline('');
        setSmartInput('');
        setComplexBudget(0);
        setFormBudgetDisplay('');
        setSelectedClientId(null);
        setIsClientDropdownOpen(false);
        setIsAddingNewClient(false);
    }
  }, [isAddingProject]);

  // Auto-calc logic
  useEffect(() => {
    if (projectType === 'complex' && tempTasks.length > 0) {
        const totalTaskBudget = tempTasks.reduce((acc, t) => acc + (t.budget || 0), 0);
        setComplexBudget(totalTaskBudget);
        const validDates = tempTasks.map(t => new Date(t.dueDate).getTime()).filter(d => !isNaN(d));
        if (validDates.length > 0) {
            const maxDate = new Date(Math.max(...validDates));
            setFormDeadline(maxDate.toISOString().split('T')[0]);
        }
    }
  }, [tempTasks, projectType]);

  // Handle Scroll to highlighted project
  useEffect(() => {
      if (activeTab === 'projects' && highlightedProjectId) {
          setTimeout(() => {
              const element = document.getElementById(`project-${highlightedProjectId}`);
              if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  // Remove highlight after animation
                  setTimeout(() => setHighlightedProjectId(null), 3000);
              }
          }, 300); // Small delay to ensure render
      }
  }, [activeTab, highlightedProjectId]);

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

  // Filter and Sort Projects
  const filteredAndSortedProjects = useMemo(() => {
    let result = projects.filter(p => {
        if (projectFilter === 'all') return true;
        if (projectFilter === 'urgent') return p.isUrgent;
        if (projectFilter === 'active') return p.status !== ProjectStatus.COMPLETED;
        if (projectFilter === 'completed') return p.status === ProjectStatus.COMPLETED;
        return true;
    });

    result.sort((a, b) => {
        switch (sortBy) {
            case 'deadline-asc': return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            case 'deadline-desc': return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
            case 'budget-desc': return b.budget - a.budget;
            case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            default: return 0;
        }
    });
    return result;
  }, [projects, projectFilter, sortBy]);

  const filteredFinanceProjects = projects.filter(p => {
    if (financeFilter === 'all') return true;
    if (financeFilter === 'completed') return p.status === ProjectStatus.COMPLETED;
    if (financeFilter === 'active') return p.status !== ProjectStatus.COMPLETED;
    return true;
  });

  // Handlers
  const handleNavigateToProject = (id: string) => {
      setProjectFilter('all'); // Reset filter to ensure it's visible
      setHighlightedProjectId(id);
      setActiveTab('projects');
  };

  const handlePrintInvoice = (project: Project) => {
    const html = generateInvoiceHTML(project);
    const printWindow = window.open('', '', 'width=800,height=800');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(projects.map(p => {
        if (p.id === projectId) {
            const updatedProject = { ...p, ...updates };
            // Auto-complete logic: If status is set to COMPLETED, mark all tasks as completed
            if (updates.status === ProjectStatus.COMPLETED) {
                updatedProject.tasks = p.tasks.map(t => ({ ...t, completed: true }));
            }
            return updatedProject;
        }
        return p;
    }));
  };

  const updateTask = (projectId: string, taskId: string, updates: Partial<Task>) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const updatedTasks = p.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
        
        // Luôn tính lại deadline và budget của dự án cha nếu có task con
        let newDeadline = p.deadline;
        let newBudget = p.budget;
        
        if (updatedTasks.length > 0) {
             newDeadline = calculateProjectDeadline(updatedTasks, p.deadline);
             // Sum budget
             newBudget = updatedTasks.reduce((sum, t) => sum + (t.budget || 0), 0);
        }

        return {
          ...p,
          tasks: updatedTasks,
          deadline: newDeadline,
          budget: newBudget
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
      color: TASK_COLORS[Math.floor(Math.random() * TASK_COLORS.length)].value,
      budget: 0 // Initialize with 0 budget
    };
    
    setProjects(projects.map(p => {
        if (p.id === projectId) {
            const updatedTasks = [...p.tasks, newTask];
            const newDeadline = calculateProjectDeadline(updatedTasks, p.deadline);
            // Budget doesn't change on add because new task budget is 0
            return { ...p, tasks: updatedTasks, deadline: newDeadline };
        }
        return p;
    }));
  };

  const handleSmartInputAdd = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && smartInput.trim()) {
          e.preventDefault();
          let title = smartInput;
          let dateStr = "";
          let budgetRaw = "";

          // Parse Format: Title - Date - Amount
          const parts = smartInput.split('-').map(s => s.trim());
          if (parts.length >= 1) title = parts[0];
          if (parts.length >= 2) dateStr = parts[1];
          if (parts.length >= 3) budgetRaw = parts[2];

          const parsedDate = parseSmartDate(dateStr) || new Date().toISOString().split('T')[0];
          const parsedBudget = parseNumber(budgetRaw);

          const newTask: Task = {
              id: Math.random().toString(36).substr(2, 9),
              title: title,
              dueDate: parsedDate,
              completed: false,
              color: TASK_COLORS[tempTasks.length % TASK_COLORS.length].value,
              budget: parsedBudget
          };
          setTempTasks([...tempTasks, newTask]);
          setSmartInput('');
      }
  };

  const handleAddNewClient = () => {
      if (!newClientName.trim()) return;
      const newClient: Client = {
          id: Math.random().toString(36).substr(2, 9),
          name: newClientName,
          color: newClientColor
      };
      setClients([...clients, newClient]);
      setSelectedClientId(newClient.id);
      setIsAddingNewClient(false);
      setNewClientName('');
      setIsClientDropdownOpen(false);
  };

  const handleAddClientFromTab = () => {
      if (!tabClientName.trim()) return;
      const newClient: Client = {
          id: Math.random().toString(36).substr(2, 9),
          name: tabClientName,
          color: tabClientColor
      };
      setClients([...clients, newClient]);
      setTabClientName('');
  }

  const handleDeleteClient = (clientId: string) => {
      if (window.confirm('Bạn có chắc muốn xóa công ty này khỏi danh sách? (Dự án cũ vẫn giữ nguyên)')) {
          setClients(prev => prev.filter(c => c.id !== clientId));
      }
  };

  const handleSyncToSheet = async () => {
      if (!sheetWebhookUrl) {
          setShowSheetConfig(true);
          return;
      }

      setIsSyncing(true);
      try {
          // Prepare payload data: Only send essential finance data
          const payload = projects.map(p => ({
              date: new Date(p.createdAt).toLocaleDateString('vi-VN'),
              client: p.clientName,
              project: p.projectName,
              budget: p.budget,
              status: p.paymentStatus,
              deadline: formatDateDisplay(p.deadline)
          }));

          await fetch(sheetWebhookUrl, {
              method: 'POST',
              mode: 'no-cors', 
              headers: {
                  'Content-Type': 'text/plain',
              },
              body: JSON.stringify(payload)
          });
          
          alert('Đã gửi yêu cầu Sync! Vui lòng kiểm tra Google Sheet sau vài giây.');
      } catch (error) {
          console.error("Sync Error", error);
          alert('Có lỗi khi Sync. Vui lòng kiểm tra lại URL hoặc kết nối mạng.');
      } finally {
          setIsSyncing(false);
      }
  };

  const handleCopyScript = () => {
      navigator.clipboard.writeText(GOOGLE_SCRIPT_CODE);
      alert('Đã copy đoạn mã Script! Hãy paste vào Extensions > Apps Script trong Sheet của bạn.');
  };

  const handleGenerateAiPrompt = () => {
      const context = projects.map(p => `- Dự án: ${p.projectName} (${p.status}). Budget: ${formatNumber(p.budget)} VNĐ. Deadline: ${formatDateDisplay(p.deadline)}.`).join('\n');
      const fullPrompt = `Dữ liệu freelance hiện tại của tôi:\n${context}\n\nTổng doanh thu đã nhận: ${formatNumber(stats.totalEarned)} VNĐ.\n\nYêu cầu của tôi: ${aiPrompt}`;
      
      navigator.clipboard.writeText(fullPrompt);
      window.open('https://gemini.google.com/app', '_blank');
      alert('Đã copy dữ liệu vào Clipboard và mở Gemini! Hãy dán (Ctrl+V) vào ô chat.');
  };

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Client Validation
    if (!selectedClientId) {
        alert("Vui lòng chọn khách hàng/công ty!");
        return;
    }
    const selectedClient = clients.find(c => c.id === selectedClientId);

    let deadline = formDeadline;
    if (projectType === 'single' && !deadline) {
        let rawDeadline = formData.get('deadline') as string;
        deadline = parseSmartDate(rawDeadline) || new Date().toISOString().split('T')[0];
    }
    
    // Lấy budget từ form hoặc complex calc
    const budget = projectType === 'complex' ? complexBudget : parseNumber(formData.get('budget') as string);

    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      clientName: selectedClient?.name || 'Unknown',
      clientColor: selectedClient?.color,
      projectName: formData.get('projectName') as string,
      description: (formData.get('description') as string) || '',
      status: ProjectStatus.PLANNING,
      deadline: deadline,
      budget: budget,
      tasks: projectType === 'complex' ? tempTasks : [],
      paymentStatus: PaymentStatus.PENDING,
      createdAt: new Date().toISOString(),
      isUrgent: formData.get('isUrgent') === 'on',
      type: projectType
    };
    
    setProjects([...projects, newProject]);
    setIsAddingProject(false);
  };

  const selectedClientDisplay = clients.find(c => c.id === selectedClientId);

  return (
    <div className={`flex flex-col md:flex-row h-screen overflow-hidden transition-all duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      {/* Sidebar - Dynamic Width */}
      <aside className={`border-r p-6 flex flex-col gap-6 transition-[width] duration-300 ease-in-out h-full overflow-y-auto flex-shrink-0 ${isSidebarCollapsed ? 'w-[88px]' : 'w-full md:w-64'} ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isSidebarCollapsed && (
            <button 
              onClick={() => setAppMode(prev => prev === 'work' ? 'study' : 'work')}
              className="flex items-center gap-2 animate-in fade-in duration-300 hover:scale-[1.02] transition-transform active:scale-95 text-left w-full group"
            >
                <div className={`p-2 rounded-lg shadow-lg text-white transition-colors duration-300 ${appMode === 'work' ? (isDarkMode ? 'bg-indigo-500 shadow-indigo-500/20' : 'bg-slate-900 shadow-slate-200') : (isDarkMode ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-teal-700 shadow-teal-200')}`}>
                    {appMode === 'work' ? <CheckSquare size={18} /> : <GraduationCap size={18} />}
                </div>
                <div>
                    <h1 className="text-xl font-black tracking-tight italic leading-none">{appMode === 'work' ? 'Todo Task' : 'Study Task'}</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">Switch Mode</p>
                </div>
            </button>
          )}
          {isSidebarCollapsed && (
              <button 
                onClick={() => setAppMode(prev => prev === 'work' ? 'study' : 'work')}
                className={`p-2 rounded-lg shadow-lg text-white mb-2 transition-colors duration-300 ${appMode === 'work' ? (isDarkMode ? 'bg-indigo-500 shadow-indigo-500/20' : 'bg-slate-900 shadow-slate-200') : (isDarkMode ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-teal-700 shadow-teal-200')}`}
                title={appMode === 'work' ? "Chuyển sang Study Mode" : "Chuyển sang Work Mode"}
              >
                  {appMode === 'work' ? <CheckSquare size={20} /> : <GraduationCap size={20} />}
              </button>
          )}
        </div>

        {/* DAILY TASK CARD */}
        <div className="mb-2">
            <DailyTaskCard 
                isDarkMode={isDarkMode} 
                isCollapsed={isSidebarCollapsed} 
                onClick={() => setActiveTab('daily')} 
                isActive={activeTab === 'daily'} 
                taskCount={getDailyTasks.todayTaskCount}
            />
        </div>

        <nav className="space-y-2 flex-1">
          {appMode === 'work' ? (
              <>
                <NavItem isDarkMode={isDarkMode} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20}/>} label="Tổng quan" isCollapsed={isSidebarCollapsed} />
                <NavItem isDarkMode={isDarkMode} active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} icon={<Target size={20}/>} label="Dự án" isCollapsed={isSidebarCollapsed} />
                <NavItem isDarkMode={isDarkMode} active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<DollarSign size={20}/>} label="Doanh thu" isCollapsed={isSidebarCollapsed} />
                <NavItem isDarkMode={isDarkMode} active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} icon={<Building2 size={20}/>} label="Công ty" isCollapsed={isSidebarCollapsed} />
                
                <div className={`pt-4 mt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <NavItem isDarkMode={isDarkMode} active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<Bot size={20}/>} label="Trợ lý AI" isCollapsed={isSidebarCollapsed} />
                </div>
              </>
          ) : (
              <>
                {/* Study Mode Navigation Placeholder */}
                <NavItem isDarkMode={isDarkMode} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20}/>} label="Góc học tập" isCollapsed={isSidebarCollapsed} />
                <NavItem isDarkMode={isDarkMode} active={false} onClick={() => {}} icon={<BookOpen size={20}/>} label="Môn học" isCollapsed={isSidebarCollapsed} />
                <NavItem isDarkMode={isDarkMode} active={false} onClick={() => {}} icon={<NotebookPen size={20}/>} label="Bài tập" isCollapsed={isSidebarCollapsed} />
                <NavItem isDarkMode={isDarkMode} active={false} onClick={() => {}} icon={<Library size={20}/>} label="Tài liệu" isCollapsed={isSidebarCollapsed} />
              </>
          )}
        </nav>

        {/* Mini Timer Popup inside Sidebar Area */}
        {activeTab !== 'focus' && focusPhase !== 'setup' && (
            <MiniFocusTimer 
                timeLeft={focusTimeLeft}
                phase={focusPhase}
                isActive={focusIsActive}
                isDarkMode={isDarkMode}
                isSidebarCollapsed={isSidebarCollapsed}
                onToggle={() => setFocusIsActive(!focusIsActive)}
                onClick={() => setActiveTab('focus')}
            />
        )}

        <div className={`flex flex-col gap-3 pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
             {/* New Focus Tab */}
             <NavItem 
                isDarkMode={isDarkMode} 
                active={activeTab === 'focus'} 
                onClick={() => setActiveTab('focus')} 
                icon={<Zap size={20}/>} 
                label="Focus Mode" 
                isCollapsed={isSidebarCollapsed} 
                isSpecial
             />

             <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center ${isDarkMode ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`} title="Chế độ màu">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`} title={isSidebarCollapsed ? "Mở rộng" : "Thu gọn"}>
                {isSidebarCollapsed ? <PanelLeftOpen size={20}/> : <PanelLeftClose size={20}/>}
             </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 h-full overflow-y-auto w-full relative">
        {/* NEW FIXED BUTTON - Positioned relative to viewport */}
        {activeTab !== 'focus' && (
             <button 
                onClick={() => setIsAddingProject(true)} 
                className="fixed top-6 right-6 z-50 flex items-center gap-2 px-6 h-[58px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all duration-300 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 text-sm"
            >
                <Plus size={22} strokeWidth={3} />
                <span>{appMode === 'work' ? 'Dự án mới' : 'Bài tập mới'}</span>
            </button>
        )}

        {appMode === 'work' ? (
            // Existing WORK MODE content
            <>
                {activeTab !== 'focus' && (
                    <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 animate-in slide-in-from-top-4 duration-500">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">
                                {activeTab === 'dashboard' ? 'Chào ngày mới!' : 
                                activeTab === 'projects' ? 'Dự án của bạn' : 
                                activeTab === 'clients' ? 'Quản lý Công ty' :
                                activeTab === 'finance' ? 'Quản lý doanh thu' :
                                activeTab === 'daily' ? 'Công việc hàng ngày' :
                                'Trợ lý Tài chính'}
                            </h2>
                            <p className={`font-bold mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {activeTab === 'dashboard' ? (
                                    <span className="flex items-center gap-2"><CalendarDays size={16}/> {currentDateDisplay}</span>
                                ) : activeTab === 'daily' ? (
                                    "Tập trung hoàn thành các mục tiêu trong ngày."
                                ) : (
                                    `Bạn có ${stats.activeCount} dự án đang tiến hành.`
                                )}
                            </p>
                        </div>

                        {activeTab === 'dashboard' && (
                            // Added margin-right xl:mr-44 to ensure Month Summary doesn't overlap fixed button
                            <div className="flex flex-wrap gap-4 items-center w-full xl:w-auto xl:mr-44">
                                {/* Month Summary Button - Clean Modern Logic */}
                                <div 
                                    className={`group flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 ${isMonthEnd ? 'cursor-pointer hover:shadow-lg border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900' : 'cursor-not-allowed opacity-60 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'}`} 
                                    onClick={handleGenerateMonthSummary}
                                    title={isMonthEnd ? "Tạo báo cáo tháng ngay" : `Còn ${daysToMonthEnd} ngày nữa mới đến cuối tháng`}
                                >
                                    <div className={`p-2 rounded-xl transition-colors ${isMonthEnd ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'}`}>
                                        {isMonthEnd ? <Sparkles size={18} strokeWidth={2.5}/> : <Lock size={18}/>}
                                    </div>
                                    <div className="text-right">
                                        <span className={`block text-[10px] font-black uppercase tracking-widest ${isMonthEnd ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>Tổng kết tháng</span>
                                        <span className={`block text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                            {isMonthEnd ? "Sẵn sàng tạo" : `Còn ${daysToMonthEnd} ngày`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </header>
                )}

                {/* --- RENDER WORK TABS --- */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <DashboardCard isDarkMode={isDarkMode} label="Thực thu" value={formatVND(stats.totalEarned)} icon={<CheckCircle2 className="text-emerald-500"/>} trend="Tiền về ví" />
                      <DashboardCard isDarkMode={isDarkMode} label="Chưa thu" value={formatVND(stats.pendingInvoices)} icon={<Clock className="text-amber-500"/>} trend="Chờ thanh toán" />
                      <DashboardCard isDarkMode={isDarkMode} label="Hoàn thành" value={`${Math.round(stats.overallProgress)}%`} icon={<Target className="text-indigo-500"/>} trend="Tổng tiến độ" />
                      <DashboardCard isDarkMode={isDarkMode} label="Active" value={stats.activeCount.toString()} icon={<Briefcase className="text-slate-500"/>} trend="Đang làm" />
                    </div>
                    {/* ... rest of dashboard ... */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className={`lg:col-span-2 p-6 rounded-2xl border shadow-sm transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <h3 className="text-lg font-bold mb-6">Ngân sách (Triệu VNĐ)</h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1E293B' : '#F1F5F9'} />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11}} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11}} />
                              <Tooltip 
                                cursor={{fill: isDarkMode ? '#1E293B' : '#F8FAFC'}} 
                                contentStyle={{borderRadius: '12px', border: 'none', backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', color: isDarkMode ? '#F8FAFC' : '#0F172A', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                formatter={(val: any) => [`${val}M VNĐ`, 'Budget']}
                              />
                              <Bar dataKey="budget" radius={[4, 4, 0, 0]} barSize={40} animationDuration={1000}>
                                {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.progress === 100 ? '#10B981' : '#6366F1'} />))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className={`p-6 rounded-2xl border shadow-sm flex flex-col transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Flame size={18} className="text-orange-500" />Việc GẤP</h3>
                        <div className="space-y-3 flex-1 overflow-y-auto">
                          {projects.filter(p => p.isUrgent && p.status !== ProjectStatus.COMPLETED).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).slice(0, 5).map(p => (
                            <div 
                                key={p.id} 
                                onClick={() => handleNavigateToProject(p.id)}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer hover:scale-102 hover:shadow-md ${isDarkMode ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-50/50 border-orange-100'}`}
                            >
                              <div><h4 className="font-bold text-xs truncate max-w-[120px]">{p.projectName}</h4><p className="text-[10px] text-orange-500 font-black uppercase">DL: {formatDateDisplay(p.deadline)}</p></div>
                              <ArrowRight size={14} className="text-orange-400" />
                            </div>
                          ))}
                          {projects.filter(p => p.isUrgent && p.status !== ProjectStatus.COMPLETED).length === 0 && <p className="text-xs text-slate-500 italic text-center py-10">Không có việc gấp nào.</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'projects' && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        {/* Filter Group - Styled Cleaner & Grid Full Width */}
                        <div className={`grid grid-cols-4 gap-1 p-1.5 rounded-xl w-full md:w-auto ${isDarkMode ? 'bg-slate-800' : 'bg-white border border-slate-200 shadow-sm'}`}>
                            <FilterButton isDarkMode={isDarkMode} active={projectFilter === 'all'} onClick={() => setProjectFilter('all')} label="Tất cả" />
                            <FilterButton isDarkMode={isDarkMode} active={projectFilter === 'urgent'} onClick={() => setProjectFilter('urgent')} label="Gấp" />
                            <FilterButton isDarkMode={isDarkMode} active={projectFilter === 'active'} onClick={() => setProjectFilter('active')} label="Active" />
                            <FilterButton isDarkMode={isDarkMode} active={projectFilter === 'completed'} onClick={() => setProjectFilter('completed')} label="Xong" />
                        </div>
                        
                        {/* Sort Control - Styled as Custom Dropdown */}
                        <div className="relative group min-w-[180px]">
                            <div className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${isDarkMode ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-400 group-hover:text-indigo-600'}`}>
                                <ArrowUpDown size={14} />
                            </div>
                            <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className={`w-full appearance-none pl-9 pr-8 py-2.5 rounded-xl font-bold text-xs outline-none border transition-all cursor-pointer ${
                                    isDarkMode 
                                        ? 'bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-600 focus:border-indigo-500' 
                                        : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 focus:border-indigo-500 shadow-sm'
                                }`}
                            >
                                <option value="deadline-asc">Deadline gần nhất</option>
                                <option value="deadline-desc">Deadline xa nhất</option>
                                <option value="budget-desc">Giá trị cao nhất</option>
                                <option value="newest">Mới nhất</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ChevronDown size={14} />
                            </div>
                        </div>
                    </div>
                    
                    {/* New Horizontal List Layout */}
                    <div className="flex flex-col gap-4">
                      {filteredAndSortedProjects.map(project => (
                        <ProjectRow 
                          key={project.id} 
                          isDarkMode={isDarkMode}
                          project={project} 
                          onDelete={() => setProjects(projects.filter(p => p.id !== project.id))}
                          onUpdateTask={(tid, updates) => updateTask(project.id, tid, updates)}
                          onUpdateProject={(updates) => updateProject(project.id, updates)}
                          onAddTask={(title) => addTaskToProject(project.id, title)}
                          onPrintInvoice={handlePrintInvoice}
                          isHighlighted={highlightedProjectId === project.id}
                        />
                      ))}
                      {filteredAndSortedProjects.length === 0 && (
                          <div className="text-center py-20 text-slate-400 italic text-sm">Chưa có dự án nào.</div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'clients' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Add New Client Section */}
                        <div className={`p-6 rounded-2xl border shadow-sm transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                            <h3 className="text-lg font-black mb-4 flex items-center gap-2"><Plus size={18} className="text-indigo-500"/>Thêm công ty mới</h3>
                            
                            <div className="flex flex-col gap-4">
                                <div className="w-full space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên công ty</label>
                                    <input 
                                        value={tabClientName}
                                        onChange={(e) => setTabClientName(e.target.value)}
                                        placeholder="Nhập tên..."
                                        className={`w-full px-4 py-3 rounded-xl outline-none border transition-all duration-300 font-bold text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-500'}`}
                                    />
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 md:items-end">
                                    <div className="space-y-1 flex-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Màu đại diện</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {PASTEL_PALETTE.map((c) => (
                                                <button 
                                                    key={c.hex} 
                                                    type="button"
                                                    onClick={() => setTabClientColor(c.hex)}
                                                    className={`w-8 h-8 rounded-full border-2 transition-transform duration-300 hover:scale-125 ${tabClientColor === c.hex ? 'border-indigo-500 scale-110' : 'border-transparent'}`}
                                                    style={{backgroundColor: c.hex}}
                                                    title={c.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleAddClientFromTab}
                                        disabled={!tabClientName.trim()}
                                        className="h-[44px] px-6 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all duration-300 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 text-sm hover:translate-y-[-2px]"
                                    >
                                        Thêm ngay
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Clients List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {clients.map(client => {
                                const clientProjects = projects.filter(p => p.clientName === client.name);
                                const totalRevenue = clientProjects.reduce((sum, p) => sum + p.budget, 0);
                                const projectCount = clientProjects.length;

                                return (
                                    <div key={client.id} className={`group relative p-5 rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px] ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:shadow-slate-800/50' : 'bg-white border-slate-100 hover:shadow-slate-200'}`}>
                                        <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button 
                                                onClick={() => handleDeleteClient(client.id)}
                                                className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                            >
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl shadow-inner transition-transform duration-300 group-hover:rotate-6" style={{backgroundColor: client.color}} />
                                            <div>
                                                <h4 className="text-base font-black">{client.name}</h4>
                                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Khách hàng</p>
                                            </div>
                                        </div>
                                        
                                        <div className={`grid grid-cols-2 gap-3 p-3 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Dự án</p>
                                                <p className="text-sm font-black">{projectCount}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Doanh thu</p>
                                                <p className="text-sm font-black text-emerald-500 tracking-tighter truncate">{formatVND(totalRevenue)}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'finance' && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                     <div className={`p-6 rounded-2xl border shadow-sm transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                         <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                 <div className="p-2.5 bg-green-100 text-green-600 rounded-lg"><FileSpreadsheet size={18}/></div>
                                 <div>
                                     <h4 className="font-black text-base">Google Sheets Sync</h4>
                                     <p className="text-xs text-slate-400 font-medium">Đồng bộ dữ liệu thanh toán</p>
                                 </div>
                             </div>
                             <div className="flex gap-2">
                                {sheetWebhookUrl ? (
                                    <button 
                                        onClick={handleSyncToSheet} 
                                        disabled={isSyncing}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 text-xs"
                                    >
                                        {isSyncing ? <RefreshCw className="animate-spin" size={14}/> : <RefreshCw size={14}/>}
                                        {isSyncing ? 'Syncing...' : 'Sync'}
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setShowSheetConfig(!showSheetConfig)} 
                                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-colors flex items-center gap-2 text-xs"
                                    >
                                        <LinkIcon size={14}/> Link Sheet
                                    </button>
                                )}
                                {sheetWebhookUrl && (
                                     <button onClick={() => setShowSheetConfig(!showSheetConfig)} className="p-2 text-slate-400 hover:text-slate-600"><Edit2 size={16}/></button>
                                )}
                             </div>
                         </div>

                         {showSheetConfig && (
                             <div className="mt-4 pt-4 border-t border-dashed border-slate-200 animate-in slide-in-from-top-2">
                                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                     <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Google Script URL</label>
                                            <input 
                                                value={sheetWebhookUrl}
                                                onChange={(e) => setSheetWebhookUrl(e.target.value)}
                                                placeholder="https://script.google.com/macros/s/..."
                                                className={`w-full px-3 py-2 rounded-lg border outline-none font-medium text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                                            />
                                        </div>
                                        <div className="p-3 bg-yellow-50 rounded-lg text-yellow-800 text-[10px] leading-relaxed border border-yellow-100">
                                            <strong>Setup:</strong> Extensions {'>'} Apps Script {'>'} Paste Code {'>'} Deploy Web App (Access: Anyone).
                                        </div>
                                     </div>
                                     
                                     <div className="space-y-1">
                                         <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Apps Script Code</label>
                                            <button onClick={handleCopyScript} className="text-[10px] font-bold text-indigo-500 hover:underline flex items-center gap-1"><Copy size={10}/> Copy</button>
                                         </div>
                                         <div className={`relative rounded-lg overflow-hidden border ${isDarkMode ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                                             <pre className="p-3 text-[9px] font-mono overflow-x-auto h-24 text-slate-500">
                                                 {GOOGLE_SCRIPT_CODE}
                                             </pre>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         )}
                     </div>

                    <div className={`rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50/50 border-slate-50'}`}>
                            <div>
                                <h3 className="text-lg font-black">Thu nhập</h3>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-widest">Dòng tiền</p>
                            </div>
                            {/* Finance Status Filter */}
                            <div className={`flex p-1 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                <button onClick={() => setFinanceFilter('all')} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${financeFilter === 'all' ? (isDarkMode ? 'bg-slate-700 text-white' : 'bg-white shadow-sm text-indigo-600') : 'text-slate-400'}`}>All</button>
                                <button onClick={() => setFinanceFilter('completed')} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${financeFilter === 'completed' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-emerald-500'}`}>Completed (Thu)</button>
                                <button onClick={() => setFinanceFilter('active')} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${financeFilter === 'active' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-400 hover:text-amber-500'}`}>Active (Chờ)</button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                            <tr className={`text-[10px] font-black text-slate-400 uppercase tracking-widest ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
                                <th className="px-6 py-4">Công ty</th>
                                <th className="px-6 py-4">Dự án</th>
                                <th className="px-6 py-4">Budget</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Ngày</th>
                            </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-50'}`}>
                            {filteredFinanceProjects.map(p => (
                                <tr key={p.id} className={`transition-colors duration-200 ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/50'}`}>
                                <td className="px-6 py-4 font-bold text-xs">
                                    <span className="px-2 py-1 rounded-md text-slate-700" style={{backgroundColor: p.clientColor || '#e2e8f0'}}>{p.clientName}</span>
                                </td>
                                <td className="px-6 py-4 font-bold text-sm">{p.projectName}</td>
                                <td className="px-6 py-4 font-mono font-bold text-sm">{formatVND(p.budget)}</td>
                                <td className="px-6 py-4 text-center">
                                    <button 
                                    onClick={() => updateProject(p.id, { paymentStatus: p.paymentStatus === PaymentStatus.PAID ? PaymentStatus.PENDING : PaymentStatus.PAID })} 
                                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 ${p.paymentStatus === PaymentStatus.PAID ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}
                                    >
                                    {p.paymentStatus}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-400 font-medium text-right">{new Date(p.createdAt).toLocaleDateString('vi-VN')}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        {filteredFinanceProjects.length === 0 && (
                            <div className="py-12 text-center text-slate-400 text-xs font-medium italic">Không có dữ liệu phù hợp.</div>
                        )}
                        </div>
                    </div>
                  </div>
                )}

                {/* New AI Tab Content */}
                {activeTab === 'ai' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className={`p-8 rounded-3xl border shadow-sm transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                            <div className="max-w-3xl mx-auto text-center space-y-4 mb-8">
                                <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 animate-bounce">
                                    <Bot size={28}/>
                                </div>
                                <h3 className="text-2xl font-black">Trợ lý Tài chính AI</h3>
                                <p className="text-slate-500 font-medium text-sm">
                                    Phân tích dữ liệu tài chính và đưa ra lời khuyên quản lý dòng tiền.
                                </p>
                            </div>

                            <div className="max-w-xl mx-auto space-y-6">
                                {/* Prompt Selector - Dropdown */}
                                <div className="space-y-2">
                                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">Chọn chủ đề phân tích</label>
                                     <div className="relative">
                                         <select 
                                            onChange={(e) => setAiPrompt(e.target.value)}
                                            className={`w-full appearance-none px-4 py-3 rounded-xl text-sm font-bold border-2 outline-none cursor-pointer transition-colors duration-200 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-indigo-500' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-500'}`}
                                            defaultValue=""
                                         >
                                             <option value="" disabled>-- Chọn gợi ý --</option>
                                             {AI_SUGGESTIONS.map((s, i) => (
                                                 <option key={i} value={s}>{s}</option>
                                             ))}
                                         </select>
                                         <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"/>
                                     </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nội dung câu hỏi</label>
                                    <div className={`relative rounded-2xl border-2 transition-all duration-200 ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:within:border-indigo-500' : 'bg-slate-50 border-slate-100 focus-within:border-indigo-500'}`}>
                                        <textarea 
                                            value={aiPrompt}
                                            onChange={(e) => setAiPrompt(e.target.value)}
                                            placeholder="Hoặc tự nhập câu hỏi của bạn tại đây..."
                                            className="w-full p-4 bg-transparent outline-none min-h-[100px] font-medium resize-none text-sm"
                                        />
                                        <div className="absolute bottom-3 right-3">
                                            <MessageSquare size={14} className="text-slate-400"/>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleGenerateAiPrompt}
                                    disabled={!aiPrompt.trim()}
                                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:translate-y-[-2px] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                >
                                    <Copy size={16}/>
                                    <span>Copy Prompt & Mở Gemini</span>
                                    <ExternalLink size={14} className="opacity-70"/>
                                </button>

                                <div className={`p-3 rounded-xl text-[10px] text-center border border-dashed transition-colors ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                    Hệ thống sẽ tự động đính kèm dữ liệu: {projects.length} dự án, tổng thu {formatNumber(stats.totalEarned)}đ.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- NEW DAILY VIEW --- */}
                {activeTab === 'daily' && (
                    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
                        <div className="flex justify-end">
                            <button 
                                onClick={() => setShowTaskHistory(!showTaskHistory)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${showTaskHistory ? 'bg-indigo-600 text-white' : (isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-white text-slate-500 hover:text-indigo-600 shadow-sm border border-slate-200')}`}
                            >
                                <History size={14} /> Lịch sử Task
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
                            {/* Column 1: Cần làm (Urgent + Pending Today) */}
                            <div className={`rounded-3xl p-6 flex flex-col h-full border overflow-hidden ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white/50 border-white shadow-sm'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-black flex items-center gap-2"><Zap size={20} className="text-amber-500" fill="currentColor"/> Cần làm ngay</h3>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                        {getDailyTasks.urgent.length} tasks
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                    {getDailyTasks.urgent.map(task => (
                                        <MiniTaskCard 
                                            key={task.id}
                                            task={task}
                                            projectTitle={task.projectTitle}
                                            clientName={task.clientName}
                                            projectColor={task.projectColor}
                                            isDarkMode={isDarkMode}
                                            onToggle={() => updateTask(task.projectId, task.id, { completed: !task.completed })}
                                            isOverdue={true}
                                        />
                                    ))}
                                    {getDailyTasks.urgent.length === 0 && (
                                        <div className="text-center py-10 text-slate-400 italic text-xs">Tuyệt vời! Không có việc gấp.</div>
                                    )}
                                </div>
                            </div>

                            {/* Column 2: Sắp đến hẹn (Upcoming) */}
                            <div className={`rounded-3xl p-6 flex flex-col h-full border overflow-hidden ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white/50 border-white shadow-sm'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-black flex items-center gap-2"><Calendar size={20} className="text-indigo-500"/> Sắp đến hẹn</h3>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                        {getDailyTasks.upcoming.length} tasks
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                    {getDailyTasks.upcoming.map(task => (
                                        <MiniTaskCard 
                                            key={task.id}
                                            task={task}
                                            projectTitle={task.projectTitle}
                                            clientName={task.clientName}
                                            projectColor={task.projectColor}
                                            isDarkMode={isDarkMode}
                                            onToggle={() => updateTask(task.projectId, task.id, { completed: !task.completed })}
                                        />
                                    ))}
                                    {getDailyTasks.upcoming.length === 0 && (
                                        <div className="text-center py-10 text-slate-400 italic text-xs">Trống lịch sắp tới.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* History Modal */}
                        {showTaskHistory && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                                <div className={`w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
                                    <div className="p-6 border-b flex items-center justify-between">
                                        <h3 className="text-xl font-black">Lịch sử hoàn thành</h3>
                                        <button onClick={() => setShowTaskHistory(false)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}>
                                            <X size={20}/>
                                        </button>
                                    </div>
                                    <div className="p-6 overflow-y-auto space-y-3">
                                        {getDailyTasks.completed.map(task => (
                                            <div key={task.id} className={`p-4 rounded-xl border opacity-75 hover:opacity-100 transition-opacity ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>{task.clientName}</span>
                                                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{task.projectTitle}</span>
                                                    </div>
                                                    <CheckCheck size={14} className="text-emerald-500"/>
                                                </div>
                                                <h4 className="font-bold text-sm line-through text-slate-500">{task.title}</h4>
                                            </div>
                                        ))}
                                        {getDailyTasks.completed.length === 0 && (
                                            <p className="text-center text-slate-400 text-xs py-10">Chưa có task nào hoàn thành.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </>
        ) : (
            // STUDY MODE PLACEHOLDER CONTENT
            <div className="space-y-8 animate-in fade-in duration-500 flex flex-col items-center justify-center h-[70vh] text-center">
                <div className={`p-8 rounded-full ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'} mb-6`}>
                    <GraduationCap size={64} className={isDarkMode ? 'text-emerald-500' : 'text-teal-600'} strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-black">Góc học tập</h2>
                <p className="max-w-md text-slate-500 font-medium">
                    Chế độ dành riêng cho việc học tập. Quản lý môn học, bài tập về nhà và lịch thi cử một cách khoa học.
                </p>
                <div className="flex gap-4">
                    <button className="px-6 py-3 rounded-xl bg-teal-600 text-white font-bold shadow-lg shadow-teal-500/20 hover:scale-105 transition-transform">
                        Tạo môn học
                    </button>
                    <button className={`px-6 py-3 rounded-xl font-bold transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}>
                        Xem lịch thi
                    </button>
                </div>
            </div>
        )}

        {/* New Focus Tab Content */}
        {activeTab === 'focus' && (
            <FocusMode 
                isDarkMode={isDarkMode} 
                setIsDarkMode={setIsDarkMode} 
                projects={projects}
                // Props from lifted state
                phase={focusPhase}
                setPhase={setFocusPhase}
                setupMinutes={focusSetupMinutes}
                setSetupMinutes={setFocusSetupMinutes}
                targetSessions={focusTargetSessions}
                setTargetSessions={setFocusTargetSessions}
                timeLeft={focusTimeLeft}
                setTimeLeft={setFocusTimeLeft}
                isActive={focusIsActive}
                setIsActive={setFocusIsActive}
                sessionsCompleted={focusSessionsCompleted}
                stats={focusStats}
                startFocus={startFocus}
                stopFocus={stopFocus}
                formatTime={formatFocusTime}
            />
        )}

      </main>

      {/* Creation Modal */}
      {isAddingProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className={`rounded-3xl w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-slate-900 text-slate-100 border border-slate-800' : 'bg-white text-slate-900'}`}>
            <h2 className="text-2xl font-black mb-6 tracking-tight">Thêm dự án mới</h2>
            
            {/* Segmentation Button - Fixed: Added grid layout for full fill and increased size */}
            <div className={`grid grid-cols-2 gap-1 p-1.5 rounded-xl w-full mb-6 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <button 
                    type="button" 
                    onClick={() => setProjectType('single')} 
                    className={`flex items-center justify-center gap-3 py-3.5 px-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${projectType === 'single' ? (isDarkMode ? 'bg-slate-700 text-white' : 'bg-white text-slate-900 shadow-sm') : 'text-slate-400'}`}
                >
                    <FileType size={14}/> Dự án lẻ
                </button>
                <button 
                    type="button" 
                    onClick={() => setProjectType('complex')} 
                    className={`flex items-center justify-center gap-3 py-3.5 px-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${projectType === 'complex' ? (isDarkMode ? 'bg-slate-700 text-white' : 'bg-white text-slate-900 shadow-sm') : 'text-slate-400'}`}
                >
                    <Layers size={14}/> Dự án lớn
                </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên dự án</label><input required name="projectName" type="text" className={`w-full px-4 py-3 rounded-xl outline-none border transition-all font-bold text-sm ${isDarkMode ? 'bg-slate-800 border-slate-800 focus:border-indigo-500' : 'bg-slate-50 border-slate-50 focus:border-indigo-500'}`} placeholder="VD: Landing Page..." /></div>
                
                {/* Custom Client Selector with Color */}
                <div className="space-y-1.5 relative" ref={clientDropdownRef}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách hàng</label>
                    
                    <div 
                        onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                        className={`w-full px-4 py-3 rounded-xl border transition-all font-bold text-sm flex items-center justify-between cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-800 hover:border-indigo-500' : 'bg-slate-50 border-slate-50 hover:border-indigo-500'}`}
                    >
                        {selectedClientDisplay ? (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: selectedClientDisplay.color}} />
                                <span>{selectedClientDisplay.name}</span>
                            </div>
                        ) : (
                            <span className="text-slate-400 font-normal">Chọn khách hàng...</span>
                        )}
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Dropdown Menu - Simplified (No Delete) */}
                    {isClientDropdownOpen && (
                        <div className={`absolute top-[110%] left-0 right-0 rounded-xl shadow-xl border z-20 overflow-hidden animate-in slide-in-from-top-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            {!isAddingNewClient ? (
                                <>
                                    <div className="max-h-48 overflow-y-auto">
                                        {clients.map(client => (
                                            <div 
                                                key={client.id}
                                                className={`flex items-center justify-between px-4 py-2.5 transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                                                onClick={() => { setSelectedClientId(client.id); setIsClientDropdownOpen(false); }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: client.color}} />
                                                    <span className="font-bold text-xs">{client.name}</span>
                                                    {selectedClientId === client.id && <Check size={12} className="text-indigo-500 ml-2"/>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={`p-2 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                                        <button 
                                            type="button" 
                                            onClick={() => setIsAddingNewClient(true)}
                                            className="w-full py-2 rounded-lg text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:bg-indigo-500/10 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Plus size={12}/> Thêm công ty mới
                                        </button>
                                    </div>
                                </>
                            ) : (
                                // Add New Client Mode within Dropdown (Quick Add)
                                <div className="p-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase text-slate-400">Công ty mới</span>
                                        <button type="button" onClick={() => setIsAddingNewClient(false)} className="text-slate-400 hover:text-red-500"><X size={12}/></button>
                                    </div>
                                    <input 
                                        autoFocus
                                        value={newClientName}
                                        onChange={(e) => setNewClientName(e.target.value)}
                                        placeholder="Tên công ty..."
                                        className={`w-full px-3 py-2 rounded-lg text-xs font-bold border outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                                    />
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">Chọn màu</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {PASTEL_PALETTE.map((c) => (
                                                <button 
                                                    key={c.hex} 
                                                    type="button"
                                                    onClick={() => setNewClientColor(c.hex)}
                                                    className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${newClientColor === c.hex ? 'border-indigo-500 scale-110' : 'border-transparent'}`}
                                                    style={{backgroundColor: c.hex}}
                                                    title={c.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={handleAddNewClient}
                                        disabled={!newClientName.trim()}
                                        className="w-full py-1.5 rounded-lg bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        Lưu
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
              </div>
              
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mô tả</label><textarea name="description" className={`w-full px-4 py-3 rounded-xl outline-none border transition-all font-medium h-20 text-sm ${isDarkMode ? 'bg-slate-800 border-slate-800 focus:border-indigo-500' : 'bg-slate-50 border-slate-50 focus:border-indigo-500'}`} placeholder="Chi tiết..." /></div>

              {projectType === 'complex' ? (
                // Complex Mode UI
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className={`p-4 rounded-2xl border border-dashed ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-indigo-50/50 border-indigo-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1.5"><Layers size={12}/> Task nhanh</label>
                            <span className="text-[9px] font-bold text-slate-400">VD: "Banner - 1504 - 500k"</span>
                        </div>
                        
                        <div className="flex gap-2 mb-3">
                            <input 
                                value={smartInput}
                                onChange={(e) => setSmartInput(e.target.value)}
                                onKeyDown={handleSmartInputAdd}
                                placeholder="Task - Deadline - Tiền (Enter)"
                                className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold border outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
                            />
                            <button type="button" onClick={() => handleSmartInputAdd({ key: 'Enter', preventDefault: () => {} } as any)} className="px-3 py-2 bg-indigo-600 text-white rounded-lg font-bold"><Plus size={16}/></button>
                        </div>

                        <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                            {tempTasks.map((t, idx) => (
                                <div key={idx} className={`flex items-center justify-between p-2 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
                                    <div className="flex-1">
                                        <p className="font-bold text-xs truncate">{t.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded flex items-center gap-1 dark:bg-slate-800 dark:text-slate-400"><Calendar size={8}/> {formatDateDisplay(t.dueDate)}</span>
                                            {/* Formatted Task Budget */}
                                            <input 
                                                type="text" 
                                                placeholder="Budget..." 
                                                value={formatNumber(t.budget)} 
                                                onChange={(e) => {
                                                    const rawVal = parseNumber(e.target.value);
                                                    const newTasks = [...tempTasks];
                                                    newTasks[idx].budget = rawVal;
                                                    setTempTasks(newTasks);
                                                }}
                                                className={`w-20 text-[9px] font-bold bg-transparent border-b border-dashed outline-none ${isDarkMode ? 'border-slate-600 placeholder:text-slate-600' : 'border-slate-300 placeholder:text-slate-400'}`}
                                            />
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setTempTasks(tempTasks.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500"><X size={14}/></button>
                                </div>
                            ))}
                            {tempTasks.length === 0 && <p className="text-center text-[10px] text-slate-400 py-2 italic">Chưa có task nào.</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div className="opacity-70 pointer-events-none">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline</label>
                             <div className={`mt-1 font-black text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{formDeadline ? formatDateDisplay(formDeadline) : '--/--'}</div>
                         </div>
                         <div>
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng Budget</label>
                             <input 
                                value={formatNumber(complexBudget)} 
                                readOnly
                                type="text" 
                                className={`w-full mt-1 px-3 py-2 rounded-xl outline-none border transition-all font-black text-base ${isDarkMode ? 'bg-slate-800 border-slate-800' : 'bg-slate-50 border-slate-50'}`} 
                             />
                         </div>
                    </div>
                </div>
              ) : (
                // Single Mode UI
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-in fade-in slide-in-from-bottom-2">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline</label>
                        <input 
                            name="deadline" 
                            type="text" 
                            placeholder="VD: 134, 1304"
                            value={formDeadline} 
                            onChange={(e) => setFormDeadline(e.target.value)} 
                            onBlur={(e) => setFormDeadline(parseSmartDate(e.target.value))}
                            className={`w-full px-4 py-3 rounded-xl outline-none border transition-all font-bold text-sm ${isDarkMode ? 'bg-slate-800 border-slate-800 focus:border-indigo-500' : 'bg-indigo-50/50 border-indigo-100 focus:border-indigo-500 text-indigo-700'}`} 
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget (VNĐ)</label>
                        <input 
                            name="budget" 
                            type="text" 
                            required
                            value={formBudgetDisplay}
                            onChange={(e) => setFormBudgetDisplay(formatNumber(parseNumber(e.target.value)))}
                            className={`w-full px-4 py-3 rounded-xl outline-none border transition-all font-black text-sm ${isDarkMode ? 'bg-slate-800 border-slate-800 focus:border-indigo-500' : 'bg-slate-50 border-slate-50 focus:border-indigo-500'}`} 
                            placeholder="0" 
                        />
                    </div>
                </div>
              )}

              <div className="flex items-center gap-2 py-1"><input type="checkbox" name="isUrgent" id="isUrgent" className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500" /><label htmlFor="isUrgent" className="text-xs font-black text-orange-500 uppercase tracking-widest flex items-center gap-1"><Flame size={14} />Dự án này đang GẤP</label></div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAddingProject(false)} className={`flex-1 py-3.5 font-bold rounded-xl transition-colors text-sm ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Hủy</button>
                <button type="submit" className="flex-[2] py-3.5 font-black text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 text-sm"><CheckCircle2 size={18} />Tạo dự án</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;