// Dashboard types matching the API DTOs

import type { Task } from './task';

export interface Bill {
  id: number;
  name: string;
  amount: number;
  dueDate: string;
  statusCode: string;
  reminderDaysBefore: number;
}

export interface DashboardData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalJournalEntries: number;
  totalReceipts: number;
  totalBills: number;
  unpaidBills: number;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  recentTasks?: Task[];
  upcomingBills?: Bill[];
}
