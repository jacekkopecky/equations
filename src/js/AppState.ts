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
} from './types';

import * as api from './tools/api';

const BATCH_SIZE = 5;

interface InternalState {
  level: number,
  assignments: Assignment[],
  userCode?: string,
}

const DEFAULT_INTERNAL_STATE: InternalState = {
  level: 1,
  assignments: [],
};

const DEFAULT_ACTIVITY_STATUS: ActivityStatus = {
  status: ActivityStatusType.offline,
};

// unverified InternalState
interface UnverifiedState {
  level?: number,
  assignments?: Array<{ created?: number, startTime: number }>,
  userCode?: string,
}

function migrateCreatedToStartTime(obj: unknown): InternalState {
  if (obj == null || typeof obj !== 'object' || Array.isArray(obj)) {
    obj = {};
  }

  const data = obj as UnverifiedState;
  if (data.assignments == null) data.assignments = [];
  if (typeof data.level !== 'number') data.level = 1;
  if (typeof data.userCode !== 'string') delete data.userCode;

  // assignments[0] is to be ignored
  for (let i = 1; i < data.assignments.length; i += 1) {
    const a = data.assignments[i];
    if (a != null && a.created != null) {
      a.startTime = a.created;
      delete a.created;
    }
  }
  // todo we could also verify the structure of assignments
  return data as InternalState;
}

export class AppState {
  private readonly state: InternalState;
  private readonly setState: (state: InternalState | ((s: InternalState) => InternalState)) => void;

  private readonly userInfo?: api.UserInfo;
  private readonly setUserInfo: (info: api.UserInfo) => void;

  readonly activity: ActivityStatus;
  private readonly setActivity: (info: ActivityStatus) => void;

  constructor() {
    const [state, setState] = useLocalStorage(
      'equationsState',
      DEFAULT_INTERNAL_STATE,
      migrateCreatedToStartTime,
    );
    this.state = state;
    this.setState = setState;

    const [userInfo, setUserInfo] = useState<api.UserInfo>();
    this.userInfo = userInfo;
    this.setUserInfo = setUserInfo;

    [this.activity, this.setActivity] = useState<ActivityStatus>(DEFAULT_ACTIVITY_STATUS);
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
      this.state.assignments[n] = assignment;
      this._recomputeUserLevel();
      this.setState({ ...this.state });
    };

    // todo what to do if we already have the assignment, it's not done, and startTime differs?

    return { ...assignment, save };
  }

  getAssignmentInformation(userLevel: number, n: number): AssignmentInformation {
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

  getNextAssignment(n: number): AssignmentInformation | null {
    const assignmentN = this.getAssignmentInformation(0, n);
    if (!assignmentN.done) return null; // there should be no "next" link

    return this.getAssignmentInformation(this.level, n + 1);
  }

  getUpcomingAssignments(): AssignmentInformation[] {
    let firstUnsolved = this.state.assignments.findIndex((a, i) => i > 0 && !a?.done);
    if (firstUnsolved === -1) firstUnsolved = this.state.assignments.length || 1;

    const first = Math.floor(((firstUnsolved - 1) / BATCH_SIZE)) * BATCH_SIZE + 1;
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
    return this.state.level;
  }

  private _recomputeUserLevel(): void {
    let level = 1;
    let progress = 0;
    let target = challengesRequired(level + 1);

    for (const assignment of this.state.assignments) {
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

    this.state.level = level;
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

    // put all with the same date in assignmentsOnDay
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
    return this.userInfo?.name ?? null;
  }

  get loggedIn(): boolean {
    return this.userInfo != null;
  }

  async logIn(code: string): Promise<void> {
    this.dispatchActivity({ message: '', status: ActivityStatusType.loggingIn });

    try {
      const userInfo = await api.loadUserInformation(code);

      this.setUserInfo(userInfo);
      // save the code so we can log in automatically next time
      this.setState((state) => ({ ...state, code }));


      this.dispatchActivity({ message: '', status: ActivityStatusType.synced });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'unknown issue';
      this.dispatchActivity({ message: msg, status: ActivityStatusType.error });
    }
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

// how many challenges at the given level are required to reach this level
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function challengesRequired(level?: number) {
  return 5; // might be variable at some point
}
