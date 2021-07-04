import express from 'express';

import { bookListAPI } from './index.js';

const app = express();

if (process.env.DELAY) {
  const delay = parseInt(process.env.DELAY) || 0;
  app.use((req, res, next) => { setTimeout(next, delay); });
}

app.use(bookListAPI);

const port = Number(process.env.PORT) || 8082;
app.listen(port, () => {
  console.log(`started on port ${port}`);
});
