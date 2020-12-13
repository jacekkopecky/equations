import applesAndBananas, * as ab from './apples-and-bananas';
import cherries, * as c from './cherries';

const levels = [
  null, // no level 0
  ...applesAndBananas,
  ...cherries,
  ...ab.extras1,
  ...c.extras1,
];

export default levels;
