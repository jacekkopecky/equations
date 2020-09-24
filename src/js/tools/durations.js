// functions for dealing with dates and durations of assignments

const dateOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

export function dateToString(a) {
  const time = typeof a === 'number' ? a : a.startTime || a.created; // an old version in use by Maya used .created
  return new Date(time).toLocaleDateString(undefined, dateOptions);
}

export function sumDuration(assignments) {
  if (!Array.isArray(assignments)) assignments = [assignments];

  let sumTime = 0;
  for (const a of assignments) {
    sumTime += getDuration(a) || 0;
  }
  return timeDurationString(sumTime);
}

export function timeDurationString(duration) {
  if (duration == null || Number.isNaN(duration)) return null;

  const minutes = duration > 59 ? `${Math.floor(duration / 60)}min ` : '';
  const time = `${minutes}${duration % 60}s`;
  return time;
}

function getDuration(a) {
  if (a == null) return null;
  const duration = Math.round((a.doneTime - (a.startTime ?? a.created)) / 1000);
  return duration;
}
