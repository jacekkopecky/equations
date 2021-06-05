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
  readonly equations: Equation[],
  readonly solution: Solutions,

  readonly image: string,

  onlyText?: boolean,
  text?: string[],
}

export interface AssignmentInformation {
  readonly level: number,
  readonly n: number,
  readonly challenge: boolean,

  answeredCorrectly: boolean,
  done: boolean,
}

interface AssignmentStats {
  readonly startTime: number,
  doneTime?: number,

  attemptCount?: number,
  interactionPauses?: number[],

  attemptText?: string,
  attemptAnswers?: Solutions[],
}

export type Assignment =
  & AssignmentDefinition
  & AssignmentInformation
  & AssignmentStats;

export interface Saveable {
  assignment: Assignment,
  save: () => void,
}

export interface UserInfo {
  name?: string,
  score: number,
  progress: number,
  level: number,
  lastAssignments: AssignmentInformation[],
}

export type LevelFunction = (rng: Random) => AssignmentDefinition;

export enum ActivityType {
  offline = 'offline',
  loggingIn = 'loggingIn',
  synced = 'synced',
  loading = 'loading',
  saving = 'saving',
  error = 'error',
}

export const ActivityWorking: ActivityType[] = [
  ActivityType.loggingIn,
];

export interface ActivityStatus {
  status: ActivityType,
  message?: string,
}
