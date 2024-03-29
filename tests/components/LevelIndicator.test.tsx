import * as React from 'react';
import { render, shallow } from 'enzyme';

import LevelIndicator from '../../src/js/components/LevelIndicator';
import * as types from '../../src/js/types';

import * as states from './testing-app-states';

test('renders without exception', () => {
  expect(() => render(<LevelIndicator appState={states.empty()} />)).not.toThrow();
});

test('shows five stars', () => {
  const appState = states.empty();
  const wrapper = shallow(<LevelIndicator appState={appState} />);
  expect(wrapper.find('.star')).toHaveLength(types.PROGRESS_PER_LEVEL);
});
