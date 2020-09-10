import seedrandom from 'seedrandom';

export default class Random {
  constructor(seed) {
    this.rng = seedrandom(seed);
  }

  int(low, high) {
    return Math.floor(this.rng() * (high - low + 1)) + low;
  }

  bool() {
    return this.rng() < 0.5;
  }
}
