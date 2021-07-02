import { bookListAPI } from './index.js';

if (process.env.TESTING) {
  const port = Number(process.env.PORT) || 8082;
  bookListAPI.listen(port, () => {
    console.log(`started on port ${port}`);
  });
}
