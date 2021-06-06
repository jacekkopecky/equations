const express = require('express');
const cors = require('cors');

const api = require('./api');

const app = express();

app.use(cors());

// "A man is not dead while his name is still spoken."
// - Going Postal, Chapter 4 prologue
app.use((req, res, next) => {
  res.set('X-Clacks-Overhead', 'GNU Terry Pratchett');
  next();
});

app.get('/', (req, res) => { res.send('function running'); });

app.use('/api', api);

exports.bookListAPI = app;

if (process.env.TESTING && require.main === module) {
  const port = Number(process.env.PORT) || 8082;
  app.listen(port, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`started on port ${port}`);
    }
  });
}
