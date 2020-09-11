import React from 'react';
import { shallow } from 'enzyme';

import App from '../../src/js/components/App';

test('foo', () => {
  const wrapper = shallow(<App />);

  expect(wrapper.find('header')).toHaveLength(1);
  expect(wrapper.find('main')).toHaveLength(0);

  expect(wrapper.find('AssignmentParams').length).toBeGreaterThan(0);
});

test.todo('routes, incl 404');
// see https://medium.com/@antonybudianto/react-router-testing-with-jest-and-enzyme-17294fefd303
