import Random from './tools/random';

export interface AssignmentDescription {
  equations: any,
  solution: any,

  onlyText?: boolean,
  text?: string[],
  image?: string,
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
  save?: () => void,
}

export type LevelFunction = (rng: Random) => AssignmentDescription;
