import express, {
  Request,
  Response,
  NextFunction,
} from 'express';

import * as db from './db';

import { Assignment } from '../../src/js/shared-with-server/types';

const api = express.Router();
export default api;

// authorization
api.use('/users/:code', asyncWrap(checkUserExists));

api.post('/users/:code/sign-in', signIn);
api.get('/users/:code', asyncWrap(retrieveUserInfo));
api.get('/users/:code/assignments', asyncWrap(retrieveAssignments));
api.post('/users/:code/assignments', express.json(), asyncWrap(saveAssignment));

// authorization: unknown users get 403
async function checkUserExists(req: Request, res: Response, next: NextFunction) {
  const user = req.params.code;
  if (await db.checkUserIsKnown(user)) {
    next();
  } else {
    console.warn(`user check failed: "${user}"`);
    res.sendStatus(403);
  }
}

type AsyncHandler = (r: Request, s: Response, n: NextFunction) => Promise<void>;

// wrap async function for express.js error handling
function asyncWrap(f: AsyncHandler): express.Handler {
  return (req, res, next) => {
    Promise.resolve(f(req, res, next))
      .catch((e) => next(e || new Error()));
  };
}

/*
 * `POST` on `/users/:code/sign-in` – check that user exists
 * `GET` on `/users/:code` – retrieve UserInfo
 * `GET` on `/users/:code/assignments` – retrieve Assignment[]
 * `POST` on `/users/:code/assignments` – save an Assignment
 */
function signIn(req: Request, res: Response) {
  // checkUserExists already checked the login
  res.sendStatus(204);
}

async function retrieveUserInfo(req: Request, res: Response) {
  const user = req.params.code;
  res.json(await db.getUserState(user));
}

async function retrieveAssignments(req: Request, res: Response) {
  const user = req.params.code;
  res.json(await db.getAssignments(user));
}

async function saveAssignment(req: Request, res: Response) {
  const user = req.params.code;
  const validatedAssignment = validateAssignment(req.body);
  if (!validatedAssignment) {
    res.sendStatus(400);
    return;
  }

  try {
    const newProgress = await db.saveAssignment(user, validatedAssignment);
    res.json(newProgress);
  } catch (e) {
    console.error(e);
    // DB saving failed, probably conflict
    res.sendStatus(409);
  }
}

// validation functions

function validateAssignment(assignment: Partial<Assignment>): Assignment | false {
  if (!assignment ||
    typeof assignment !== 'object' ||
    Array.isArray(assignment) ||
    !Number.isInteger(assignment.n) ||
    !Number.isInteger(assignment.level) ||
    assignment.done !== true
  ) {
    return false;
  }

  // todo use a comprehensive verification of Assignment structure?

  return assignment as Assignment;
}
