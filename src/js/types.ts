import Random from './tools/random';

export interface EquationPart {
  n: number | string,
  var?: string,
}

export type EquationParts = ReadonlyArray<EquationPart>;

export interface Equation {
  lhs: EquationParts,
  rhs: EquationParts,
}

export interface Solutions {
  [index: string]: number | string,
}

export type AnswersMap = Map<string, number>;

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

  answeredCorrectly: boolean,
  done: boolean,
}

export interface Assignment extends AssignmentDescription, AssignmentInformation {
  save: () => void,
  startTime: number,
  doneTime?: number,
}

export type LevelFunction = (rng: Random) => AssignmentDescription;
