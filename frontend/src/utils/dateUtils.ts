import { format, addDays as dateFnsAddDays, startOfWeek } from 'date-fns';

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateDisplay(dateStr: string): string {
  try {
    const today = getTodayDateString();
    if (dateStr === today) return 'Today';
    
    // Parse YYYY-MM-DD safely
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return format(date, 'EEE, dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return '';
  const [hoursStr, minutesStr] = timeStr.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr || '00';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} – ${endTime}`;
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const result = dateFnsAddDays(date, days);
  const year = result.getFullYear();
  const month = String(result.getMonth() + 1).padStart(2, '0');
  const day = String(result.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getWeekDays(referenceDateStr: string): { dateStr: string; label: string; isToday: boolean }[] {
  const [y, m, d] = referenceDateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const todayStr = getTodayDateString();

  const days: { dateStr: string; label: string; isToday: boolean }[] = [];
  for (let i = 0; i < 7; i++) {
    const current = dateFnsAddDays(weekStart, i);
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    days.push({
      dateStr,
      label: format(current, 'EEE d'),
      isToday: dateStr === todayStr,
    });
  }
  return days;
}

export function isDateToday(dateStr: string): boolean {
  return dateStr === getTodayDateString();
}
