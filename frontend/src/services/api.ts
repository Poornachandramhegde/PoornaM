import type { ScheduledTask, Todo, BucketItem, GoogleCalendarStatus, GoogleCalendarEvent } from '../types/index.js';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorMsg = `Request failed: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorData.message || errorMsg;
      if (errorData.details && Array.isArray(errorData.details)) {
        errorMsg += ` (${errorData.details.map((d: any) => d.message).join(', ')})`;
      }
    } catch {
      // ignore JSON parse error
    }
    throw new Error(errorMsg);
  }

  const json = await response.json();
  return json.data !== undefined ? json.data : json;
}

export const taskApi = {
  getTasks: (params?: { date?: string; startDate?: string; endDate?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.append('date', params.date);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.status) searchParams.append('status', params.status);
    const qs = searchParams.toString();
    return fetchJson<ScheduledTask[]>(`/tasks${qs ? `?${qs}` : ''}`);
  },

  getTaskById: (id: string) => fetchJson<ScheduledTask>(`/tasks/${id}`),

  createTask: (data: {
    title: string;
    description?: string | null;
    date: string;
    startTime: string;
    endTime: string;
    priority?: string;
    category?: string | null;
    status?: string;
  }) =>
    fetchJson<ScheduledTask>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTask: (
    id: string,
    data: Partial<{
      title: string;
      description?: string | null;
      date: string;
      startTime: string;
      endTime: string;
      priority?: string;
      category?: string | null;
      status?: string;
    }>
  ) =>
    fetchJson<ScheduledTask>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTask: (id: string) =>
    fetchJson<{ success: boolean }>(`/tasks/${id}`, {
      method: 'DELETE',
    }),

  completeTask: (id: string) =>
    fetchJson<ScheduledTask>(`/tasks/${id}/complete`, {
      method: 'PATCH',
    }),
};

export const todoApi = {
  getTodos: (params?: { status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    const qs = searchParams.toString();
    return fetchJson<Todo[]>(`/todos${qs ? `?${qs}` : ''}`);
  },

  getTodoById: (id: string) => fetchJson<Todo>(`/todos/${id}`),

  createTodo: (data: {
    title: string;
    description?: string | null;
    dueDate?: string | null;
    priority?: string;
  }) =>
    fetchJson<Todo>('/todos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTodo: (
    id: string,
    data: Partial<{
      title: string;
      description?: string | null;
      dueDate?: string | null;
      priority?: string;
      status?: string;
    }>
  ) =>
    fetchJson<Todo>(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTodo: (id: string) =>
    fetchJson<{ success: boolean }>(`/todos/${id}`, {
      method: 'DELETE',
    }),

  completeTodo: (id: string) =>
    fetchJson<Todo>(`/todos/${id}/complete`, {
      method: 'PATCH',
    }),

  scheduleTodo: (
    id: string,
    data: {
      date: string;
      startTime: string;
      endTime: string;
      priority?: string;
      category?: string | null;
    }
  ) =>
    fetchJson<{ scheduledTask: ScheduledTask; todo: Todo; syncError?: string | null }>(
      `/todos/${id}/schedule`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),
};

export const bucketApi = {
  getItems: (params?: { status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    const qs = searchParams.toString();
    return fetchJson<BucketItem[]>(`/bucket${qs ? `?${qs}` : ''}`);
  },

  getItemById: (id: string) => fetchJson<BucketItem>(`/bucket/${id}`),

  createItem: (data: {
    title: string;
    description?: string | null;
    category?: string | null;
    targetDate?: string | null;
    status?: string;
  }) =>
    fetchJson<BucketItem>('/bucket', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateItem: (
    id: string,
    data: Partial<{
      title: string;
      description?: string | null;
      category?: string | null;
      targetDate?: string | null;
      status?: string;
    }>
  ) =>
    fetchJson<BucketItem>(`/bucket/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteItem: (id: string) =>
    fetchJson<{ success: boolean }>(`/bucket/${id}`, {
      method: 'DELETE',
    }),

  updateStatus: (id: string, status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED') =>
    fetchJson<BucketItem>(`/bucket/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

export const googleApi = {
  getStatus: () => fetchJson<GoogleCalendarStatus>('/google/status'),

  disconnect: () =>
    fetchJson<{ success: boolean }>('/google/disconnect', {
      method: 'POST',
    }),

  getEvents: (params?: { timeMin?: string; timeMax?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.timeMin) searchParams.append('timeMin', params.timeMin);
    if (params?.timeMax) searchParams.append('timeMax', params.timeMax);
    const qs = searchParams.toString();
    return fetchJson<GoogleCalendarEvent[]>(`/google/events${qs ? `?${qs}` : ''}`);
  },
};
