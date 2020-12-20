import * as React from 'react';
import { MemoryRouter } from 'react-router';
import { render } from 'enzyme';

import SolveAssignment from '../../src/js/components/SolveAssignment';

import * as states from './testing-app-states';

test('renders without exception', () => {
  expect(() => render((
    <MemoryRouter>
      <SolveAssignment
        level={1}
        n={1}
        appState={states.empty()}
        back="/"
      />
    </MemoryRouter>
  ))).not.toThrow();
});
