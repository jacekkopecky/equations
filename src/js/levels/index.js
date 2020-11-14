import applesAndBananas from './apples-and-bananas';
import cherries from './cherries';

const levels = [
  null, // no level 0
  ...applesAndBananas,
  ...cherries,
];

export default levels;
