import { useState } from 'react';

import * as levels from './levels/index';
import { useLocalStorage } from './tools/react';
import { dateToString } from './tools/durations';
import {
  Assignment,
  AssignmentInformation,
  Saveable,
  ActivityStatus,
  ActivityStatusType,
  UserInfo,
} from './types';

import * as api from './tools/api';
import migrateState from './tools/state-migrations';

const BATCH_SIZE = 5;

export interface InternalState {
  userInfo: UserInfo,
  assignments: Assignment[],
  userCode?: string,
}

const DEFAULT_INTERNAL_STATE: InternalState = {
  userInfo: {
    score: 0,
    progress: 0,
    level: 1,
    lastAssignments: [],
  },
  assignments: [],
};

const DEFAULT_ACTIVITY_STATUS: ActivityStatus = {
  status: ActivityStatusType.offline,
};

export class AppState {
  private readonly state: InternalState;
  private readonly setState: (state: InternalState | ((s: InternalState) => InternalState)) => void;

  readonly activity: ActivityStatus;
  private readonly setActivity: (info: ActivityStatus) => void;

  constructor() {
    [this.state, this.setState] = useLocalStorage('equationsState', DEFAULT_INTERNAL_STATE, migrateState);
    [this.activity, this.setActivity] = useState<ActivityStatus>(DEFAULT_ACTIVITY_STATUS);

    // todo if we have local storage user code of non-recent timestamp, log in
  }

  getAssignment(level: number, n: number, startTime: number): Assignment & Saveable {
    let assignment = this.state.assignments[n];

    if (!assignment) {
      assignment = {
        ...levels.make(level, n),
        startTime,
        level,
        n,
        challenge: level > this.level,
        done: false,
        answeredCorrectly: false,
      };
    }

    const save = () => {
      this.setState((oldState) => {
        const newState = { ...oldState, assignments: [...oldState.assignments] };
        newState.assignments[n] = assignment;
        newState.userInfo.level = recomputeUserLevel(newState);
        return newState;
      });
    };

    // todo what to do if we already have the assignment, it's not done, and startTime differs?

    return { ...assignment, save };
  }

  getNextAssignment(n: number): AssignmentInformation | null {
    const assignmentN = this.getAssignmentInformation(0, n);
    if (!assignmentN.done) return null; // there should be no "next" link

    return this.getAssignmentInformation(this.level, n + 1);
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

    const attempted = this.state.assignments[n];
    if (attempted) {
      assignmentInfo.level = attempted.level;
      assignmentInfo.done = attempted.done;
      assignmentInfo.answeredCorrectly = attempted.answeredCorrectly;
      assignmentInfo.challenge = attempted.challenge;
    }

    return assignmentInfo;
  }

  getUpcomingAssignments(): AssignmentInformation[] {
    let firstUnsolved = this.state.assignments.findIndex((a, i) => i > 0 && !a?.done);
    if (firstUnsolved === -1) firstUnsolved = this.state.assignments.length || 1;

    const first = findBatchStart(firstUnsolved);
    const assignments: AssignmentInformation[] = [];
    const level = this.level;

    for (let i = 0; i < BATCH_SIZE; i += 1) {
      const assignment = this.getAssignmentInformation(level, first + i);
      assignments[i] = assignment;
    }

    return assignments;
  }

  get score(): number {
    return this.state.assignments.filter((a) => a?.answeredCorrectly).length;
  }

  get level(): number {
    // the level is at least 1
    return Math.max(1, this.state.userInfo.level);
  }

  get progress(): number {
    const level = this.level;
    const challengesSolved = this.state.assignments.filter(
      (a) => Number(a?.level) > level && a?.answeredCorrectly,
    );
    return challengesSolved.length;
  }

  get progressRequired(): number {
    return challengesRequired(this.level + 1);
  }

  get doneAssignments(): Assignment[] {
    return this.state.assignments.filter((a) => a?.done);
  }

  get lastDayAssignments(): Assignment[] {
    const done = this.doneAssignments;
    if (done.length === 0) return done;

    const lastAssignment = done[done.length - 1];
    const lastDate = dateToString(lastAssignment);

    // put all with the same date in assignmentsOnLastDate
    const assignmentsOnLastDate = [lastAssignment];
    for (let i = done.length - 2; i >= 0; i -= 1) {
      if (dateToString(done[i]) === lastDate) {
        assignmentsOnLastDate.push(done[i]);
      } else {
        break;
      }
    }

    return assignmentsOnLastDate;
  }

  get userName(): string | null {
    return this.state.userInfo.name ?? null;
  }

  get loggedIn(): boolean {
    return this.state.userCode != null;
  }

  async logIn(code: string): Promise<void> {
    this.dispatchActivity({ message: '', status: ActivityStatusType.loggingIn });

    try {
      const userInfo = await api.loadUserInformation(code);

      // save the code so we can log in automatically next time
      this.setState((state) => ({ ...state, userInfo, userCode: code }));

      this.dispatchActivity({ message: 'working…', status: ActivityStatusType.loading });
      await new Promise((resolve) => { setTimeout(resolve, 1000); });

      this.dispatchActivity({ message: 'foo', status: ActivityStatusType.error });
      await new Promise((resolve) => { setTimeout(resolve, 1000); });

      this.dispatchActivity({ message: '', status: ActivityStatusType.synced });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'unknown issue';
      this.dispatchActivity({ message, status: ActivityStatusType.error });
    }

    // start loading all assignments from server
    // if server progress doesn't agree with local storage:
    //   if we have extra assignments, save them from local storage on server (one by one)
    //   if we have fewer, load assignments from server and put them in ours

    // later, when finishing an assignment, save it to server (start the same subprocess as above)
  }

  private dispatchActivity(current: ActivityStatus) {
    this.setActivity({ ...this.activity, ...current });
  }
}

// hook function wrapper for AppState because its constructor uses hooks too
// this way linters can enforce hook rules
export default function useAppState(): AppState {
  return new AppState();
}

function chooseLevel(l: number, n: number): number {
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

// batches start at 1, 1+BATCH_SIZE, 1+2*BATCH_SIZE etc.
function findBatchStart(l: number) {
  return Math.floor(((l - 1) / BATCH_SIZE)) * BATCH_SIZE + 1;
}

// how many challenges at the given level are required to reach this level
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function challengesRequired(level?: number) {
  return 5; // might be variable at some point
}

function recomputeUserLevel(state: InternalState): number {
  let level = 1;
  let progress = 0;
  let target = challengesRequired(level + 1);

  for (const assignment of state.assignments) {
    if (assignment == null) continue;

    if (assignment.level > level && assignment.answeredCorrectly) {
      progress += 1;
      if (progress >= target) {
        level += 1;
        target = challengesRequired(level + 1);
        progress = 0;
      }
    }
  }

  return level;
}
