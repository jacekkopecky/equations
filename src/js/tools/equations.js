import React from 'react';

/*
 * The structure of an assignment - a set of equations - is like this:
 *
 * {
 *   equations: [
 *     {
 *       lhs: [
 *         { n: x1, var: 'a' },
 *         { n: y1, var: 'b' },
 *       ],
 *       rhs: [
 *         { n: n1 },
 *       ],
 *     },
 *     {
 *       lhs: [
 *         { n: x2, var: 'a' },
 *         { n: y2, var: 'b' },
 *       ],
 *       rhs: [
 *         { n: n2 },
 *       ],
 *     },
 *   ],
 *   solution: {
 *     a: number,
 *     b: number,
 *   },
 *   text: [ strings ],
 *   image: string,
 * };
 */

// equations is an array of equations, or a single equation
// answers is a Map from variable name to numerical value
export function checkAnswers(equations, answers) {
  // call with a single equation or an array of them
  if (!Array.isArray(equations)) equations = [equations];

  for (const eq of equations) {
    if (round8(evaluateAdditions(eq.lhs, answers)) !== round8(evaluateAdditions(eq.rhs, answers))) {
      return false; // we found an equation that isn't satisfied
    }
  }

  return true;
}

export function areAllVariablesAnswered(equations, answers) {
  // call with a single equation or an array of them
  if (!Array.isArray(equations)) equations = [equations];

  const usedVariables = extractVariables(equations);

  // check all variables in equations are answered
  for (const name of usedVariables) {
    if (typeof answers.get(name) !== 'number') return false; // null means answers incomplete
  }

  return true;
}

function evaluateAdditions(parts, answers) {
  let sum = 0;
  for (const part of parts) {
    sum += evaluatePart(part, answers);
  }
  return sum;
}

function evaluatePart(part, answers) {
  const n = Number(part.n);

  return part.var ? n * answers.get(part.var) : n;
}

export function extractVariables(equations) {
  // call with a single equation or an array of them
  if (!Array.isArray(equations)) equations = [equations];

  const vars = new Set();

  for (const eq of equations) {
    for (const additions of [...eq.lhs, ...eq.rhs]) {
      if (additions.var) vars.add(additions.var);
    }
  }

  return vars;
}

export function formatEquation(e, n) {
  return (
    <span className="equation">
      { formatAddition(e.lhs) }
      &nbsp;=&nbsp;
      { formatAddition(e.rhs) }
      { ` (${n})` }
    </span>
  );
}

function formatAddition(arr) {
  const partStrings = [];
  for (const part of arr) {
    partStrings.push(Number(part.n) < 0 ? '-' : '+');
    if (abs(part.n) !== 1) partStrings.push(round8(abs(part.n)));
    if (part.var) partStrings.push(part.var);
  }

  // remove initial plus
  if (partStrings[0] === '+') partStrings.shift();

  return partStrings.join(' ');
}

// return the absolute number, given possibly a string (just strip the leading -)
function abs(n) {
  if (typeof n === 'number') return Math.abs(n);

  const str = String(n);
  if (str.startsWith('-')) {
    return str.substring(1);
  } else {
    return str;
  }
}

// return a string representing the number with precision up to 8 digits
function round8(n) {
  // expect strings to be pre-formatted
  if (typeof n === 'string') return n;

  let retval = Number.parseFloat(n).toFixed(8);
  // trim trailing zeros
  while (retval.endsWith('0')) {
    retval = retval.substring(0, retval.length - 1);
  }
  // trim trailing period
  if (retval.endsWith('.')) {
    retval = retval.substring(0, retval.length - 1);
  }
  return retval;
}

// takes a string, or an array of strings to be displayed on separate lines
// empty string shows as an empty line
export function formatEquationsText(text) {
  if (!Array.isArray(text)) text = [text];

  return (
    <div className="equations-text">
      { text.map(formatTextLine) }
    </div>
  );
}

function formatTextLine(line, i) {
  // using index for react.js key because there's nothing better
  if (line) {
    return <div key={i.toString()}>{ line }</div>;
  } else {
    return <br key={i.toString()} />;
  }
}
