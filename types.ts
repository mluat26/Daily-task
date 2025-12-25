
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
  budget?: number; // Added budget specific to task
}

export interface Client {
  id: string;
  name: string;
  color: string; // Hex code or tailwind class
}

export interface Project {
  id: string;
  clientName: string;
  clientColor?: string; // Store the color associated with the client
  projectName: string;
  description: string;
  status: ProjectStatus;
  deadline: string;
  budget: number;
  tasks: Task[];
  paymentStatus: PaymentStatus;
  createdAt: string;
  isUrgent?: boolean;
  type?: 'single' | 'complex'; // To distinguish UI rendering if needed
}

export interface FinanceRecord {
  id: string;
  projectId: string;
  projectName: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
}
