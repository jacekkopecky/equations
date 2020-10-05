import image from '../../../images/apples-and-bananas.png';

/*
 * Max buys x1 apples and y1 bananas and pays n1,
 * Jamie buys x2 apples and y2 bananas and pays n2.
 * How much do the apples and bananas cost?
 */
function applesAndBananas(rng, x1, x2, y1, y2, a, b) {
  // randomly switch x/y
  if (rng.bool()) [x1, x2, y1, y2] = [y1, y2, x1, x2];

  // randomly switch 1/2
  if (rng.bool()) [x1, x2, y1, y2] = [x2, x1, y2, y1];

  const n1 = twoDecimalPoints(x1 * a + y1 * b);
  const n2 = twoDecimalPoints(x2 * a + y2 * b);

  const equations = [
    {
      lhs: [
        { n: x1, var: 'a' },
        { n: y1, var: 'b' },
      ],
      rhs: [
        { n: n1 },
      ],
    },
    {
      lhs: [
        { n: x2, var: 'a' },
        { n: y2, var: 'b' },
      ],
      rhs: [
        { n: n2 },
      ],
    },
  ];

  const text = [
    `Max bought ${x1} apple${s(x1)} and ${y1} banana${s(y1)} and paid ${n1},`,
    `Jamie bought ${x2} apple${s(x2)} and ${y2} banana${s(y2)} and paid ${n2}.`,
    'How much do the apples and bananas cost?',
    '',
    `(If the price is less than a pound, still enter it as a decimal.
     E.g. a price of 50p would be written as 0.50)`,
  ];

  const solution = {
    a: twoDecimalPoints(a),
    b: twoDecimalPoints(b),
  };

  return {
    equations,
    text,
    solution,
    image,
  };
}

// plural suffix 's' if n is more than 1
function s(n) {
  return n > 1 ? 's' : '';
}

function twoDecimalPoints(n) {
  return n.toFixed(2);
}

function onlyText(f) {
  return (...args) => {
    const retval = f(...args);
    retval.onlyText = true;
    retval.text.push('', 'Part of the challenge is to write the first two equations.');
    return retval;
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

function applesAndBananas1(rng) {
  // x a + y1 b = n1
  // x a + y2 b = n2
  // prices in steps of 0.1 up to 1

  // show 1*a as "1a", not as "a"

  const x = rng.int(1, 3);
  const y1 = rng.int(1, 3);
  const y2 = y1 + rng.int(1, 3);
  const a = rng.int(1, 10) * 0.1;
  const b = rng.int(1, 10) * 0.1;

  return applesAndBananas(rng, String(x), String(x), String(y1), String(y2), a, b);
}

function applesAndBananas2(rng) {
  // pick random small x2
  // pick x1 a small multiple of x2
  // pick random small y2
  // make y1 a bit greater than same multiple of y2
  // choose a,b between 0.1 and 1 in steps of 0.1
  // randomly switch x/y, 1/2

  // show "1*a" as "a" from now on

  const x2 = rng.int(1, 3);
  const multiple = rng.int(2, 3);
  const x1 = x2 * multiple;
  const y2 = rng.int(1, 3);
  const y1 = y2 * multiple + rng.int(1, 3);
  const a = rng.int(1, 10) * 0.1;
  const b = rng.int(1, 10) * 0.1;

  return applesAndBananas(rng, x1, x2, y1, y2, a, b);
}

function applesAndBananas3(rng) {
  // like the above but with prices between 0.05 and 1.1 in steps of 0.05

  const x2 = rng.int(1, 3);
  const multiple = rng.int(2, 3);
  const x1 = x2 * multiple;
  const y2 = rng.int(1, 3);
  const y1 = y2 * multiple + rng.int(1, 3);
  const a = rng.int(1, 22) * 0.05;
  const b = rng.int(1, 22) * 0.05;

  return applesAndBananas(rng, x1, x2, y1, y2, a, b);
}

function applesAndBananas4(rng) {
  // Like 2 but
  //
  // - x1 not divisible by x2; x1 and x2 have a low multiple M
  // - y1*M/x1 > y2*M/x2

  const x2 = rng.int(2, 4);
  const x1 = nthNonMultiple(x2, rng.int(1, 3));
  const y2 = rng.int(1, 3);
  const y1 = Math.floor(y2 / x2 * x1) + rng.int(1, 3);
  const a = rng.int(1, 11) * 0.1;
  const b = rng.int(1, 11) * 0.1;

  return applesAndBananas(rng, x1, x2, y1, y2, a, b);
}

// return nth number in the sequence x+1, x+2... excluding multiples of x
function nthNonMultiple(x, n) {
  const generator = nonMultiples(x);
  for (const nonMultiple of generator) {
    if (n === 1) return nonMultiple;
    n -= 1;
  }
  return null; // this line will never be reached
}

function* nonMultiples(start) {
  if (start < 2 || !Number.isInteger(start)) throw new TypeError('nonMultiples only works with integers > 1');
  let x = start + 1;
  while (true) {
    if (x % start !== 0) yield x;
    x += 1;
  }
}

// 5: where subtracting one from the other leads to a negative?
function applesAndBananas5(rng) {
  // simply x1 > x2, y1 < y2, with prices in 5p increments

  const x2 = rng.int(1, 3);
  const x1 = x2 + rng.int(1, 3);
  const y1 = rng.int(1, 3);
  const y2 = y1 + rng.int(1, 3);
  const a = rng.int(1, 22) * 0.05;
  const b = rng.int(1, 22) * 0.05;

  return applesAndBananas(rng, x1, x2, y1, y2, a, b);
}

export default [
  applesAndBananas1,
  onlyText(applesAndBananas1),
  applesAndBananas2,
  onlyText(applesAndBananas2),
  applesAndBananas3,
  onlyText(applesAndBananas3),
  applesAndBananas4,
  onlyText(applesAndBananas4),
  applesAndBananas5,
  onlyText(applesAndBananas5),
];
