/*
 * Wrapper for the server API:
 * - load user information: name, progress, score, level, last page of finished assignments
 * - save finished assignment (no overwrite)
 * - retrieve done assignments
 */

import { Assignment } from '../types';

export interface UserInfo {
  name?: string,
  progress: number,
  score: number,
  level: number,
  lastAssignments: Assignment[],
}

export async function loadUserInformation(code: string): Promise<UserInfo> {
  await new Promise((resolve) => { setTimeout(resolve, 1000); });
  return {
    name: code,
    progress: 0,
    score: 0,
    level: 0,
    lastAssignments: [],
  };
}
