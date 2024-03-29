import * as React from 'react';

import { AppState } from '../../src/js/AppState';

import * as reactTools from '../../src/js/tools/react';

interface ReactModule {
  useState: unknown,
  useEffect: unknown,
}

jest.mock('react', () => {
  const actualReact: ReactModule = jest.requireActual('react');

  const setState = jest.fn();
  const useStateSpy = jest.fn();
  useStateSpy.mockImplementation(
    ((initialValue: unknown) => [initialValue, setState]) as
      () => [unknown, React.Dispatch<unknown>],
  );

  const useEffectSpy = jest.fn();

  return {
    ...actualReact,
    useState: useStateSpy,
    originalUseState: actualReact.useState,
    useEffect: useEffectSpy,
    originalUseEffect: actualReact.useEffect,
  };
});

export function empty(): AppState {
  const useLocalStorageSpy = jest.spyOn(reactTools, 'useLocalStorage');
  useLocalStorageSpy.mockImplementation((key, initialValue) => [initialValue, () => {}, () => {}]);

  return new AppState();
}
