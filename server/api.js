const express = require('express');

const db = require('./db');

const api = express.Router();
module.exports = api;

// authorization
api.use('/users/:code', asyncWrap(checkUserExists));

api.get('/users/:code', asyncWrap(retrieveUserInfo));
api.get('/users/:code/assignments', asyncWrap(retrieveAssignments));
api.post('/users/:code/assignments', express.json(), asyncWrap(saveAssignment));

// authorization: unknown users get 403
async function checkUserExists(req, res, next) {
  const user = req.params.code;
  if (await db.checkUserIsKnown(user)) {
    next();
  } else {
    res.sendStatus(403);
  }
}

// wrap async function for express.js error handling
function asyncWrap(f) {
  return (req, res, next) => {
    Promise.resolve(f(req, res, next))
      .catch((e) => next(e || new Error()));
  };
}

/*
 * `GET` on `/users/:code` – retrieve UserInfo
 * `GET` on `/users/:code/assignments` – retrieve Assignment[]
 * `POST` on `/users/:code/assignments` – save an Assignment
 */

async function retrieveUserInfo(req, res) {
  const user = req.params.code;
  res.json(await db.getUserInfo(user));
}

async function retrieveAssignments(req, res) {
  const user = req.params.code;
  res.json(await db.getAssignments(user));
}

async function saveAssignment(req, res) {
  const user = req.params.code;
  const validatedAssignment = validateAssignment(req.body);
  if (!validatedAssignment) {
    res.sendStatus(400);
    return;
  }

  const saved = await db.saveAssignment(user, validatedAssignment);
  if (saved) {
    res.sendStatus(204);
  } else {
    res.sendStatus(409);
  }
}

// validation functions

function validateAssignment(assignment) {
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

  return assignment;
}
