/*
 * tools for building levels
 */

export const challengeNoText = 'Part of this challenge is that there is no explanatory text.';

export function onlyText(f) {
  return (...args) => {
    const retval = f(...args);
    retval.onlyText = true;
    retval.text.push('', 'Part of the challenge is to write the first two equations.');
    return retval;
  };
}

export function onlyEquations(f) {
  return (...args) => {
    const retval = f(...args);
    retval.onlyText = false;
    retval.text = [challengeNoText];
    return retval;
  };
}
