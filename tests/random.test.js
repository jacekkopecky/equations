import Random from '../src/js/tools/random';

test('constructor', () => {
  expect(() => new Random()).not.toThrow();
});

describe('int', () => {
  test('same seed', () => {
    const rng1 = new Random('foo');
    const rng2 = new Random('foo');
    const rng3 = new Random('foo');

    expect(rng1.int(1, 10)).toBe(5);
    expect(rng1.int(1, 10)).toBe(8);
    expect(rng1.int(1, 10)).toBe(2);

    expect(rng2.int(1, 100)).toBe(47);
    expect(rng2.int(1, 10)).toBe(8);
    expect(rng2.int(1, 10)).toBe(2);

    // one less than rng1
    expect(rng3.int(0, 9)).toBe(4);
    expect(rng3.int(0, 9)).toBe(7);
    expect(rng3.int(0, 9)).toBe(1);
  });

  test('different seeds', () => {
    const rng1 = new Random('foo');
    const rng2 = new Random('bar');

    expect(rng1.int(1, 10)).toBe(5);
    expect(rng1.int(1, 10)).toBe(8);
    expect(rng1.int(1, 10)).toBe(2);

    expect(rng2.int(1, 10)).toBe(4);
    expect(rng2.int(1, 10)).toBe(8);
    expect(rng2.int(1, 10)).toBe(7);
  });
});

describe('bool', () => {
  test('same seed', () => {
    const rng1 = new Random('foo');
    const rng2 = new Random('foo');

    expect(rng1.bool()).toBe(true);
    expect(rng1.bool()).toBe(false);
    expect(rng1.bool()).toBe(true);
    expect(rng1.bool()).toBe(false);
    expect(rng1.bool()).toBe(false);
    expect(rng1.bool()).toBe(false);
    expect(rng1.bool()).toBe(false);
    expect(rng1.bool()).toBe(false);
    expect(rng1.bool()).toBe(false);
    expect(rng1.bool()).toBe(false);
    expect(rng1.bool()).toBe(false);
    expect(rng1.bool()).toBe(true);

    expect(rng2.bool()).toBe(true);
    expect(rng2.bool()).toBe(false);
    expect(rng2.bool()).toBe(true);
    expect(rng2.bool()).toBe(false);
    expect(rng2.bool()).toBe(false);
    expect(rng2.bool()).toBe(false);
    expect(rng2.bool()).toBe(false);
    expect(rng2.bool()).toBe(false);
    expect(rng2.bool()).toBe(false);
    expect(rng2.bool()).toBe(false);
    expect(rng2.bool()).toBe(false);
    expect(rng2.bool()).toBe(true);
  });

  test('different seeds', () => {
    const rng1 = new Random('foo');
    const rng2 = new Random('bar');

    expect(rng1.bool()).toBe(true);
    expect(rng1.bool()).toBe(false);
    expect(rng1.bool()).toBe(true);
    expect(rng1.bool()).toBe(false);
    expect(rng1.bool()).toBe(false);
    expect(rng1.bool()).toBe(false);
    expect(rng1.bool()).toBe(false);
    expect(rng1.bool()).toBe(false);
    expect(rng1.bool()).toBe(false);
    expect(rng1.bool()).toBe(false);
    expect(rng1.bool()).toBe(false);
    expect(rng1.bool()).toBe(true);

    expect(rng2.bool()).toBe(true);
    expect(rng2.bool()).toBe(false);
    expect(rng2.bool()).toBe(false);
    expect(rng2.bool()).toBe(false);
    expect(rng2.bool()).toBe(true);
    expect(rng2.bool()).toBe(true);
    expect(rng2.bool()).toBe(true);
    expect(rng2.bool()).toBe(true);
    expect(rng2.bool()).toBe(false);
    expect(rng2.bool()).toBe(true);
    expect(rng2.bool()).toBe(false);
    expect(rng2.bool()).toBe(false);
  });
});
