// Task types matching the API DTOs

export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  category?: string;
  statusCode: string;
  createdDate: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  category?: string;
}

export interface UpdateTaskRequest {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  category?: string;
  statusCode: string;
}
