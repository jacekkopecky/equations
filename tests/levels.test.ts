import Random from '../src/js/tools/random';
import * as levels from '../src/js/levels/index';
import * as equations from '../src/js/tools/equations';
import applesAndBananas, * as ab from '../src/js/levels/apples-and-bananas';
import cherries, * as c from '../src/js/levels/cherries';
import { challengeNoText } from '../src/js/levels/tools';

const SOLVABILITY_ITERATIONS = Number(process.env.SOLVABILITY_ITERATIONS) || 500;

describe('levels', () => {
  test('there is at least one level', () => {
    expect(levels.topLevel).toBeGreaterThan(0);
  });

  test('level 0 does not exist', () => {
    expect(() => levels.make(0, 1)).toThrow();
  });

  test('same level/n gives same equations', () => {
    for (let level = 1; level < levels.topLevel; level += 1) {
      const eq1 = levels.make(level, level * 10);
      const eq2 = levels.make(level, level * 10);
      const eq3 = levels.make(level, level * 10 + 1);

      expect(eq1).toEqual(eq2);
      expect(eq1).not.toEqual(eq3);
    }
  });

  test('levels without text do not have onlyText', () => {
    for (let level = 1; level < levels.topLevel; level += 1) {
      const eq1 = levels.make(level, level * 10);

      if (eq1.text == null) expect(eq1.onlyText).toBeFalsy();
    }
  });

  test('onlyText is used (but only if there is a text)', () => {
    const foundOnlyText = new Set<boolean>();

    for (let level = 1; level < levels.topLevel; level += 1) {
      const eq = levels.make(level, level * 10);

      if (eq.onlyText) {
        expect(Array.isArray(eq.text)).toBe(true);
      }

      // record that we have found equations with/out onlyText
      foundOnlyText.add(Boolean(eq.onlyText));
    }

    // assert that some have .onlyText and that some don't
    expect(foundOnlyText.has(true)).toBe(true);
    expect(foundOnlyText.has(false)).toBe(true);
  });

  // numbers from 1 to levels.topLevel
  const levelNums = (new Array(levels.topLevel).fill(0).map((x, i) => i + 1));

  test.each(levelNums)('level %d is solvable', (level) => {
    for (let n = 1; n <= SOLVABILITY_ITERATIONS; n += 1) {
      const assignment = levels.make(level, n);
      const solution = equations.solve(assignment.equations);
      if (!solution) {
        const formatted = assignment.equations.map((e, i) => equations.formatEquation(e, i + 1, true)).join('\n');
        console.log(`level: ${level}, n: ${n}\n${formatted}`);
      }
      expect(solution).toEqual(expect.anything()); // a solution should exist

      for (const variable of solution!.keys()) {
        if (Number(solution!.get(variable)) !== Number(assignment.solution[variable])) {
          const formatted = assignment.equations.map((e, i) => equations.formatEquation(e, i + 1, true)).join('\n');
          console.log(`level: ${level}, n: ${n}\n${formatted}`, solution);
          console.log(JSON.stringify(assignment.equations, null, 2));
        }
        expect(Number(solution!.get(variable))).toBe(Number(assignment.solution[variable]));
      }
    }
  });
});

describe('apples and bananas levels', () => {
  test('export is an array', () => {
    expect(Array.isArray(applesAndBananas)).toBe(true);
    expect(applesAndBananas.length).toBeGreaterThan(0);
    expect(applesAndBananas[0]).not.toBe(null);
  });

  test('extras1 is an array', () => {
    expect(Array.isArray(ab.extras1)).toBe(true);
    expect(ab.extras1.length).toBeGreaterThan(0);
    expect(ab.extras1[0]).not.toBe(null);
  });

  test('first batch all have text', () => {
    for (const level of applesAndBananas) {
      const rng = new Random('foo');
      const eq = level(rng);
      expect(Array.isArray(eq.text)).toBe(true);
    }
  });

  test('extras1 text effectively says "no text"', () => {
    for (const level of ab.extras1) {
      const rng = new Random('foo');
      const eq = level(rng);
      expect(eq.text).toEqual([challengeNoText]);
    }
  });
});

describe('cherries levels', () => {
  test('export is an array', () => {
    expect(Array.isArray(cherries)).toBe(true);
    expect(cherries.length).toBeGreaterThan(0);
    expect(cherries[0]).not.toBe(null);
  });

  test('extras1 is an array', () => {
    expect(Array.isArray(c.extras1)).toBe(true);
    expect(c.extras1.length).toBeGreaterThan(0);
    expect(c.extras1[0]).not.toBe(null);
  });

  test('first batch and extras1 all have text', () => {
    for (const level of [...cherries, ...c.extras1]) {
      const rng = new Random('foo');
      const eq = level(rng);
      expect(Array.isArray(eq.text)).toBe(true);
    }
  });
});
