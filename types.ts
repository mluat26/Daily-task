
export enum ProjectStatus {
  PLANNING = 'Planning',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  COMPLETED = 'Completed',
  ON_HOLD = 'On Hold'
}

export enum PaymentStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  OVERDUE = 'Overdue'
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  color?: string;
}

export interface Project {
  id: string;
  clientName: string;
  projectName: string;
  description: string;
  status: ProjectStatus;
  deadline: string;
  budget: number;
  tasks: Task[];
  paymentStatus: PaymentStatus;
  createdAt: string;
  isUrgent?: boolean;
}

export interface FinanceRecord {
  id: string;
  projectId: string;
  projectName: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
}
