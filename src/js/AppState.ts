import levels from './levels/index';
import Random from './tools/random';
import { useLocalStorage } from './tools/react';
import { dateToString } from './tools/durations';

const BATCH_SIZE = 5;

interface Assignment {
  level: number,
  n: number,
  challenge: boolean,

  startTime?: number,
  answeredCorrectly: boolean,
  done: boolean,

  save?: () => void,
}

interface AppStateInternalState {
  level: number,
  assignments: Assignment[],
}

function defaultInternalState(): AppStateInternalState {
  return {
    level: 1,
    assignments: [],
  };
}

export class AppState {
  topLevel: number;
  state: AppStateInternalState;
  setState: (state: AppStateInternalState) => void;

  constructor() {
    const [state, setState] = useLocalStorage('equationsState', defaultInternalState());
    this.state = state;
    this.setState = setState;

    this.topLevel = levels.length - 1;
  }

  getAssignment(level: number, n: number, startTime: number): Assignment {
    let assignment = this.state.assignments[n];

    const levelFunction = levels[level];
    if (levelFunction == null) throw new TypeError('level does not exist');

    if (!assignment) {
      const rng = new Random(`${level}/${n}`);
      assignment = levelFunction(rng) as Assignment;
      assignment.startTime = startTime;
      assignment.level = level;
      assignment.n = n;
      if (level > this.level) assignment.challenge = true;
    }

    // todo what to do if we already have the assignment, it's not done, and startTime differs?

    if (!assignment.save) {
      assignment.save = () => {
        this._duplicateState();
        this.state.assignments[n] = assignment;
        this._recomputeUserLevel();
        this._saveState();
      };
    }

    return assignment;
  }

  getAssignmentInformation(userLevel: number, n: number): Assignment {
    const challenge = (userLevel < this.topLevel) && (n % BATCH_SIZE === 0);
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

  getNextAssignment(n: number): Assignment | null {
    const assignmentN = this.getAssignmentInformation(0, n);
    if (!assignmentN.done) return null; // there should be no "next" link

    return this.getAssignmentInformation(this.level, n + 1);
  }

  getUpcomingAssignments(): Assignment[] {
    let firstUnsolved = this.state.assignments.findIndex((a, i) => i > 0 && !a?.done);
    if (firstUnsolved === -1) firstUnsolved = this.state.assignments.length || 1;

    const first = Math.floor(((firstUnsolved - 1) / BATCH_SIZE)) * BATCH_SIZE + 1;
    const assignments: Assignment[] = [];
    const level = this.level;

    for (let i = 0; i < BATCH_SIZE; i += 1) {
      const assignment = this.getAssignmentInformation(level, first + i);
      assignments[i] = assignment;
    }

    return assignments;
  }

  _duplicateState(): void {
    this.state = { ...this.state };
  }

  // use this after _duplicateState and then changing some values there
  _saveState(): void {
    this.setState(this.state);
  }

  get score(): number {
    return this.state.assignments.filter((a) => a?.answeredCorrectly).length;
  }

  get level(): number {
    return this.state.level;
  }

  _recomputeUserLevel(): void {
    let level = 1;
    let progress = 0;
    let target = challengesRequired(level + 1);

    for (const assignment of this.state.assignments) {
      if (assignment == null) continue;

      if (assignment.level > level) {
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
    const progress = this.state.assignments.filter((a) => Number(a?.level) > level).length;
    return progress;
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
