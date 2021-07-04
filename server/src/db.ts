import {
  UserInfo,
  UserState,
  Assignment,
  PROGRESS_PER_LEVEL,
} from '../../src/js/shared-with-server/types';

import {
  selectLastDayAssignments,
  BATCH_SIZE,
} from '../../src/js/shared-with-server/assignments';

import * as dbll from './db-lowlevel';


export async function getUserState(user: string): Promise<UserState | undefined> {
  const state = await dbll.loadUserState(user);

  const userState = {
    ...state.info,
    lastAssignments: selectLastDayAssignments(state.assignments, BATCH_SIZE),
  };
  return Promise.resolve(userState);
}

export async function getAssignments(user: string): Promise<Assignment[] | undefined> {
  const state = await dbll.loadUserState(user);
  return state.assignments;
}

export async function saveAssignment(user: string, assignment: Assignment): Promise<UserInfo> {
  const tx = await dbll.startTransaction();

  const state = await dbll.loadUserState(user, tx);

  // todo only allow save if this assignment is the next one? and if it's done

  // const assignments = knownAssignments.get(user);
  // const userInfo = knownUsers.get(user);
  // if (!userInfo || !assignments) throw new Error('user not found');
  //

  if (state.assignments[assignment.n]) {
    // assignment already saved, cannot save again
    throw new Error('saving conflict');
  }

  state.assignments[assignment.n] = assignment;
  recomputeUserProgress(state.info, state.assignments);
  await dbll.saveUserState(user, state, tx);

  await tx.commit();

  return Promise.resolve(state.info);
}

export { checkUserIsKnown } from './db-lowlevel';

/*
 * computes new user progress information:
 * score: number of assignments answered correctly
 * progress: progress towards next level
 * level: AppState.recomputeUserLevel
 * lastAssignments to serve getUpcomingAssignments and get lastDayAssignments
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
  userInfo.progressTowardsNextLevel = progress;
  userInfo.level = level;
}
