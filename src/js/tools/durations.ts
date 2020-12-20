// functions for dealing with dates and durations of assignments

import { Assignment } from '../types';

const dateOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

export function dateToString(a: Assignment | number): string {
  const time = typeof a === 'number' ? a : a.startTime;
  return new Date(time).toLocaleDateString(undefined, dateOptions);
}

export function sumDuration(assignments: Assignment | Assignment[]): string | null {
  if (!Array.isArray(assignments)) assignments = [assignments];

  let sumTime = 0;
  for (const a of assignments) {
    const dur = getDuration(a);
    if (dur == null) return null;
    sumTime += dur;
  }
  return timeDurationString(sumTime);
}

function timeDurationString(duration?: number): string | null {
  if (duration == null) return null;

  const minutes = duration > 59 ? `${Math.floor(duration / 60)}min ` : '';
  const time = `${minutes}${duration % 60}s`;
  return time;
}

function getDuration(a?: Assignment) {
  if (a == null || a.doneTime == null) return null;
  const duration = Math.round((a.doneTime - (a.startTime)) / 1000);
  return duration;
}
