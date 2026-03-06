import api from './api';
import type { ApiResponse } from '../types/api';
import type { Receipt, CreateReceiptRequest, UpdateReceiptRequest } from '../types/receipt';

export const receiptService = {
  async getAllReceipts(): Promise<ApiResponse<Receipt[]>> {
    const response = await api.get<ApiResponse<Receipt[]>>('/receipts');
    return response.data;
  },

  async createReceipt(data: CreateReceiptRequest, imageFile: File): Promise<ApiResponse<Receipt>> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('amount', data.amount.toString());
    formData.append('date', data.date);
    if (data.category) formData.append('category', data.category);
    formData.append('imageFile', imageFile);

    const response = await api.post<ApiResponse<Receipt>>('/receipts', formData);
    return response.data;
  },

  async deleteReceipt(id: number): Promise<ApiResponse<object>> {
    const response = await api.delete<ApiResponse<object>>(`/receipts/${id}`);
    return response.data;
  },

  async updateReceipt(id: number, data: UpdateReceiptRequest): Promise<ApiResponse<object>> {
    const response = await api.put<ApiResponse<object>>(`/receipts/${id}`, data);
    return response.data;
  },

  async updateReceiptImage(id: number, imageFile: File): Promise<ApiResponse<object>> {
    const formData = new FormData();
    formData.append('imageFile', imageFile);
    const response = await api.put<ApiResponse<object>>(`/receipts/${id}/image`, formData);
    return response.data;
  },
};
