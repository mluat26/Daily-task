
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
  Filter
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
  "Viết email nhắc thanh toán nhẹ nhàng, lịch sự cho khách hàng này.",
  "Viết email đòi nợ gắt hơn vì đã quá hạn 1 tuần.",
  "Tóm tắt tiến độ dự án này để báo cáo cho khách hàng.",
  "Phân tích rủi ro của dự án dựa trên các task chưa hoàn thành.",
  "Đề xuất lộ trình làm việc cho tuần tới để kịp deadline."
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
}> = ({ isDarkMode, active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-medium ${
      active
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
        : isDarkMode
        ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const DashboardCard: React.FC<{
  isDarkMode: boolean;
  label: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
}> = ({ isDarkMode, label, value, icon, trend }) => (
  <div
    className={`p-6 rounded-[2rem] border shadow-sm transition-colors ${
      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
    }`}
  >
    <div className="flex items-start justify-between mb-4">
      <div
        className={`p-3 rounded-2xl ${
          isDarkMode ? 'bg-slate-800' : 'bg-slate-50'
        }`}
      >
        {icon}
      </div>
      <span
        className={`text-xs font-bold px-2 py-1 rounded-lg ${
          isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
        }`}
      >
        {trend}
      </span>
    </div>
    <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
    <h3 className="text-2xl font-black tracking-tight">{value}</h3>
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
    className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
      active
        ? isDarkMode
          ? 'bg-slate-700 text-white shadow-sm'
          : 'bg-white text-slate-900 shadow-sm'
        : 'text-slate-400 hover:text-slate-500'
    }`}
  >
    {label}
  </button>
);

// New Component: TaskItem for Inline Editing
const TaskItem: React.FC<{
  task: Task;
  isDarkMode: boolean;
  onUpdate: (updates: Partial<Task>) => void;
}> = ({ task, isDarkMode, onUpdate }) => {
  const [dateStr, setDateStr] = useState(formatDateDisplay(task.dueDate));
  const [budgetStr, setBudgetStr] = useState(formatNumber(task.budget));
  const [titleStr, setTitleStr] = useState(task.title);

  // Sync props to state
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
    <div className="flex items-start gap-3 group/task">
         <button
            onClick={() => onUpdate({ completed: !task.completed })}
            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : (isDarkMode ? 'border-slate-700 hover:border-emerald-500' : 'border-slate-300 hover:border-emerald-500')}`}
         >
            {task.completed && <Check size={12} strokeWidth={4} />}
         </button>
         <div className="flex-1 min-w-0">
            <input
                value={titleStr}
                onChange={(e) => setTitleStr(e.target.value)}
                onBlur={handleTitleBlur}
                className={`text-sm font-medium block w-full bg-transparent outline-none truncate ${task.completed ? 'text-slate-400 line-through' : (isDarkMode ? 'text-slate-200' : 'text-slate-700')}`}
            />
            
            <div className="flex items-center gap-4 mt-1">
                {/* Date Edit */}
                <div className="flex items-center gap-1 group/date relative">
                    <Clock size={10} className={isDarkMode ? "text-slate-500" : "text-slate-400"}/>
                    <input
                        value={dateStr}
                        onChange={(e) => setDateStr(e.target.value)}
                        onBlur={handleDateBlur}
                        placeholder="dd/mm"
                        className={`text-[10px] font-bold bg-transparent border-b border-transparent hover:border-dashed outline-none w-14 transition-all ${isDarkMode ? 'text-slate-400 border-slate-600 focus:border-indigo-500' : 'text-slate-400 border-slate-300 focus:border-indigo-500'}`}
                    />
                </div>

                {/* Budget Edit */}
                <div className="flex items-center gap-1 group/budget relative">
                    <Banknote size={10} className={isDarkMode ? "text-slate-500" : "text-slate-400"}/>
                    <input
                        value={budgetStr}
                        onChange={(e) => {
                             const val = e.target.value.replace(/[^0-9]/g, '');
                             setBudgetStr(formatNumber(val));
                        }}
                        onBlur={handleBudgetBlur}
                        placeholder="Budget..."
                        className={`text-[10px] font-bold bg-transparent border-b border-transparent hover:border-dashed outline-none w-20 transition-all ${isDarkMode ? 'text-slate-400 border-slate-600 focus:border-indigo-500' : 'text-slate-400 border-slate-300 focus:border-indigo-500'}`}
                    />
                </div>
            </div>
         </div>
    </div>
  );
}

