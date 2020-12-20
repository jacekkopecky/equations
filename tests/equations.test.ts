import * as equations from '../src/js/tools/equations';

describe('equations library', () => {
  test('exists', () => {
    expect(equations).toEqual(expect.anything());
  });

  test('solves simple 2-variable set', () => {
    const testEqs = [
      {
        lhs: [
          { n: '3', var: 'a' },
          { n: '4', var: 'b' },
        ],
        rhs: [
          { n: '2.40' },
        ],
      },
      {
        lhs: [
          { n: '3', var: 'a' },
          { n: '1', var: 'b' },
        ],
        rhs: [
          { n: '1.50' },
        ],
      },
    ];

    const solution = equations.solve(testEqs);
    expect(solution).not.toBeNull();
    expect(solution!.size).toBe(2);
    expect(solution!.get('a')).toBe('0.4');
    expect(solution!.get('b')).toBe('0.3');
  });

  test('finds an unsolvable 3-variable set to be unsolvable', () => {
    expect(equations).toEqual(expect.anything());

    const testEqs = [
      {
        lhs: [
          {
            n: 3,
            var: 'a',
          },
          {
            n: 1,
            var: 'b',
          },
          {
            n: 2,
            var: 'c',
          },
        ],
        rhs: [
          {
            n: '2.00',
          },
        ],
      },
      {
        lhs: [
          {
            n: 5,
            var: 'a',
          },
          {
            n: 1,
            var: 'b',
          },
          {
            n: 3,
            var: 'c',
          },
        ],
        rhs: [
          {
            n: '3.10',
          },
        ],
      },
      {
        lhs: [
          {
            n: 3,
            var: 'a',
          },
          {
            n: 3,
            var: 'b',
          },
          {
            n: 3,
            var: 'c',
          },
        ],
        rhs: [
          {
            n: '2.70',
          },
        ],
      },
    ];

    const solution = equations.solve(testEqs);
    expect(solution).toBeNull();
  });
});
