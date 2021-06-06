/*
 * Wrapper for the server API:
 * - load user information: name, progress, score, level, last page of finished assignments
 * - save finished assignment (no overwrite)
 * - retrieve done assignments
 */

import { Assignment, UserInfo } from '../types';

import config from '../../../server-config.json';

export class Forbidden extends Error {
  constructor() {
    super('user not allowed');
  }
}

export async function loadUserInformation(code: string): Promise<UserInfo> {
  const url = userUrl(code);
  const response = await fetch(url);
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

export async function saveAssignment(code: string, assignment: Assignment): Promise<void> {
  console.log('saving assignment', assignment.n);

  const url = assignmentsUrl(code);
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(assignment),
    headers: {
      'Content-type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Forbidden();
    } else {
      console.error(response);
      throw new Error('unknown error loading user information');
    }
  }
}

function userUrl(code: string): string {
  return `${config.apiUrl}/users/${encodeURIComponent(code)}`;
}

function assignmentsUrl(code: string): string {
  return `${userUrl(code)}/assignments`;
}
