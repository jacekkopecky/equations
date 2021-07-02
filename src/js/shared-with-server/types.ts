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
  startTime: number,
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

export const PROGRESS_PER_LEVEL = 5;
export const MAX_LAST_SAVED_ASSIGNMENTS = 100;

export interface UserInfo {
  name?: string,
  score: number,
  lastDone: number,
  progressTowardsNextLevel: number,
  level: number,
}

// lastAssignments contains at least the last batch,
// and at least all last-day's assignments, to support all but the stats page
export interface UserState extends UserInfo {
  lastAssignments: Assignment[],
}

export enum ActivityType {
  starting = 'start',
  offline = 'offline',
  loggingIn = 'loggingIn',
  synced = 'synced',
  loading = 'loading',
  saving = 'saving',
  error = 'error',
}

export const ActivityWorking: ActivityType[] = [
  ActivityType.loggingIn,
  ActivityType.starting,
];

export class ActivityStatus {
  public status: ActivityType;
  public message: string;

  constructor(status: ActivityType, message = '') {
    this.status = status;
    this.message = message;
  }

  isWorking(): boolean {
    return ActivityWorking.includes(this.status);
  }
}
