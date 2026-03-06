import api from './api';
import type { DashboardData } from '../types/dashboard';
import type { ApiResponse } from '../types/api';

export const dashboardService = {
  // Get dashboard data
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    const response = await api.get<ApiResponse<DashboardData>>('/dashboard');
    return response.data;
  },
};
