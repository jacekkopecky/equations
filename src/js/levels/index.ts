import applesAndBananas, * as ab from './apples-and-bananas';
import cherries, * as c from './cherries';

import { AssignmentDefinition, LevelFunction } from '../types';
import Random from '../tools/random';

const levelsArray: Array<LevelFunction> = [
  ...applesAndBananas,
  ...cherries,
  ...ab.extras1,
  ...c.extras1,
];

export const topLevel = levelsArray.length;

export function make(level: number, n: number): AssignmentDefinition {
  const levelFunction = levelsArray[level - 1];
  if (levelFunction == null) throw new TypeError('level does not exist');

  const rng = new Random(`${level}/${n}`);
  return levelFunction(rng);
}
