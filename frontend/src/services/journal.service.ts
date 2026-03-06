import api from './api';
import type { ApiResponse } from '../types/api';
import type { JournalEntry, CreateJournalRequest, UpdateJournalRequest } from '../types/journal';

export const journalService = {
  async getAllJournals(): Promise<ApiResponse<JournalEntry[]>> {
    const response = await api.get<ApiResponse<JournalEntry[]>>('/journal');
    return response.data;
  },

  async createJournal(data: CreateJournalRequest): Promise<ApiResponse<JournalEntry>> {
    const response = await api.post<ApiResponse<JournalEntry>>('/journal', data);
    return response.data;
  },

  async updateJournal(id: number, data: UpdateJournalRequest): Promise<ApiResponse<object>> {
    const response = await api.put<ApiResponse<object>>(`/journal/${id}`, data);
    return response.data;
  },

  async deleteJournal(id: number): Promise<ApiResponse<object>> {
    const response = await api.delete<ApiResponse<object>>(`/journal/${id}`);
    return response.data;
  },
};
