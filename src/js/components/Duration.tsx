import * as React from 'react';
import { sumDuration, dateToString } from '../shared-with-server/durations';
import { AppState } from '../AppState';

interface DurationProps {
  appState: AppState,
  onlyToday?: boolean,
}

export default function Duration({ appState, onlyToday }: DurationProps): JSX.Element | null {
  const lastDayAssignments = appState.getLastDayAssignments();
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
