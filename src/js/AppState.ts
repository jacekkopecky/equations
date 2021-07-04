/*
 * This class holds all the application state.
 *
 * First, it holds a record of recent assignments finished, this is returned
 * in `getLastDayAssignments()` and used in `getCurrentAssignmentBatch()`.
 *
 * Second, it can create new assignments. The functions `getAssignment()`,
 * `getCurrentAssignmentBatch()` and `getNextAssignment()` return known assignments
 * or create new ones, as needed.
 *
 * Third, on demand, it holds a record of all the assignments finished, this is
 * fetched and returned in `useDoneAssignments()`.
 *
 * Finally, it holds user information – level, score, and progress.
 *
 * It also holds login state – has the user provided a code?
 *
 */

import { useState, useEffect } from 'react';

import { StateSetter, useLocalStorage } from './tools/react';
import * as api from './tools/api';

import * as levels from './levels/index';

import {
  BATCH_SIZE,
  chooseLevel,
  selectLastDayAssignments,
} from './shared-with-server/assignments';

import {
  ActivityStatus,
  ActivityType,
  Assignment,
  AssignmentInformation,
  Saveable,
  UserInfo,
  UserState,
} from './types';

const DEFAULT_USER_INFO: UserState = {
  score: 0,
  lastDone: 0,
  progressTowardsNextLevel: 0,
  level: 1,
  lastAssignments: [],
};

interface DoneAssignments {
  doneAssignments: readonly Readonly<Assignment>[],
  loadingMore: boolean,
}

export class AppState {
  readonly activity: Readonly<ActivityStatus>;
  private readonly setActivity: StateSetter<ActivityStatus>;

  private readonly assignments?: readonly Readonly<Assignment>[];
  private readonly setAssignments: StateSetter<Assignment[] | undefined>;

  private userCode?: string;
  private readonly setUserCode: StateSetter<string | undefined>;

  readonly userState: Readonly<UserState>;
  private readonly setUserState: StateSetter<UserState>;

  constructor() {
    [this.activity, this.setActivity] =
      useState<ActivityStatus>(new ActivityStatus(ActivityType.starting));

    [this.assignments, this.setAssignments] = useState();

    [this.userCode, this.setUserCode] =
      useLocalStorage<string | undefined>('equations-v2-userCode', undefined);

    [this.userState, this.setUserState] =
      useLocalStorage('equations-v2-userState', DEFAULT_USER_INFO);

    useEffect(() => {
      this.loadUserState()
        .catch((error) => console.error('error loading UserState', error));
    }, [this.userCode]);
  }

  getCurrentAssignmentBatch(): AssignmentInformation[] {
    const firstUnsolved = this.userState.lastDone + 1;

    const first = findBatchStart(firstUnsolved);
    const assignments: AssignmentInformation[] = [];
    const level = this.userState.level;

    for (let i = 0; i < BATCH_SIZE; i += 1) {
      const assignment = this.getAssignmentInformation(level, first + i);
      assignments[i] = assignment;
    }

    return assignments;
  }

  getAssignment(level: number, n: number, startTime: number): Saveable {
    // todo only allow this if it's the next assignment?

    let assignment = this.assignments?.[n] ?? this.userState.lastAssignments[n];

    if (!assignment) {
      assignment = {
        ...levels.make(level, n),
        startTime,
        level,
        n,
        challenge: level > this.userState.level,
        done: false,
        answeredCorrectly: false,
      };
    }

    const save = async () => {
      this.setAssignments((oldAssignments) => {
        if (!oldAssignments) return undefined;

        const newAssignments = [...oldAssignments];
        newAssignments[n] = assignment;
        return newAssignments;
      });

      this.setUserState((oldUserState) => {
        const newUserState = {
          ...oldUserState,
          lastAssignments: [...oldUserState.lastAssignments],
        };
        newUserState.lastAssignments[n] = assignment;
        return newUserState;
      });

      if (assignment.done && this.userCode) {
        this.changeActivity(ActivityType.saving);
        try {
          const newInfo = await api.saveAssignment(this.userCode, assignment);
          this.setUserState((oldUserState) => {
            return {
              ...oldUserState,
              ...newInfo,
            };
          });
          this.changeActivity(ActivityType.synced);
        } catch (e) {
          console.error(e);
          this.changeActivity(ActivityType.error, 'error saving');
        }
      }
    };

    return { assignment, save };
  }

  getNextAssignment(n: number): AssignmentInformation {
    return this.getAssignmentInformation(this.userState.level, n + 1);
  }

