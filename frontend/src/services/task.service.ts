import api from './api';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task';
import type { ApiResponse } from '../types/api';

export const taskService = {
  // Get all tasks
  async getAllTasks(): Promise<ApiResponse<Task[]>> {
    const response = await api.get<ApiResponse<Task[]>>('/tasks');
    return response.data;
  },

  // Get task by ID
  async getTaskById(id: number): Promise<ApiResponse<Task>> {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data;
  },

  // Create new task
  async createTask(data: CreateTaskRequest): Promise<ApiResponse<Task>> {
    const payload = { ...data, dueDate: data.dueDate || null };
    const response = await api.post<ApiResponse<Task>>('/tasks', payload);
    return response.data;
  },

  // Update task
  async updateTask(data: UpdateTaskRequest): Promise<ApiResponse<object>> {
    const payload = { ...data, dueDate: data.dueDate || null };
    const response = await api.put<ApiResponse<object>>(`/tasks/${data.id}`, payload);
    return response.data;
  },

  // Delete task
  async deleteTask(id: number): Promise<ApiResponse<object>> {
    const response = await api.delete<ApiResponse<object>>(`/tasks/${id}`);
    return response.data;
  },

  // Mark task as complete
  async completeTask(id: number): Promise<ApiResponse<object>> {
    const response = await api.post<ApiResponse<object>>(`/tasks/${id}/complete`);
    return response.data;
  },

  // Mark task as incomplete (back to pending)
  async uncompleteTask(id: number): Promise<ApiResponse<object>> {
    const response = await api.post<ApiResponse<object>>(`/tasks/${id}/uncomplete`);
    return response.data;
  },
};
