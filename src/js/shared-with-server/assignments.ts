import { dateToString } from './durations';

import {
  Assignment,
  UserState,
  UserInfo,
  PROGRESS_PER_LEVEL,
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

/*
 * computes new user progress information:
 * score: number of assignments answered correctly
 * lastDone: the `n` of the last finished assignment
 * level: a level grows every time PROGRESS_PER_LEVEL challenges are answered correctly
 * progressTowardsNextLevel: how many challenges above the current level are answered correctly
*/
export function recomputeUserProgress(userInfo: UserInfo, assignments: Assignment[]): void {
  const score = assignments.filter((a) => a?.answeredCorrectly).length;

  const lastDone = Math.max(0, assignments.length - 1);

  let progress = 0;
  let level = 1;
  let target = PROGRESS_PER_LEVEL;

  for (const assignment of assignments) {
    if (assignment == null) continue;

    if (assignment.level > level && assignment.answeredCorrectly) {
      progress += 1;
      if (progress >= target) {
        level += 1;
        target = PROGRESS_PER_LEVEL;
        progress = 0;
      }
    }
  }

  userInfo.score = score;
  userInfo.lastDone = lastDone;
  userInfo.level = level;
  userInfo.progressTowardsNextLevel = progress;
}

export function addToUserProgress(oldState: UserState, assignment: Assignment): UserState {
  const n = assignment.n;

  const newState = {
    ...oldState,
    lastAssignments: [...oldState.lastAssignments],
  };

  // ignore if it was already done
  if (!newState.lastAssignments[n]?.done) {
    newState.lastAssignments[n] = assignment;
    if (newState.lastAssignments[n]?.done) {
      newState.lastDone = n;
      if (assignment.answeredCorrectly) {
        newState.score += 1;
        if (assignment.level > newState.level) {
          newState.progressTowardsNextLevel += 1;
          if (newState.progressTowardsNextLevel === PROGRESS_PER_LEVEL) {
            newState.progressTowardsNextLevel = 0;
            newState.level += 1;
          }
        }
      }
    }
  }

  return newState;
}
