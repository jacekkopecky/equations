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

export interface AssignmentDefinition {
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

interface AssignmentStats {
  startTime: number,
  doneTime?: number,

  attemptCount?: number,
  interactionPauses?: number[],

  attemptText?: string,
  attemptAnswers?: Solutions[],
}

export interface Assignment extends
  AssignmentDefinition,
  AssignmentInformation,
  AssignmentStats {}

export interface Saveable {
  save: () => void,
}

export type LevelFunction = (rng: Random) => AssignmentDefinition;

export enum ActivityStatusType {
  offline = 'offline',
  loggingIn = 'loggingIn',
  synced = 'synced',
  loading = 'loading',
  saving = 'saving',
  error = 'error',
}

export interface ActivityStatus {
  status: ActivityStatusType,
  message?: string,
}
