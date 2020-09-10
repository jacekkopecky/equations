import React from 'react';
import { shallow } from 'enzyme';

import App from '../../src/js/app';

test('foo', () => {
  const wrapper = shallow(<App />);

  expect(wrapper.find('header')).toHaveLength(1);
  expect(wrapper.find('main')).toHaveLength(0);

  expect(wrapper.find('SolveEquation').length).toBeGreaterThan(0);
});
