import Random from './tools/random';
import levels from './levels/index';
import { useLocalStorage } from './tools/react';

export default class AppState {
  constructor() {
    const [state, setState] = useLocalStorage('state', {});
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

  _duplicateState() {
    this.state = { ...this.state };
  }

  // use this after _duplicateState and then changing some values there
  _saveState() {
    this.setState(this.state);
  }
}
