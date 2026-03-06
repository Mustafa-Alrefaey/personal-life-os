export type TransactionType = 'Income' | 'Expense';

export interface Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  category?: string;
  date: string;
  notes?: string;
  statusCode: string;
}

export interface CreateTransactionRequest {
  amount: number;
  type: TransactionType;
  category?: string;
  date: string;
  notes?: string;
}

export interface UpdateTransactionRequest extends CreateTransactionRequest {
  id: number;
}
