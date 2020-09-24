import React from 'react';
import { MemoryRouter } from 'react-router';
import { render } from 'enzyme';

import Statistics from '../../src/js/components/Statistics';

import * as states from './testing-app-states';

test('renders without exception', () => {
  expect(() => render((
    <MemoryRouter>
      <Statistics appState={states.empty()} />
    </MemoryRouter>
  ))).not.toThrow();
});