  getLastDayAssignments(): Assignment[] {
    return selectLastDayAssignments(this.getDoneLastAssignments());
  }

  // useDoneAssignments is a hook – it invokes useEffect
  useDoneAssignments(): DoneAssignments {
    // set up background loading of the assignments
    useEffect(() => {
      (async () => {
        if (!this.assignments && this.userCode) {
          this.changeActivity(ActivityType.loading);

          const allAssignments = await api.loadDoneAssignments(this.userCode);
          if (allAssignments.length > 0) {
            this.setAssignments(allAssignments);
          }

          this.changeActivity(ActivityType.synced);
        }
      })()
        .catch((error) => console.error('error loading UserState', error));
    }, [this.userCode]);

    return {
      doneAssignments: this.assignments ?? this.getDoneLastAssignments(),
      loadingMore: Boolean(this.userCode && !this.assignments),
    };
  }

  logIn(code: string): void {
    this.setUserCode(code);
  }

  get currentLoginCode(): string | undefined {
    return this.userCode;
  }

  private getAssignmentInformation(userLevel: number, n: number): AssignmentInformation {
    const challenge = (userLevel < levels.topLevel) && (n % BATCH_SIZE === 0);
    const assignmentInfo = {
      level: challenge ? userLevel + 1 : chooseLevel(userLevel, n),
      n,
      challenge,
      done: false,
      answeredCorrectly: false,
    };

    const attempted = this.assignments?.[n] ?? this.userState.lastAssignments[n];
    if (attempted) {
      assignmentInfo.level = attempted.level;
      assignmentInfo.done = attempted.done;
      assignmentInfo.answeredCorrectly = attempted.answeredCorrectly;
      assignmentInfo.challenge = attempted.challenge;
    }

    return assignmentInfo;
  }

  private getDoneLastAssignments(): Assignment[] {
    return this.userState.lastAssignments.filter(a => a?.done);
  }

  private changeActivity(status: ActivityType, message?: string) {
    this.setActivity(new ActivityStatus(status, message));
  }

  private async loadUserState() {
    const code = this.userCode;
    if (!code) {
      // not logged in, nothing to load, work offline
      this.changeActivity(ActivityType.offline);
      return;
    }

    try {
      this.changeActivity(ActivityType.loggingIn);

      const userState = await api.loadUserState(code);

      this.changeActivity(ActivityType.saving);

      const mergedState = await mergeUserState(this.userState, userState, code);
      this.setUserState(mergedState);

      this.changeActivity(ActivityType.synced);
    } catch (e) {
      if (e instanceof api.Forbidden) {
        // remove userCode if the server rejects it
        this.setUserCode(undefined);
        this.changeActivity(ActivityType.error, `user code ${code} not registered`);
      } else {
        const message = e instanceof Error ? e.message : 'unknown issue';
        console.error('server error, going offline', message);
        this.changeActivity(ActivityType.offline, 'cannot connect to server, working offline');
      }
      console.error(e);
    }
  }
}

// hook function wrapper for AppState because its constructor uses hooks too
// this way linters can enforce hook rules
export default function useAppState(): AppState {
  return new AppState();
}

// batches start at 1, 1+BATCH_SIZE, 1+2*BATCH_SIZE etc.
function findBatchStart(l: number) {
  return Math.floor(((l - 1) / BATCH_SIZE)) * BATCH_SIZE + 1;
}

// merge into server state all local state
async function mergeUserState(local: Readonly<UserState>, server: UserState, code: string): Promise<UserState> {
  let lastSaveUserInfo: UserInfo | undefined;

  const lastServerN = server.lastAssignments[server.lastAssignments.length - 1]?.n ?? 0;

  // merge all local assignments, only if the server didn't know about them already
  // save any done local.lastAssignments that aren't saved
  for (const localAssignment of local.lastAssignments) {
    // skip empty assignments and those presumed already saved
    if (localAssignment == null || localAssignment.n <= lastServerN) continue;

    if (server.lastAssignments[localAssignment.n] == null) {
      if (localAssignment.done) {
        lastSaveUserInfo = await api.saveAssignment(code, localAssignment);
      }
      server.lastAssignments[localAssignment.n] = localAssignment;
    }
  }

  // if saved, use the last userinfo computed on server
  if (lastSaveUserInfo) {
    return {
      ...lastSaveUserInfo,
      lastAssignments: server.lastAssignments,
    };
  } else {
    return server;
  }
}
