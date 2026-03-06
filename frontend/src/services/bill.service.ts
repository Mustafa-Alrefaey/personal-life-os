import api from './api';
import type { ApiResponse } from '../types/api';
import type { Bill, CreateBillRequest, UpdateBillRequest } from '../types/bill';

export const billService = {
  async getAllBills(): Promise<ApiResponse<Bill[]>> {
    const response = await api.get<ApiResponse<Bill[]>>('/bills');
    return response.data;
  },

  async createBill(data: CreateBillRequest): Promise<ApiResponse<Bill>> {
    const response = await api.post<ApiResponse<Bill>>('/bills', data);
    return response.data;
  },

  async updateBill(id: number, data: UpdateBillRequest): Promise<ApiResponse<object>> {
    const response = await api.put<ApiResponse<object>>(`/bills/${id}`, data);
    return response.data;
  },

  async markAsPaid(id: number): Promise<ApiResponse<object>> {
    const response = await api.post<ApiResponse<object>>(`/bills/${id}/pay`);
    return response.data;
  },

  async deleteBill(id: number): Promise<ApiResponse<object>> {
    const response = await api.delete<ApiResponse<object>>(`/bills/${id}`);
    return response.data;
  },
};