const ProjectCard: React.FC<{
  isDarkMode: boolean;
  project: Project;
  onDelete: () => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onUpdateProject: (updates: Partial<Project>) => void;
  onAddTask: (title: string) => void;
  onPrintInvoice: (project: Project) => void;
}> = ({ isDarkMode, project, onDelete, onUpdateTask, onUpdateProject, onAddTask, onPrintInvoice }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [localBudget, setLocalBudget] = useState(formatNumber(project.budget));

  useEffect(() => {
    setLocalBudget(formatNumber(project.budget));
  }, [project.budget]);

  const completedTasks = project.tasks.filter(t => t.completed).length;
  const totalTasks = project.tasks.length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

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

  const getPaymentColorClass = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID: return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case PaymentStatus.PENDING: return 'bg-orange-100 text-orange-600 border-orange-200';
      case PaymentStatus.OVERDUE: return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className={`group relative p-6 rounded-[2.5rem] border shadow-sm transition-all hover:shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:shadow-slate-800/50' : 'bg-white border-slate-100 hover:shadow-slate-200'}`}>
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
         {/* Invoice Button */}
         <button 
           onClick={() => onPrintInvoice(project)} 
           className="p-2 bg-indigo-50 text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white transition-colors"
           title="Xuất hóa đơn PDF"
         >
           <FileText size={16}/>
         </button>
         <button onClick={() => onDelete()} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/></button>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
           {/* Project Status Dropdown */}
           <div className="relative">
             <select 
                value={project.status}
                onChange={(e) => onUpdateProject({ status: e.target.value as ProjectStatus })}
                className={`appearance-none pl-3 pr-7 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border cursor-pointer outline-none transition-colors ${getStatusColorClass(project.status)}`}
             >
                {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
             </select>
             <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
           </div>

           {/* Client Badge */}
           <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-500" style={{backgroundColor: project.clientColor ? `${project.clientColor}20` : undefined, color: project.clientColor}}>
             {project.clientName}
           </span>

           {/* Urgent Toggle (Small Icon) */}
           <button 
             onClick={() => onUpdateProject({ isUrgent: !project.isUrgent })}
             className={`p-1 rounded-md transition-colors ${project.isUrgent ? 'text-orange-500 bg-orange-100' : 'text-slate-300 hover:text-orange-300'}`}
             title="Toggle Urgent"
           >
             <Flame size={14} fill={project.isUrgent ? "currentColor" : "none"} />
           </button>
        </div>
        
        <h3 className="text-xl font-black mb-1 line-clamp-1" title={project.projectName}>{project.projectName}</h3>
        <p className="text-sm text-slate-400 font-medium line-clamp-2 h-10">{project.description || 'Không có mô tả'}</p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
           <span className="flex items-center gap-1"><Calendar size={14}/> {formatDateDisplay(project.deadline)}</span>
           <div className="flex items-center gap-2">
               {/* Editable Budget Input */}
               <div className="flex items-center gap-1 relative group/input cursor-text">
                   <Banknote size={14} className={isDarkMode ? "text-slate-500" : "text-slate-400"}/>
                   <input
                     type="text"
                     value={localBudget}
                     onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setLocalBudget(formatNumber(val));
                     }}
                     onBlur={() => {
                        const num = parseNumber(localBudget);
                        if (num !== project.budget) {
                           onUpdateProject({ budget: num });
                        }
                     }}
                     className={`w-[85px] bg-transparent border-b border-dashed outline-none font-bold transition-colors ${isDarkMode ? 'border-slate-700 focus:border-indigo-500 text-slate-200' : 'border-slate-300 focus:border-indigo-500 text-slate-700'}`}
                   />
                   <span className="text-[9px] uppercase">VNĐ</span>
               </div>
               
               {/* Payment Status Dropdown */}
               <div className="relative">
                 <select 
                    value={project.paymentStatus}
                    onChange={(e) => onUpdateProject({ paymentStatus: e.target.value as PaymentStatus })}
                    className={`appearance-none pl-2 pr-6 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border cursor-pointer outline-none transition-colors ${getPaymentColorClass(project.paymentStatus)}`}
                 >
                    {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
                 <ChevronDown size={8} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
               </div>
           </div>
        </div>
        
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-black">
             <span>Tiến độ</span>
             <span>{progress}%</span>
          </div>
          <div className={`h-2.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
             <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className={`pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-50'}`}>
         <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center justify-between w-full text-sm font-bold hover:text-indigo-500 transition-colors">
            <span>Danh sách việc ({completedTasks}/{totalTasks})</span>
            {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
         </button>
         
         {isExpanded && (
            <div className="mt-4 space-y-3 animate-in slide-in-from-top-2">
               {project.tasks.map(task => (
                  <TaskItem 
                    key={task.id}
                    task={task}
                    isDarkMode={isDarkMode}
                    onUpdate={(updates) => onUpdateTask(task.id, updates)}
                  />
               ))}
               
               <form onSubmit={handleAddTask} className="flex gap-2 mt-2">
                  <input 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Thêm việc..."
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-indigo-500' : 'bg-slate-50 border-slate-100 focus:border-indigo-500'}`}
                  />
                  <button type="submit" disabled={!newTaskTitle.trim()} className="p-2 bg-indigo-600 text-white rounded-xl disabled:opacity-50"><Plus size={16}/></button>
               </form>
            </div>
         )}
      </div>
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'finance' | 'clients' | 'ai'>('dashboard');
  const [projectFilter, setProjectFilter] = useState<'all' | 'urgent' | 'active' | 'completed'>('all');
  const [financeFilter, setFinanceFilter] = useState<'all' | 'paid' | 'pending'>('all');
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

  // Handlers
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
      color: TASK_COLORS[Math.floor(Math.random() * TASK_COLORS.length)].value,
      budget: 0 // Initialize with 0 budget
    };
    setProjects(projects.map(p => p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p));
  };

  const handleSmartInputAdd = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && smartInput.trim()) {
          e.preventDefault();
          let title = smartInput;
          let dateStr = "";
          const lastHyphen = smartInput.lastIndexOf('-');
          if (lastHyphen !== -1) {
             title = smartInput.substring(0, lastHyphen).trim();
             dateStr = smartInput.substring(lastHyphen + 1).trim();
          }
          const parsedDate = parseSmartDate(dateStr) || new Date().toISOString().split('T')[0];
          const newTask: Task = {
              id: Math.random().toString(36).substr(2, 9),
              title: title,
              dueDate: parsedDate,
              completed: false,
              color: TASK_COLORS[tempTasks.length % TASK_COLORS.length].value,
              budget: 0
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

          // CRITICAL FIX: Send as 'text/plain' to avoid CORS preflight (OPTIONS request) 
          // which Google Apps Script Web App does not support automatically.
          // The data is still valid JSON string.
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

  const filteredProjects = projects.filter(p => {
    if (projectFilter === 'all') return true;
    if (projectFilter === 'urgent') return p.isUrgent;
    if (projectFilter === 'active') return p.status !== ProjectStatus.COMPLETED;
    if (projectFilter === 'completed') return p.status === ProjectStatus.COMPLETED;
    return true;
  });

  const filteredFinanceProjects = projects.filter(p => {
    if (financeFilter === 'all') return true;
    if (financeFilter === 'paid') return p.paymentStatus === PaymentStatus.PAID;
    if (financeFilter === 'pending') return p.paymentStatus !== PaymentStatus.PAID;
    return true;
  });

  const selectedClientDisplay = clients.find(c => c.id === selectedClientId);

  // CHANGED: Fixed Layout (h-screen + overflow)
  return (
    <div className={`flex flex-col md:flex-row h-screen overflow-hidden transition-all duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      {/* Sidebar - Fixed Height */}
      <aside className={`w-full md:w-72 border-r p-6 flex flex-col gap-8 transition-colors h-full overflow-y-auto flex-shrink-0 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
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
          <NavItem isDarkMode={isDarkMode} active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} icon={<Building2 size={20}/>} label="Công ty" />
          <NavItem isDarkMode={isDarkMode} active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<DollarSign size={20}/>} label="Doanh thu" />
          {/* New AI Tab */}
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
             <NavItem isDarkMode={isDarkMode} active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<Bot size={20}/>} label="Trợ lý AI" />
          </div>
        </nav>
      </aside>

      {/* Main Content - Scrollable Independent of Sidebar */}
      <main className="flex-1 p-6 md:p-10 h-full overflow-y-auto w-full">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-black tracking-tight">
                {activeTab === 'dashboard' ? 'Chào ngày mới!' : 
                 activeTab === 'projects' ? 'Dự án của bạn' : 
                 activeTab === 'clients' ? 'Quản lý Công ty' :
                 activeTab === 'ai' ? 'Trợ lý Ảo (Giả lập)' :
                 'Quản lý tài chính'}
            </h2>
            <p className="text-slate-500 font-medium">Bạn có {stats.activeCount} dự án đang tiến hành.</p>
          </div>
          <button onClick={() => setIsAddingProject(true)} className="group flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 active:scale-95">
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            Dự án mới
          </button>
        </header>

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
                      <div><h4 className="font-bold text-sm">{p.projectName}</h4><p className="text-[10px] text-orange-500 font-black uppercase">DL: {formatDateDisplay(p.deadline)}</p></div>
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
            <div className={`grid grid-cols-4 gap-1 p-1.5 rounded-2xl w-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
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
                  onPrintInvoice={handlePrintInvoice}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                {/* Add New Client Section */}
                <div className={`p-8 rounded-[2.5rem] border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Plus size={24} className="text-indigo-500"/>Thêm công ty mới</h3>
                    
                    {/* Updated Layout: Vertical Stacking */}
                    <div className="flex flex-col gap-6">
                        {/* Row 1: Name Input (Full width) */}
                        <div className="w-full space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên công ty</label>
                            <input 
                                value={tabClientName}
                                onChange={(e) => setTabClientName(e.target.value)}
                                placeholder="Nhập tên..."
                                className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-800 focus:border-indigo-500' : 'bg-slate-50 border-slate-50 focus:border-indigo-500'}`}
                            />
                        </div>

                        {/* Row 2: Color and Button */}
                        <div className="flex flex-col md:flex-row gap-6 md:items-end">
                            <div className="space-y-2 flex-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Màu đại diện</label>
                                <div className="flex gap-2 flex-wrap">
                                    {PASTEL_PALETTE.map((c) => (
                                        <button 
                                            key={c.hex} 
                                            type="button"
                                            onClick={() => setTabClientColor(c.hex)}
                                            className={`w-10 h-10 rounded-full border-4 transition-transform hover:scale-110 ${tabClientColor === c.hex ? 'border-indigo-500 scale-110' : 'border-transparent'}`}
                                            style={{backgroundColor: c.hex}}
                                            title={c.name}
                                        />
                                    ))}
                                </div>
                            </div>
                            <button 
                                onClick={handleAddClientFromTab}
                                disabled={!tabClientName.trim()}
                                className="h-[60px] px-8 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-500/20"
                            >
                                Thêm ngay
                            </button>
                        </div>
                    </div>
                </div>

                {/* Clients List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clients.map(client => {
                        // Calculate stats for each client
                        const clientProjects = projects.filter(p => p.clientName === client.name);
                        const totalRevenue = clientProjects.reduce((sum, p) => sum + p.budget, 0);
                        const projectCount = clientProjects.length;

                        return (
                            <div key={client.id} className={`group relative p-6 rounded-[2rem] border shadow-sm transition-all hover:shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:shadow-slate-800/50' : 'bg-white border-slate-100 hover:shadow-slate-200'}`}>
                                <div className="absolute top-6 right-6">
                                    <button 
                                        onClick={() => handleDeleteClient(client.id)}
                                        className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl shadow-inner" style={{backgroundColor: client.color}} />
                                    <div>
                                        <h4 className="text-lg font-black">{client.name}</h4>
                                        <p className="text-xs text-slate-400 font-medium">Khách hàng thân thiết</p>
                                    </div>
                                </div>
                                
                                <div className={`grid grid-cols-2 gap-4 p-4 rounded-2xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dự án</p>
                                        <p className="text-xl font-black">{projectCount}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Doanh thu</p>
                                        <p className="text-xl font-black text-emerald-500 tracking-tighter">{formatVND(totalRevenue)}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    {clients.length === 0 && (
                        <div className="col-span-full text-center py-10 text-slate-400 italic">
                            Chưa có công ty nào. Hãy thêm mới!
                        </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-6">
             {/* Sheet Configuration Panel */}
             <div className={`p-6 rounded-[2rem] border shadow-sm transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                 <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                         <div className="p-3 bg-green-100 text-green-600 rounded-xl"><FileSpreadsheet size={24}/></div>
                         <div>
                             <h4 className="font-black text-lg">Google Sheets Sync</h4>
                             <p className="text-xs text-slate-400 font-medium">Đồng bộ dữ liệu thanh toán lên Sheet của bạn</p>
                         </div>
                     </div>
                     <div className="flex gap-2">
                        {sheetWebhookUrl ? (
                            <button 
                                onClick={handleSyncToSheet} 
                                disabled={isSyncing}
                                className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSyncing ? <RefreshCw className="animate-spin" size={18}/> : <RefreshCw size={18}/>}
                                {isSyncing ? 'Đang Sync...' : 'Sync Ngay'}
                            </button>
                        ) : (
                            <button 
                                onClick={() => setShowSheetConfig(!showSheetConfig)} 
                                className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
                            >
                                <LinkIcon size={18}/> Liên kết Sheet
                            </button>
                        )}
                        {sheetWebhookUrl && (
                             <button onClick={() => setShowSheetConfig(!showSheetConfig)} className="p-3 text-slate-400 hover:text-slate-600"><Edit2 size={18}/></button>
                        )}
                     </div>
                 </div>

                 {showSheetConfig && (
                     <div className="mt-6 pt-6 border-t border-dashed border-slate-200 animate-in slide-in-from-top-2">
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Google Script URL</label>
                                    <input 
                                        value={sheetWebhookUrl}
                                        onChange={(e) => setSheetWebhookUrl(e.target.value)}
                                        placeholder="https://script.google.com/macros/s/..."
                                        className={`w-full px-4 py-3 rounded-xl border-2 outline-none font-medium text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                                    />
                                </div>
                                <div className="p-4 bg-yellow-50 rounded-xl text-yellow-800 text-xs leading-relaxed border border-yellow-100">
                                    <strong>Hướng dẫn setup:</strong><br/>
                                    1. Vào Google Sheet {'->'} Extensions {'->'} Apps Script.<br/>
                                    2. Xóa hết code cũ, paste code bên phải vào.<br/>
                                    3. Bấm Deploy {'->'} New deployment {'->'} Select type: Web App.<br/>
                                    4. Access as: <strong>Anyone</strong> (Quan trọng).<br/>
                                    5. Copy Web App URL dán vào ô bên trên.
                                </div>
                             </div>
                             
                             <div className="space-y-2">
                                 <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Code Apps Script (Copy & Paste)</label>
                                    <button onClick={handleCopyScript} className="text-xs font-bold text-indigo-500 hover:underline flex items-center gap-1"><Copy size={12}/> Copy Code</button>
                                 </div>
                                 <div className={`relative rounded-xl overflow-hidden border ${isDarkMode ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                                     <pre className="p-4 text-[10px] font-mono overflow-x-auto h-48 text-slate-500">
                                         {GOOGLE_SCRIPT_CODE}
                                     </pre>
                                 </div>
                             </div>
                         </div>
                     </div>
                 )}
             </div>

            <div className={`rounded-[2.5rem] border shadow-sm overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className={`p-10 border-b flex justify-between items-center ${isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50/50 border-slate-50'}`}>
                    <div>
                        <h3 className="text-2xl font-black">Danh sách thu nhập</h3>
                        <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Quản lý dòng tiền</p>
                    </div>
                    {/* Finance Status Filter */}
                    <div className={`flex p-1 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <button onClick={() => setFinanceFilter('all')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${financeFilter === 'all' ? (isDarkMode ? 'bg-slate-700 text-white' : 'bg-white shadow-sm text-indigo-600') : 'text-slate-400'}`}>Tất cả</button>
                        <button onClick={() => setFinanceFilter('paid')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${financeFilter === 'paid' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-emerald-500'}`}>Đã nhận</button>
                        <button onClick={() => setFinanceFilter('pending')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${financeFilter === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-400 hover:text-amber-500'}`}>Chờ nhận</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                    <tr className={`text-[11px] font-black text-slate-400 uppercase tracking-widest ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
                        <th className="px-10 py-6">Công ty</th>
                        <th className="px-10 py-6">Dự án</th>
                        <th className="px-10 py-6">Budget</th>
                        <th className="px-10 py-6 text-center">Trạng thái</th>
                        <th className="px-10 py-6 text-right">Ngày nhận</th>
                    </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-50'}`}>
                    {filteredFinanceProjects.map(p => (
                        <tr key={p.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/50'}`}>
                        <td className="px-10 py-6 font-bold text-sm">
                            <span className="px-2 py-1 rounded-md text-slate-700" style={{backgroundColor: p.clientColor || '#e2e8f0'}}>{p.clientName}</span>
                        </td>
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
                {filteredFinanceProjects.length === 0 && (
                    <div className="py-12 text-center text-slate-400 text-sm font-medium italic">Không có dữ liệu phù hợp.</div>
                )}
                </div>
            </div>
          </div>
        )}

        {/* New AI Tab Content */}
        {activeTab === 'ai' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                <div className={`p-8 rounded-[2.5rem] border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
                        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
                            <Bot size={32}/>
                        </div>
                        <h3 className="text-3xl font-black">Trợ lý AI Freelance (Giả lập)</h3>
                        <p className="text-slate-500 font-medium">
                            Tính năng này sẽ tổng hợp dữ liệu dự án của bạn thành một prompt (câu lệnh). <br/>
                            Bạn chỉ cần copy và dán vào Gemini/ChatGPT để nhận tư vấn.
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto space-y-6">
                        {/* Suggestions Chips */}
                        <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Gợi ý nhanh</p>
                             <div className="flex flex-wrap gap-2 justify-center">
                                 {AI_SUGGESTIONS.map((suggestion, i) => (
                                     <button 
                                        key={i}
                                        onClick={() => setAiPrompt(suggestion)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${isDarkMode ? 'border-slate-700 hover:bg-slate-800 hover:border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-500 text-slate-600'}`}
                                     >
                                        {suggestion}
                                     </button>
                                 ))}
                             </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bạn muốn hỏi gì?</label>
                            <div className={`relative rounded-2xl border-2 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 focus-within:border-indigo-500' : 'bg-slate-50 border-slate-100 focus-within:border-indigo-500'}`}>
                                <textarea 
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="VD: Hãy phân tích tiến độ các dự án và gợi ý cách tối ưu doanh thu tháng này..."
                                    className="w-full p-4 bg-transparent outline-none min-h-[120px] font-medium resize-none"
                                />
                                <div className="absolute bottom-3 right-3">
                                    <MessageSquare size={16} className="text-slate-400"/>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleGenerateAiPrompt}
                            disabled={!aiPrompt.trim()}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Copy size={20}/>
                            <span>Copy Prompt & Mở Gemini</span>
                            <ExternalLink size={16} className="opacity-70"/>
                        </button>

                        <div className={`p-4 rounded-xl text-xs text-center border border-dashed ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                            Hệ thống sẽ tự động đính kèm thông tin: {projects.length} dự án, tổng thu {formatNumber(stats.totalEarned)}đ.
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>

      {/* Creation Modal */}
      {isAddingProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className={`rounded-[3rem] w-full max-w-2xl p-12 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-slate-900 text-slate-100 border border-slate-800' : 'bg-white text-slate-900'}`}>
            <h2 className="text-3xl font-black mb-6 tracking-tight">Thêm dự án mới</h2>
            
            {/* Segmentation Button */}
            <div className={`flex p-1.5 rounded-2xl w-full mb-8 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <button 
                    type="button" 
                    onClick={() => setProjectType('single')} 
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${projectType === 'single' ? (isDarkMode ? 'bg-slate-700 text-white' : 'bg-white text-slate-900 shadow-sm') : 'text-slate-400'}`}
                >
                    <FileType size={16}/> Dự án lẻ
                </button>
                <button 
                    type="button" 
                    onClick={() => setProjectType('complex')} 
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${projectType === 'complex' ? (isDarkMode ? 'bg-slate-700 text-white' : 'bg-white text-slate-900 shadow-sm') : 'text-slate-400'}`}
                >
                    <Layers size={16}/> Dự án lớn
                </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên dự án</label><input required name="projectName" type="text" className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-800 focus:border-indigo-500' : 'bg-slate-50 border-slate-50 focus:border-indigo-500'}`} placeholder="VD: Landing Page..." /></div>
                
                {/* Custom Client Selector with Color */}
                <div className="space-y-2 relative" ref={clientDropdownRef}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách hàng / Công ty</label>
                    
                    <div 
                        onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                        className={`w-full px-6 py-4 rounded-2xl border-2 transition-all font-bold flex items-center justify-between cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-800 hover:border-indigo-500' : 'bg-slate-50 border-slate-50 hover:border-indigo-500'}`}
                    >
                        {selectedClientDisplay ? (
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full" style={{backgroundColor: selectedClientDisplay.color}} />
                                <span>{selectedClientDisplay.name}</span>
                            </div>
                        ) : (
                            <span className="text-slate-400 font-normal">Chọn khách hàng...</span>
                        )}
                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Dropdown Menu - Simplified (No Delete) */}
                    {isClientDropdownOpen && (
                        <div className={`absolute top-[110%] left-0 right-0 rounded-2xl shadow-xl border z-20 overflow-hidden animate-in slide-in-from-top-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            {!isAddingNewClient ? (
                                <>
                                    <div className="max-h-48 overflow-y-auto">
                                        {clients.map(client => (
                                            <div 
                                                key={client.id}
                                                className={`flex items-center justify-between px-6 py-3 transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                                                onClick={() => { setSelectedClientId(client.id); setIsClientDropdownOpen(false); }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: client.color}} />
                                                    <span className="font-bold text-sm">{client.name}</span>
                                                    {selectedClientId === client.id && <Check size={14} className="text-indigo-500 ml-2"/>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={`p-2 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                                        <button 
                                            type="button" 
                                            onClick={() => setIsAddingNewClient(true)}
                                            className="w-full py-2.5 rounded-xl text-xs font-black text-indigo-500 uppercase tracking-widest hover:bg-indigo-500/10 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus size={14}/> Thêm công ty mới
                                        </button>
                                    </div>
                                </>
                            ) : (
                                // Add New Client Mode within Dropdown (Quick Add)
                                <div className="p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase text-slate-400">Công ty mới</span>
                                        <button type="button" onClick={() => setIsAddingNewClient(false)} className="text-slate-400 hover:text-red-500"><X size={14}/></button>
                                    </div>
                                    <input 
                                        autoFocus
                                        value={newClientName}
                                        onChange={(e) => setNewClientName(e.target.value)}
                                        placeholder="Tên công ty..."
                                        className={`w-full px-3 py-2 rounded-xl text-sm font-bold border-2 outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                                    />
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">Chọn màu Pastel</span>
                                        <div className="flex flex-wrap gap-2">
                                            {PASTEL_PALETTE.map((c) => (
                                                <button 
                                                    key={c.hex} 
                                                    type="button"
                                                    onClick={() => setNewClientColor(c.hex)}
                                                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${newClientColor === c.hex ? 'border-indigo-500 scale-110' : 'border-transparent'}`}
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
                                        className="w-full py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        Lưu & Chọn
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
              </div>
              
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mô tả dự án</label><textarea name="description" className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-medium h-24 ${isDarkMode ? 'bg-slate-800 border-slate-800 focus:border-indigo-500' : 'bg-slate-50 border-slate-50 focus:border-indigo-500'}`} placeholder="Chi tiết..." /></div>

              {projectType === 'complex' ? (
                // Complex Mode UI
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className={`p-6 rounded-3xl border border-dashed ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-indigo-50/50 border-indigo-200'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1.5"><Layers size={14}/> Các hạng mục (Tasks)</label>
                            <span className="text-[10px] font-bold text-slate-400">Gõ: "Tên - 1204" để thêm nhanh</span>
                        </div>
                        
                        <div className="flex gap-2 mb-4">
                            <input 
                                value={smartInput}
                                onChange={(e) => setSmartInput(e.target.value)}
                                onKeyDown={handleSmartInputAdd}
                                placeholder="VD: Banner Facebook - 1504 (Enter để thêm)"
                                className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold border-2 outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
                            />
                            <button type="button" onClick={() => handleSmartInputAdd({ key: 'Enter', preventDefault: () => {} } as any)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold"><Plus size={20}/></button>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {tempTasks.map((t, idx) => (
                                <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm">{t.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded flex items-center gap-1 dark:bg-slate-800 dark:text-slate-400"><Calendar size={10}/> {formatDateDisplay(t.dueDate)}</span>
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
                                                className={`w-24 text-[10px] font-bold bg-transparent border-b border-dashed outline-none ${isDarkMode ? 'border-slate-600 placeholder:text-slate-600' : 'border-slate-300 placeholder:text-slate-400'}`}
                                            />
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setTempTasks(tempTasks.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500"><X size={16}/></button>
                                </div>
                            ))}
                            {tempTasks.length === 0 && <p className="text-center text-xs text-slate-400 py-4 italic">Chưa có task nào.</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                         <div className="opacity-70 pointer-events-none">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline (Auto)</label>
                             <div className={`mt-2 font-black text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{formDeadline ? formatDateDisplay(formDeadline) : '--/--'}</div>
                         </div>
                         <div>
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng Budget (VNĐ)</label>
                             <input 
                                value={formatNumber(complexBudget)} 
                                readOnly
                                type="text" 
                                className={`w-full mt-1 px-4 py-3 rounded-2xl outline-none border-2 transition-all font-black text-lg ${isDarkMode ? 'bg-slate-800 border-slate-800' : 'bg-slate-50 border-slate-50'}`} 
                             />
                             <p className="text-[10px] text-slate-500 mt-1">*Tự động cộng từ task con</p>
                         </div>
                    </div>
                </div>
              ) : (
                // Single Mode UI
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline (Gõ tắt: 134 = 13/4)</label>
                        <input 
                            name="deadline" 
                            type="text" 
                            placeholder="VD: 134, 1304, 13/4"
                            value={formDeadline} 
                            onChange={(e) => setFormDeadline(e.target.value)} 
                            onBlur={(e) => setFormDeadline(parseSmartDate(e.target.value))}
                            className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${isDarkMode ? 'bg-slate-800 border-slate-800 focus:border-indigo-500' : 'bg-indigo-50/50 border-indigo-100 focus:border-indigo-500 text-indigo-700'}`} 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget (VNĐ)</label>
                        <input 
                            name="budget" 
                            type="text" 
                            required
                            value={formBudgetDisplay}
                            onChange={(e) => setFormBudgetDisplay(formatNumber(parseNumber(e.target.value)))}
                            className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-black ${isDarkMode ? 'bg-slate-800 border-slate-800 focus:border-indigo-500' : 'bg-slate-50 border-slate-50 focus:border-indigo-500'}`} 
                            placeholder="0" 
                        />
                    </div>
                </div>
              )}

              <div className="flex items-center gap-3 py-2"><input type="checkbox" name="isUrgent" id="isUrgent" className="w-6 h-6 rounded-lg text-orange-500 focus:ring-orange-500" /><label htmlFor="isUrgent" className="text-sm font-black text-orange-500 uppercase tracking-widest flex items-center gap-1.5"><Flame size={16} />Dự án này đang GẤP</label></div>

              <div className="flex gap-4 pt-8">
                <button type="button" onClick={() => setIsAddingProject(false)} className={`flex-1 py-5 font-bold rounded-2xl transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Hủy</button>
                <button type="submit" className="flex-[2] py-5 font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3"><CheckCircle2 size={24} />Tạo dự án</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
