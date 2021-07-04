import express from 'express';
import cors from 'cors';

import api from './api';

const app = express();
export { app as bookListAPI };

app.use(cors());

// "A man is not dead while his name is still spoken."
// - Going Postal, Chapter 4 prologue
app.use((req, res, next) => {
  res.set('X-Clacks-Overhead', 'GNU Terry Pratchett');
  next();
});

app.get('/', (req, res) => { res.send('function running'); });

if (process.env.TESTING && process.env.DELAY) {
  const delay = parseInt(process.env.DELAY) || 0;
  app.use((req, res, next) => { setTimeout(next, delay); });
}

app.use('/api', api);
