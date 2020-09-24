import React from 'react';
import { sumDuration, dateToString } from '../tools/durations';

export default function Duration({ appState, onlyToday }) {
  const lastDayAssignments = appState.lastDayAssignments;
  if (lastDayAssignments.length === 0) return null;

  const duration = sumDuration(lastDayAssignments);
  if (!duration) return null;

  const lastDate = dateToString(lastDayAssignments[0]);
  const todayDate = dateToString(Date.now());
  const isToday = todayDate === lastDate;

  if (!isToday && onlyToday) return null;

  const dateString = isToday ? 'today' : `on ${lastDate}`;

  return <p>Time { dateString }: { duration }</p>;
}
