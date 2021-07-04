import {
  UserInfo,
  UserState,
  Assignment,
} from '../../src/js/shared-with-server/types';

import {
  selectLastDayAssignments,
  recomputeUserProgress,
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
