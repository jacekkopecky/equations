/*
 * Wrapper for the server API:
 * - load user information: name, progress, score, level, last page of finished assignments
 * - save finished assignment (no overwrite)
 * - retrieve done assignments
 */

import { Assignment, UserState, UserInfo } from '../types';

import config from '../../../server-config.json';

export class Forbidden extends Error {
  constructor() {
    super('user not allowed');
  }
}

export async function loadUserState(code: string): Promise<UserState> {
  const url = userUrl(code);
  const response = await fetch(url);
  if (response.ok) {
    const data = await response.json() as UserState;

    // reindex lastAssignments so their `n` matches their index
    const lastAssignments = data.lastAssignments;
    data.lastAssignments = [];
    for (const assignment of lastAssignments) {
      data.lastAssignments[assignment.n] = assignment;
    }

    return data;
  } else if (response.status === 403) {
    throw new Forbidden();
  } else {
    console.error(response);
    throw new Error('unknown error loading user information');
  }
}

export async function loadDoneAssignments(code: string): Promise<Assignment[]> {
  const url = assignmentsUrl(code);
  const response = await fetch(url);
  if (response.ok) {
    const data = await response.json() as [];
    return data;
  } else if (response.status === 403) {
    throw new Forbidden();
  } else {
    console.error(response);
    throw new Error('unknown error loading user information');
  }
}

export async function saveAssignment(code: string, assignment: Assignment): Promise<UserInfo> {
  console.log('saving assignment', assignment.n);

  const url = assignmentsUrl(code);
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(assignment),
    headers: {
      'Content-type': 'application/json',
    },
  });

  if (response.ok) {
    const data = await response.json() as UserInfo;
    return data;
  } else if (response.status === 403) {
    throw new Forbidden();
  } else {
    console.error(response);
    throw new Error('unknown error loading user information');
  }
}

function userUrl(code: string): string {
  return `${config.apiUrl}/users/${encodeURIComponent(code)}`;
}

function assignmentsUrl(code: string): string {
  return `${userUrl(code)}/assignments`;
}
