import { InternalState, DEFAULT_INTERNAL_STATE } from '../AppState';
import { Assignment, UserInfo } from '../types';

// unverified InternalState
interface UnverifiedAssignment {
  created?: number,
  startTime: number,
}

interface UnverifiedState {
  level?: number, // from previous version of state
  userInfo?: UserInfo,
  assignments?: Array<Assignment>,
  userCode?: string,
}

export default function migrateState(obj: unknown): InternalState {
  const data = isUnverifiedState(obj) ? obj : {};

  // todo we could also verify the structure of assignments
  const assignments = Array.isArray(data.assignments) ? data.assignments : [];
  const userInfo = data.userInfo ?? DEFAULT_INTERNAL_STATE.userInfo;
  const userCode = typeof data.userCode === 'string' ? data.userCode : undefined;

  for (const a of assignments) {
    if (a != null) migrateCreatedToStartTime(a);
  }

  return {
    assignments,
    userInfo,
    userCode,
  };
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
