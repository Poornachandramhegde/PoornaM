export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type TodoStatus = 'TODO' | 'COMPLETED';

export type BucketStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';

export interface ScheduledTask {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  priority: Priority;
  status: TaskStatus;
  category?: string | null;
  googleEventId?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null; // YYYY-MM-DD
  priority: Priority;
  status: TodoStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface BucketItem {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  category?: string | null;
  targetDate?: string | null;
  status: BucketStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface GoogleCalendarStatus {
  connected: boolean;
  email?: string | null;
  calendarId?: string | null;
}

export interface GoogleCalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  date?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  startDateTime?: string;
  endDateTime?: string;
  isAllDay?: boolean;
  htmlLink?: string;
}

export interface UnifiedScheduleItem {
  id: string;
  source: 'poornam' | 'google';
  title: string;
  description?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  priority?: Priority;
  status?: TaskStatus;
  category?: string | null;
  googleEventId?: string | null;
  originalTask?: ScheduledTask;
  originalGoogleEvent?: GoogleCalendarEvent;
}
