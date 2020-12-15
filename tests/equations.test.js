import * as equations from '../src/js/tools/equations';

describe('equations library', () => {
  test('exists', () => {
    expect(equations).toEqual(expect.anything());

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
    expect(solution.size).toBe(2);
    expect(solution.get('a')).toBe('0.4');
    expect(solution.get('b')).toBe('0.3');
  });
});
