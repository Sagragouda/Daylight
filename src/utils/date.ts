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

export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const todayStr = getTodayDateString();
  if (dateStr === todayStr) return 'Today';

  const d = new Date(dateStr + 'T00:00:00');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';

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
 * Returns past 7 days (including today) in 'YYYY-MM-DD' format and short weekday label
 */
export function getPastSevenDays(): { dateStr: string; label: string; dayNum: number; isToday: boolean }[] {
  const days = [];
  const todayStr = getTodayDateString();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
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
