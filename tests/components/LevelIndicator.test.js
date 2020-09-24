import React from 'react';
import { render } from 'enzyme';

import LevelIndicator from '../../src/js/components/LevelIndicator';

import * as states from './testing-app-states';

test('renders without exception', () => {
  expect(() => render(<LevelIndicator appState={states.empty()} />)).not.toThrow();
});
