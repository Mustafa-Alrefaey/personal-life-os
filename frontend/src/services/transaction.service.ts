import api from './api';
import type { Transaction, CreateTransactionRequest, UpdateTransactionRequest } from '../types/transaction';

interface ApiResponse<T> { data: T; message: string; success: boolean; }

export const transactionService = {
  getAllTransactions: () => api.get<ApiResponse<Transaction[]>>('/transactions').then((r) => r.data),
  createTransaction: (req: CreateTransactionRequest) => api.post<ApiResponse<Transaction>>('/transactions', req).then((r) => r.data),
  updateTransaction: (id: number, req: UpdateTransactionRequest) => api.put<ApiResponse<null>>(`/transactions/${id}`, req).then((r) => r.data),
  deleteTransaction: (id: number) => api.delete<ApiResponse<null>>(`/transactions/${id}`).then((r) => r.data),
};
