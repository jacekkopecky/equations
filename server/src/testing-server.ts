import express from 'express';

import { equationsAPI } from './index.js';

import * as dbll from './db-lowlevel';

async function dbInit() {
  const TESTING_CODE = 'a';
  const isKnown = await dbll.checkUserIsKnown(TESTING_CODE);
  if (!isKnown) {
    console.log('initializing data store');
    const info = {
      name: 'Test User',
      score: 0,
      progressTowardsNextLevel: 0,
      level: 1,
      lastDone: 0,
    };

    const state = {
      info,
      assignments: [],
    };

    await dbll.saveUserState(TESTING_CODE, state);
    console.log('data store initialized');
  } else {
    console.log('data store ready');
  }
}

async function init() {
  await dbInit();

  const app = express();

  if (process.env.DELAY) {
    const delay = parseInt(process.env.DELAY) || 0;
    console.log('using request delay', delay);
    app.use((req, res, next) => { setTimeout(next, delay); });
  }

  app.use(equationsAPI);

  const port = Number(process.env.PORT) || 8082;
  app.listen(port, () => {
    console.log(`started on port ${port}`);
  });
}

init().catch(console.error);
