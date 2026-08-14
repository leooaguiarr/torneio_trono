import { Timeframe } from '../types';

/**
 * Returns Date object for local ISO string conversion
 */
export function formatToDateTimeLocal(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Parses ISO string or datetime-local string to Date
 */
export function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

/**
 * Returns bounds for start and end of week (Monday 00:00:00 to Sunday 23:59:59)
 */
export function getWeekBounds(offsetWeeks: number = 0, referenceDate: Date = new Date()): { start: Date; end: Date } {
  const current = new Date(referenceDate);
  const day = current.getDay(); // 0 is Sunday, 1 is Monday...
  // Calculate distance to Monday
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  
  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday + offsetWeeks * 7);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
}

/**
 * Returns bounds for month (1st 00:00:00 to last day 23:59:59)
 */
export function getMonthBounds(offsetMonths: number = 0, referenceDate: Date = new Date()): { start: Date; end: Date } {
  const current = new Date(referenceDate);
  const targetMonth = current.getMonth() + offsetMonths;
  const year = current.getFullYear();

  const start = new Date(year, targetMonth, 1, 0, 0, 0, 0);
  // Last day of month
  const end = new Date(year, targetMonth + 1, 0, 23, 59, 59, 999);

  return { start, end };
}

/**
 * Checks if a timestamp falls within a specific timeframe
 */
export function isWithinTimeframe(timestamp: string, timeframe: Timeframe, referenceDate: Date = new Date()): boolean {
  const date = new Date(timestamp);
  
  if (timeframe === 'all_time') return true;

  if (timeframe === 'this_week') {
    const { start, end } = getWeekBounds(0, referenceDate);
    return date >= start && date <= end;
  }

  if (timeframe === 'last_week') {
    const { start, end } = getWeekBounds(-1, referenceDate);
    return date >= start && date <= end;
  }

  if (timeframe === 'this_month') {
    const { start, end } = getMonthBounds(0, referenceDate);
    return date >= start && date <= end;
  }

  if (timeframe === 'last_month') {
    const { start, end } = getMonthBounds(-1, referenceDate);
    return date >= start && date <= end;
  }

  return true;
}

/**
 * Get readable title for timeframe
 */
export function getTimeframeLabel(timeframe: Timeframe, referenceDate: Date = new Date()): { title: string; subtitle: string } {
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  if (timeframe === 'this_week') {
    const { start, end } = getWeekBounds(0, referenceDate);
    const startStr = `${start.getDate()} de ${months[start.getMonth()].substring(0, 3)}`;
    const endStr = `${end.getDate()} de ${months[end.getMonth()].substring(0, 3)}`;
    return {
      title: 'Semana Atual',
      subtitle: `${startStr} a ${endStr}`,
    };
  }

  if (timeframe === 'last_week') {
    const { start, end } = getWeekBounds(-1, referenceDate);
    const startStr = `${start.getDate()} de ${months[start.getMonth()].substring(0, 3)}`;
    const endStr = `${end.getDate()} de ${months[end.getMonth()].substring(0, 3)}`;
    return {
      title: 'Semana Passada',
      subtitle: `${startStr} a ${endStr}`,
    };
  }

  if (timeframe === 'this_month') {
    const { start } = getMonthBounds(0, referenceDate);
    return {
      title: `${months[start.getMonth()]} de ${start.getFullYear()}`,
      subtitle: 'Mês Atual',
    };
  }

  if (timeframe === 'last_month') {
    const { start } = getMonthBounds(-1, referenceDate);
    return {
      title: `${months[start.getMonth()]} de ${start.getFullYear()}`,
      subtitle: 'Mês Anterior',
    };
  }

  return {
    title: 'Geral / Histórico Completo',
    subtitle: 'Todas as idas registradas',
  };
}

/**
 * Human relative or formatted date
 */
export function formatFriendlyDate(isoString: string): { relative: string; exactTime: string; fullDate: string } {
  const date = new Date(isoString);
  const now = new Date();
  
  const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const fullDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  // Compare day
  const isToday = date.toDateString() === now.toDateString();
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  let relative = fullDate;
  if (isToday) {
    relative = 'Hoje';
  } else if (isYesterday) {
    relative = 'Ontem';
  } else {
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const daysDiff = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7 && daysDiff > 0) {
      relative = dayNames[date.getDay()];
    }
  }

  return {
    relative,
    exactTime: timeStr,
    fullDate,
  };
}
