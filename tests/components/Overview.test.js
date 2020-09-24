import React from 'react';
import { MemoryRouter } from 'react-router';
import { render } from 'enzyme';

import Overview from '../../src/js/components/Overview';

import * as states from './testing-app-states';

test('renders without exception', () => {
  expect(() => render((
    <MemoryRouter>
      <Overview appState={states.empty()} />
    </MemoryRouter>
  ))).not.toThrow();
});
