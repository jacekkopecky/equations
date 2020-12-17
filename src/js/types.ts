import Random from './tools/random';

interface EquationPart {
  n: number | string,
  var?: string,
}

interface Equation {
  lhs: ReadonlyArray<EquationPart>,
  rhs: ReadonlyArray<EquationPart>,
}

interface Solutions {
  [index: string]: number | string,
}

export interface AssignmentDescription {
  equations: Equation[],
  solution: Solutions,

  onlyText?: boolean,
  text?: string[],
  image: string,
}

export interface AssignmentInformation {
  level: number,
  n: number,
  challenge: boolean,

  startTime?: number,
  answeredCorrectly: boolean,
  done: boolean,
}

export interface Assignment extends AssignmentDescription, AssignmentInformation {
  save: () => void,
}

export type LevelFunction = (rng: Random) => AssignmentDescription;
