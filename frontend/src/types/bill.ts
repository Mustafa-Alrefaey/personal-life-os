export interface Bill {
  id: number;
  name: string;
  amount: number;
  dueDate: string;
  statusCode: string;
  reminderDaysBefore: number;
}

export interface CreateBillRequest {
  name: string;
  amount: number;
  dueDate: string;
  reminderDaysBefore: number;
}

export interface UpdateBillRequest extends CreateBillRequest {
  id: number;
  statusCode: string;
}
