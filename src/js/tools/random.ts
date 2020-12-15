import seedrandom, { prng } from 'seedrandom';

export default class Random {
  rng: prng;

  constructor(seed?: string) {
    this.rng = seedrandom(seed);
  }

  // generate a random integer between low and high, both inclusive
  int(low: number, high: number): number {
    return Math.floor(this.rng() * (high - low + 1)) + low;
  }

  bool(): boolean {
    return this.rng() < 0.5;
  }

  // generate in-place a random permutation of arr
  // adapted from https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
  permute<T>(arr: T[]): T[] {
    for (let i = 0; i < arr.length - 2; i += 1) {
      const j = this.int(i, arr.length - 1);
      // swap elements i and j
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
