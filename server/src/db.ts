// Imports the Google Cloud client library
// const { Datastore } = require('@google-cloud/datastore');

// Creates a client
// const datastore = new Datastore({ namespace: 'v1' });

// const BOOKS_KIND = 'Books';
// const BIN_KIND = 'Bin';
// const IDS_KEY = datastore.key([BOOKS_KIND]);

import {
  UserInfo,
  UserState,
  Assignment,
  PROGRESS_PER_LEVEL,
} from '../../src/js/shared-with-server/types';

// initialize in-memory data
const knownUsers = new Map<string, UserInfo>();
knownUsers.set('a', /* 96C9364D-4CFD-4B6D-AB5B-2D9D7172DA67', */ {
  name: 'Maya',
  score: 7,
  progressTowardsNextLevel: 0,
  level: 1,
  lastDone: 0,
});

const knownAssignments = new Map<string, Assignment[]>();
for (const user of knownUsers.keys()) {
  knownAssignments.set(user, []);
}

export function getUserState(user: string): Promise<UserState | undefined> {
  const userInfo = knownUsers.get(user);
  const assignments = knownAssignments.get(user);
  if (!userInfo || !assignments) return Promise.resolve(undefined);

  const userState = {
    ...userInfo,
    lastAssignments: selectLastAssignments(assignments),
  };
  return Promise.resolve(userState);
}

export function getAssignments(user: string): Promise<Assignment[] | undefined> {
  return Promise.resolve(knownAssignments.get(user));
}

export function saveAssignment(user: string, assignment: Assignment): Promise<UserInfo> {
  // todo only allow save if this assignment is the next one? and if it's done

  const assignments = knownAssignments.get(user);
  const userInfo = knownUsers.get(user);
  if (!userInfo || !assignments) throw new Error('user not found');

  if (assignments?.[assignment.n]) {
    // assignment already saved, cannot save again
    throw new Error('saving conflict');
  }

  assignments[assignment.n] = assignment;
  recomputeUserProgress(userInfo, assignments);
  return Promise.resolve(userInfo);
}

/*
 * computes new user progress information:
 * score: number of assignments answered correctly
 * progress: progress towards next level
 * level: AppState.recomputeUserLevel
 * lastAssignments to serve getUpcomingAssignments and get lastDayAssignments
*/
function recomputeUserProgress(userInfo: UserInfo, assignments: Assignment[]) {
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

export function checkUserIsKnown(user: string): Promise<boolean> {
  return Promise.resolve(knownUsers.has(user));
}

function selectLastAssignments(assignments: Assignment[]) {
  return assignments.filter(a => a);
}
