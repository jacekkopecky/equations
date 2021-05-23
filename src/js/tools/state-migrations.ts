import { InternalState } from '../AppState';

// unverified InternalState

interface UnverifiedAssignment {
  created?: number,
  startTime: number,
}

interface UnverifiedState {
  level?: number,
  assignments?: Array<UnverifiedAssignment>,
  userCode?: string,
}

export default function migrateState(obj: unknown): InternalState {
  const data = isUnverifiedState(obj) ? obj : {};

  if (data.assignments == null) data.assignments = [];
  if (typeof data.level !== 'number') data.level = 1;
  if (typeof data.userCode !== 'string') delete data.userCode;

  // assignments[0] is to be ignored
  for (let i = 1; i < data.assignments.length; i += 1) {
    const a = data.assignments[i];
    if (a != null) migrateCreatedToStartTime(a);
  }
  // todo we could also verify the structure of assignments
  return data as InternalState;
}

function isUnverifiedState(obj: unknown): obj is UnverifiedState {
  return obj != null && typeof obj === 'object' && !Array.isArray(obj);
}

function migrateCreatedToStartTime(a: UnverifiedAssignment) {
  if (a.created != null) {
    a.startTime = a.created;
    delete a.created;
  }
}
