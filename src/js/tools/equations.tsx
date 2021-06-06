import * as React from 'react';

import * as t from '../types';

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
export function checkAnswers(equations: t.Equation[], answers: t.AnswersMap): boolean {
  // call with a single equation or an array of them
  if (!Array.isArray(equations)) equations = [equations];

  for (const eq of equations) {
    if (round8(evaluateAdditions(eq.lhs, answers)) !== round8(evaluateAdditions(eq.rhs, answers))) {
      return false; // we found an equation that isn't satisfied
    }
  }

  return true;
}

export function areAllVariablesAnswered(
  equations: t.Equation | t.Equation[],
  answers: t.AnswersMap,
): boolean {
  const usedVariables = extractVariables(equations);

  // check all variables in equations are answered
  for (const name of usedVariables) {
    if (typeof answers.get(name) !== 'number') return false; // null means answers incomplete
  }

  return true;
}

function evaluateAdditions(parts: t.EquationParts, answers: t.AnswersMap) {
  let sum = 0;
  for (const part of parts) {
    sum += evaluatePart(part, answers);
  }
  return sum;
}

function evaluatePart(part: t.EquationPart, answers: t.AnswersMap) {
  const n = Number(part.n);
  return part.var ? n * (answers.get(part.var) ?? NaN) : n;
}

export function extractVariables(equations: t.Equation | t.Equation[]): Set<string> {
  // call with a single equation or an array of them
  if (!Array.isArray(equations)) equations = [equations];

  const vars = new Set<string>();

  for (const eq of equations) {
    for (const additions of [...eq.lhs, ...eq.rhs]) {
      if (additions.var) vars.add(additions.var);
    }
  }

  return vars;
}

export function formatEquation(e: t.Equation, n: number, onlyText?: false): JSX.Element;
export function formatEquation(e: t.Equation, n: number, onlyText: true): string;
export function formatEquation(e: t.Equation, n: number, onlyText?: boolean): JSX.Element | string {
  const text = `${formatAddition(e.lhs)}\u00a0=\u00a0${formatAddition(e.rhs)} (${n})`;
  return onlyText
    ? text
    : (
      <span className="equation">
        { text }
      </span>
    );
}

function formatAddition(arr: t.EquationParts) {
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
function abs(n: number | string) {
  if (typeof n === 'number') return Math.abs(n);

  const str = String(n);
  if (str.startsWith('-')) {
    return str.substring(1);
  } else {
    return str;
  }
}

// return a string representing the number with precision up to 8 digits
function round8(n: string | number) {
  // expect strings to be pre-formatted
  if (typeof n === 'string') return n;

  let retval = n.toFixed(8);
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
export function formatEquationsText(text: string | string[]): JSX.Element {
  if (!Array.isArray(text)) text = [text];

  return (
    <div className="equations-text">
      { text.map(formatTextLine) }
    </div>
  );
}

function formatTextLine(line: string, i: number) {
  // using index for react.js key because there's nothing better
  if (line) {
    return <div key={i.toString()}>{ line }</div>;
  } else {
    return <br key={i.toString()} />;
  }
}

const NEAR_ZERO = 1e-10;

class EquationMatrix {
  private rows: Array<Array<number>>;

  constructor(n: number) {
    this.rows = new Array<Array<number>>(n);
    for (let i = 0; i < n; i += 1) {
      this.rows[i] = new Array<number>(n + 1).fill(0);
    }
  }

  static fromEquations(eqs: t.Equation[], varOrder: string[]) {
    const retval = new EquationMatrix(varOrder.length);
    for (let i = 0; i < eqs.length; i += 1) {
      const equation = eqs[i];
      for (const part of equation.lhs) {
        addPart(i, part);
      }
      for (const part of equation.rhs) {
        addPart(i, {
          var: part.var,
          n: -part.n,
        });
      }
    }
    return retval;

    function addPart(row: number, part: t.EquationPart) {
      if (part.var) {
        const varIndex = varOrder.indexOf(part.var);
        if (varIndex === -1) throw new TypeError(`variable ${part.var} not in varOrder`);

        retval.add(row, varIndex, Number(part.n));
      } else {
        // constant part, not variable
        // adding negative because constants on LHS are like negative constants on RHS
        retval.add(row, varOrder.length, -Number(part.n));
      }
    }
  }

  ensureDiagonalNonZero(i: number) {
    // return true if we found non-zero, false otherwise

    if (Math.abs(this.rows[i][i]) > NEAR_ZERO) return true;

    const nonZeroRow = this.rows.findIndex((row, j) => j > i && Math.abs(row[i]) > NEAR_ZERO);

    if (nonZeroRow === -1) return false; // no such row found

    // swap the rows
    [this.rows[i], this.rows[nonZeroRow]] = [this.rows[nonZeroRow], this.rows[i]];
    return true;
  }

  get(row: number, col: number) {
    return this.rows[row][col];
  }

  set(row: number, col: number, val: number) {
    this.rows[row][col] = val;
  }

  add(row: number, col: number, val: number) {
    this.rows[row][col] += val;
  }

  get length() {
    return this.rows.length;
  }

  multiplyRow(n: number, s: number) {
    const row = this.rows[n];
    for (let i = 0; i < row.length; i += 1) {
      row[i] *= s;
    }
  }

  addMultipleOfRow(target: number, other: number, multiplier: number) {
    const targetRow = this.rows[target];
    const otherRow = this.rows[other];
    for (let i = 0; i < targetRow.length; i += 1) {
      targetRow[i] += multiplier * otherRow[i];
    }
  }

  getColumn(n: number) {
    return this.rows.map((row) => row[n]);
  }
}

// use Gaussian elimination to solve the given equations
// returns a map from variable to value
export function solve(equations: t.Equation[]): Map<string, number> | null {
  const vars = Array.from(extractVariables(equations));

  // matrix is an array of rows, each row an array of numbers
  // for n variables the matrix size is n+1 x n
  // each row represents the variables in order and the constant they need to equal
  // in other words, the equal sign if between column n and n+1
  const m = EquationMatrix.fromEquations(equations, vars);

  // for each column, put 1 in the diagonal and zeros below
  for (let i = 0; i < m.length; i += 1) {
    // if we cannot find a non-zero for the diagonal, there is no solution
    if (!m.ensureDiagonalNonZero(i)) return null;

    // reduce diagonal to 1
    m.multiplyRow(i, 1 / m.get(i, i));
    m.set(i, i, 1); // ensure 1 in face of unexact computation

    // remove non-zeros under diagonal
    for (let j = i + 1; j < m.length; j += 1) {
      m.addMultipleOfRow(j, i, -m.get(j, i));
    }
  }

  // propagate solutions from lower rows upwards
  for (let i = m.length - 1; i > 0; i -= 1) {
    for (let j = i - 1; j >= 0; j -= 1) {
      m.addMultipleOfRow(j, i, -m.get(j, i));
    }
  }

  const solutions = m.getColumn(vars.length);
  const retval = new Map();

  // extract variable bindings, rounded to step around inaccurate arithmetic
  for (let i = 0; i < vars.length; i += 1) {
    retval.set(vars[i], round8(solutions[i]));
  }

  return retval;
}
