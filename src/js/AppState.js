import Random from './tools/random';
import levels from './levels/index';
import { useLocalStorage } from './tools/react';

const BATCH_SIZE = 5;

export default class AppState {
  constructor() {
    const [state, setState] = useLocalStorage('equationsState', {});
    this.state = state;
    this.setState = setState;

    if (!Array.isArray(this.state.assignments)) {
      this.state.assignments = [];
    }

    this.topLevel = levels.length - 1;
  }

  getAssignment(level, n, startTime) {
    let assignment = this.state.assignments[n];

    if (!assignment) {
      const rng = new Random(`${level}/${n}`);
      assignment = levels[level](rng);
      assignment.startTime = startTime;
      assignment.level = level;
      assignment.n = n;
      if (level > this.level) assignment.challenge = true;
    }

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

  getAssignmentInformation(userLevel, n) {
    const challenge = (userLevel < this.topLevel) && (n % BATCH_SIZE === 0);
    const assignmentInfo = {
      level: challenge ? userLevel + 1 : chooseLevel(userLevel),
      n,
      challenge,
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

  getNextAssignment(n) {
    const assignmentN = this.getAssignmentInformation(0, n);
    if (!assignmentN.done) return null; // there should be no "next" link

    return this.getAssignmentInformation(this.level, n + 1);
  }

  getUpcomingAssignments() {
    let firstUnsolved = this.state.assignments.findIndex((a, i) => i > 0 && !a?.done);
    if (firstUnsolved === -1) firstUnsolved = this.state.assignments.length || 1;

    const first = Math.floor(((firstUnsolved - 1) / BATCH_SIZE)) * BATCH_SIZE + 1;
    const assignments = [];
    const level = this.level;

    for (let i = 0; i < BATCH_SIZE; i += 1) {
      const assignment = this.getAssignmentInformation(level, first + i);
      assignments[i] = assignment;
    }

    return assignments;
  }

  _duplicateState() {
    this.state = { ...this.state };
  }

  // use this after _duplicateState and then changing some values there
  _saveState() {
    this.setState(this.state);
  }

  get score() {
    return this.state.assignments.filter((a) => a?.answeredCorrectly).length;
  }

  get level() {
    return this.state.level || 1;
  }

  _recomputeUserLevel() {
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

  get progress() {
    const level = this.level;
    const progress = this.state.assignments.filter((a) => Number(a?.level) > level).length;
    return progress;
  }

  get progressRequired() {
    return challengesRequired(this.level + 1);
  }

  get doneAssignments() {
    return this.state.assignments.filter((a) => a?.done);
  }
}

function chooseLevel(l) {
  return l;
  // todo give lower-level assignments too?
}

// how many challenges at the given level are required to reach this level
function challengesRequired() {
  return 5; // might be variable at some point
}
