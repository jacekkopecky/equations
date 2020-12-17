/*
 * 3-variable sets of two equations
 */

import image from '../../../images/cherries.png';
import {
  onlyText,
  onlyEquations,
  twoDecimalPoints,
  s,
} from './tools';
import { AssignmentDefinition, LevelFunction } from '../types';
import Random from '../tools/random';

/*
 * Max buys x1 apples, y1 bananas, and z1 cherries and pays n1,
 * Jamie buys x2 apples, y2 bananas, and z2 cherries and pays n2.
 * Alex buys x3 apples, y3 bananas, and z3 cherries and pays n3.
 * How much do the apples, bananas and cherries cost?
 */
function cherries(
  rng: Random,
  x1: number,
  x2: number,
  x3: number,
  y1: number,
  y2: number,
  y3: number,
  z1: number,
  z2: number,
  z3: number,
  a: number,
  b: number,
  c: number,
): AssignmentDefinition {
  // randomly permute x/y/z
  [[x1, x2, x3], [y1, y2, y3], [z1, z2, z3]] = rng.permute(
    [[x1, x2, x3], [y1, y2, y3], [z1, z2, z3]],
  );

  // randomly permute 1/2/3
  [[x1, y1, z1], [x2, y2, z2], [x3, y3, z3]] = rng.permute(
    [[x1, y1, z1], [x2, y2, z2], [x3, y3, z3]],
  );

  const n1 = twoDecimalPoints(x1 * a + y1 * b + z1 * c);
  const n2 = twoDecimalPoints(x2 * a + y2 * b + z2 * c);
  const n3 = twoDecimalPoints(x3 * a + y3 * b + z3 * c);

  const equations = [
    {
      lhs: [
        { n: x1, var: 'a' },
        { n: y1, var: 'b' },
        { n: z1, var: 'c' },
      ],
      rhs: [
        { n: n1 },
      ],
    },
    {
      lhs: [
        { n: x2, var: 'a' },
        { n: y2, var: 'b' },
        { n: z2, var: 'c' },
      ],
      rhs: [
        { n: n2 },
      ],
    },
    {
      lhs: [
        { n: x3, var: 'a' },
        { n: y3, var: 'b' },
        { n: z3, var: 'c' },
      ],
      rhs: [
        { n: n3 },
      ],
    },
  ];

  const text = [
    `Max bought ${x1} apple${s(x1)}, ${y1} banana${s(y1)}, and ${z1} bag${s(z1)} of cherries and paid ${n1},`,
    `Jamie bought ${x2} apple${s(x2)}, ${y2} banana${s(y2)}, and ${z2} bag${s(z2)} of cherries and paid ${n2}.`,
    `Alex bought ${x3} apple${s(x3)}, ${y3} banana${s(y3)}, and ${z3} bag${s(z3)} of cherries and paid ${n3}.`,
    'How much do the apples (a), bananas (b) and bags of cherries (c) cost?',
    '',
    `(If the price is less than a pound, still enter it as a decimal.
     E.g. a price of 50p would be written as 0.50)`,
  ];

  const solution = {
    a: twoDecimalPoints(a),
    b: twoDecimalPoints(b),
    c: twoDecimalPoints(c),
  };

  return {
    equations,
    text,
    solution,
    image,
  };
}

/* levels
 *
 *
 *   #      ###### #    # ###### #       ####
 *   #      #      #    # #      #      #
 *   #      #####  #    # #####  #       ####
 *   #      #      #    # #      #           #
 *   #      #       #  #  #      #      #    #
 *   ###### ######   ##   ###### ######  ####
 *
 *
 */

function cherries1(rng: Random): AssignmentDefinition {
  // x a + y1 b + z1 c = n1
  // x a + y1 b + z2 c = n2
  // x a + y2 b + z2 c = n3
  // prices in steps of 0.1 up to 1

  const x = rng.int(1, 3);
  const y1 = rng.int(1, 3);
  const y2 = y1 + rng.int(1, 3);
  const z1 = rng.int(1, 3);
  const z2 = z1 + rng.int(1, 3);
  const a = rng.int(1, 10) * 0.1;
  const b = rng.int(1, 10) * 0.1;
  const c = rng.int(1, 10) * 0.1;

  return cherries(rng, x, x, x, y1, y1, y2, z1, z2, z2, a, b, c);
}

function cherries2(rng: Random): AssignmentDefinition {
  // like above, but make third equation with different z
  // x a + y1 b + z1 c = n1
  // x a + y1 b + z2 c = n2
  // x a + y2 b + z3 c = n3
  // prices in steps of 0.1 up to 1

  const x = rng.int(1, 3);
  const y1 = rng.int(1, 3);
  const y2 = y1 + rng.int(1, 3);
  const z1 = rng.int(1, 3);
  const z2 = z1 + rng.int(1, 2);
  const z3 = z2 + rng.int(1, 2);
  const a = rng.int(1, 10) * 0.1;
  const b = rng.int(1, 10) * 0.1;
  const c = rng.int(1, 10) * 0.1;

  return cherries(rng, x, x, x, y1, y1, y2, z1, z2, z3, a, b, c);
}

// cherries2

const levels: LevelFunction[] = [
  cherries1,
  onlyText(cherries1),
  cherries2,
  onlyText(cherries2),
];
export default levels;

export const extras1 = [
  onlyEquations(cherries1),
];
