// Task types matching the API DTOs

export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  category?: string;
  priority?: string;
  statusCode: string;
  createdDate: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  category?: string;
  priority?: string;
}

export interface UpdateTaskRequest {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  category?: string;
  priority?: string;
  statusCode: string;
}
