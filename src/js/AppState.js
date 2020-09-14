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
  }

  getAssignment(level, n) {
    let assignment = this.state.assignments[n];

    if (!assignment) {
      const rng = new Random(`${level}/${n}`);
      assignment = levels[level](rng);
      assignment.created = Date.now();
      assignment.level = level;
      assignment.n = n;
    }

    if (!assignment.save) {
      assignment.save = () => {
        this._duplicateState();
        this.state.assignments[n] = assignment;
        this._saveState();
      };
    }

    return assignment;
  }

  getAssignmentInformation(userLevel, n) {
    const challenge = n % BATCH_SIZE === 0;
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
    return 1 || this.todo;
  }

  get progressIndicator() {
    const level = this.level;
    const progress = this.state.assignments.filter((a) => Number(a?.level) > level).length;
    return `${progress}/5`;
  }
}

function chooseLevel(l) {
  return l;
  // todo give lower-level assignments too?
}
