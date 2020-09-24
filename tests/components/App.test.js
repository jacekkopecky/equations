import React from 'react';
import { MemoryRouter } from 'react-router';
import { render, shallow } from 'enzyme';

import App from '../../src/js/components/App';

test('renders 404 without exception', () => {
  let rendered;
  expect(() => {
    rendered = render((
      <MemoryRouter initialEntries={['/not-here']}>
        <App />
      </MemoryRouter>
    ));
  }).not.toThrow();
  expect(rendered.html()).toContain('404');
});

test('basic contents', () => {
  const wrapper = shallow(<App />);

  expect(wrapper.find('header')).toHaveLength(1);
  expect(wrapper.find('SolveAssignment')).toHaveLength(2);
});

test.todo('more routes');
// see https://medium.com/@antonybudianto/react-router-testing-with-jest-and-enzyme-17294fefd303
