/*
 * Wrapper for the server API:
 * - load user information: name, progress, score, level, last page of finished assignments
 * - save finished assignment (no overwrite)
 * - retrieve done assignments
 */

import { UserInfo } from '../types';

export async function loadUserInformation(code: string): Promise<UserInfo> {
  await new Promise((resolve) => { setTimeout(resolve, 1000); });
  return {
    name: code,
    score: 0,
    progress: 0,
    level: 1,
    lastAssignments: [],
  };
}
