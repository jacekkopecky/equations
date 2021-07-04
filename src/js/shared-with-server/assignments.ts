import { dateToString } from './durations';

import {
  Assignment,
} from './types';

export const BATCH_SIZE = 5;

// returns all assignments from the last day (those finished on the same day as the last-finished assignment),
// and possibly more assignments so it at least returns `min` assignments
export function selectLastDayAssignments(done: Assignment[], min = 0): Assignment[] {
  if (done.length === 0) return done;

  const lastAssignment = done[done.length - 1];
  const lastDate = dateToString(lastAssignment);

  // put all with the same date in assignmentsOnLastDate
  const assignmentsOnLastDate = [lastAssignment];
  for (let i = done.length - 2; i >= 0; i -= 1) {
    // there may be missing assignments
    if (!done[i]) continue;

    if (dateToString(done[i]) === lastDate || assignmentsOnLastDate.length < min) {
      assignmentsOnLastDate.push(done[i]);
    } else {
      break;
    }
  }

  return assignmentsOnLastDate;
}

export function chooseLevel(l: number, n: number): number {
  const inBatch = n % BATCH_SIZE;
  switch (inBatch) {
    case 1:
      return Math.max(1, Math.floor(l / 2));
    case 3:
      return Math.max(1, Math.floor(l * 0.8));
    default:
      return l;
  }
}
