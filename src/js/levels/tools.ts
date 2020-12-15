/*
 * tools for building levels
 */

import { LevelFunction } from '../types';

export const challengeNoText = 'Part of this challenge is that there is no explanatory text.';

export function onlyText(f: LevelFunction): LevelFunction {
  return (rng) => {
    const retval = f(rng);
    retval.onlyText = true;
    retval.text?.push('', 'Part of the challenge is to write the first two equations.');
    return retval;
  };
}

export function onlyEquations(f: LevelFunction): LevelFunction {
  return (...args) => {
    const retval = f(...args);
    retval.onlyText = false;
    retval.text = [challengeNoText];
    return retval;
  };
}

export function twoDecimalPoints(n: number): string {
  return n.toFixed(2);
}

// plural suffix 's' if n is more than 1
export function s(n: number | string): string {
  return Number(n) > 1 ? 's' : '';
}

// return nth number in the sequence x+1, x+2... excluding multiples of x
export function nthNonMultiple(x: number, n: number): number {
  const generator = nonMultiples(x);
  for (const nonMultiple of generator) {
    if (n === 1) return nonMultiple;
    n -= 1;
  }
  return 0; // this line will never be reached
}

function* nonMultiples(start: number) {
  if (start < 2 || !Number.isInteger(start)) throw new TypeError('nonMultiples only works with integers > 1');
  let x = start + 1;
  while (true) {
    if (x % start !== 0) yield x;
    x += 1;
  }
}
