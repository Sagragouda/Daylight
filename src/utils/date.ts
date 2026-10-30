/**
 * Date utility helpers for Daylight
 */

export function getGreeting(): { text: string; subtext: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return {
      text: 'Good morning',
      subtext: 'Start your day with clarity, focus, and deliberate action.',
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      text: 'Good afternoon',
      subtext: 'Keep the momentum steady and protect your deep focus.',
    };
  } else if (hour >= 17 && hour < 22) {
    return {
      text: 'Good evening',
      subtext: 'Reflect on what you accomplished and wind down peacefully.',
    };
  } else {
    return {
      text: 'Late night quiet',
      subtext: 'Rest is just as essential as execution. Be kind to yourself.',
    };
  }
}

/**
 * Returns a local calendar date string formatted as 'YYYY-MM-DD'
 * without UTC conversion that can shift the day across timezones.
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's local calendar date as 'YYYY-MM-DD'
 */
export function getTodayDateString(): string {
  return getLocalDateString(new Date());
}

export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const todayStr = getTodayDateString();
  if (dateStr === todayStr) return 'Today';

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateStr === getLocalDateString(tomorrow)) return 'Tomorrow';

  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getFormattedHeaderDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats a local date string ('YYYY-MM-DD') for the Planner header.
 */
export function formatPlannerDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Formats a week date range ('YYYY-MM-DD' to 'YYYY-MM-DD') for the Planner header.
 */
export function formatPlannerWeekRange(startStr: string, endStr: string): string {
  if (!startStr || !endStr) return '';
  const [sY, sM, sD] = startStr.split('-').map(Number);
  const [eY, eM, eD] = endStr.split('-').map(Number);
  const sDate = new Date(sY, sM - 1, sD);
  const eDate = new Date(eY, eM - 1, eD);

  const startPart = sDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endPart = eDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startPart} – ${endPart}`;
}

/**
 * Returns past 7 days (including today) in local 'YYYY-MM-DD' format and short weekday label
 */
export function getPastSevenDays(): { dateStr: string; label: string; dayNum: number; isToday: boolean }[] {
  const days = [];
  const todayStr = getTodayDateString();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    const label = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const dayNum = d.getDate();
    days.push({
      dateStr,
      label,
      dayNum,
      isToday: dateStr === todayStr,
    });
  }
  return days;
}
