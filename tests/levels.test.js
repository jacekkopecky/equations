import Random from '../src/js/tools/random';
import levels from '../src/js/levels/index';
import applesAndBananas from '../src/js/levels/apples-and-bananas';

describe('levels', () => {
  test('export is an array', () => {
    expect(Array.isArray(levels)).toBe(true);
    expect(levels.length).toBeGreaterThan(1); // there must be at least one real level
    expect(levels[0]).toBe(null); // level 0 isn't counted
  });

  test('same Random gives same equations', () => {
    for (const level of levels) {
      if (level == null) continue;

      const rng1 = new Random('foo');
      const rng2 = new Random('foo');
      const rng3 = new Random('bar');

      const eq1 = level(rng1);
      const eq2 = level(rng2);
      const eq3 = level(rng3);

      expect(eq1).toEqual(eq2);
      expect(eq1).not.toEqual(eq3);

      if (eq1.text == null) expect(eq1.onlyText).toBeFalsey();
    }
  });

  test('onlyText is used (but only if there is a text)', () => {
    const foundOnlyText = {
      true: false,
      false: false,
    };

    for (const level of levels) {
      if (level == null) continue;

      const rng = new Random('foo');
      const eq = level(rng);

      if (eq.onlyText) {
        expect(Array.isArray(eq.text)).toBe(true);
      }

      // record that we have found equations with/out onlyText
      foundOnlyText[Boolean(eq.onlyText)] = true;
    }

    // assert that some have .onlyText and that some don't
    expect(foundOnlyText.true).toBe(true);
    expect(foundOnlyText.false).toBe(true);
  });
});

describe('apples and bananas levels', () => {
  test('export is an array', () => {
    expect(Array.isArray(applesAndBananas)).toBe(true);
    expect(applesAndBananas.length).toBeGreaterThan(0);
    expect(applesAndBananas[0]).not.toBe(null);
  });

  test('all have text', () => {
    for (const level of applesAndBananas) {
      const rng = new Random('foo');
      const eq = level(rng);
      expect(Array.isArray(eq.text)).toBe(true);
    }
  });
});
