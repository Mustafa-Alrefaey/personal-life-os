import api from './api';
import type { ApiResponse } from '../types/api';
import type { Receipt, CreateReceiptRequest, UpdateReceiptRequest } from '../types/receipt';

export const receiptService = {
  async getAllReceipts(): Promise<ApiResponse<Receipt[]>> {
    const response = await api.get<ApiResponse<Receipt[]>>('/receipts');
    return response.data;
  },

  async createReceipt(
    data: CreateReceiptRequest,
    imageFile: File,
    onUploadProgress?: (percent: number) => void,
  ): Promise<ApiResponse<Receipt>> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('amount', data.amount.toString());
    formData.append('date', data.date);
    if (data.category) formData.append('category', data.category);
    formData.append('imageFile', imageFile);

    const response = await api.post<ApiResponse<Receipt>>('/receipts', formData, {
      onUploadProgress: (e) => {
        if (onUploadProgress && e.total) {
          onUploadProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
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

  async updateReceiptImage(
    id: number,
    imageFile: File,
    onUploadProgress?: (percent: number) => void,
  ): Promise<ApiResponse<object>> {
    const formData = new FormData();
    formData.append('imageFile', imageFile);
    const response = await api.put<ApiResponse<object>>(`/receipts/${id}/image`, formData, {
      onUploadProgress: (e) => {
        if (onUploadProgress && e.total) {
          onUploadProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return response.data;
  },
};
