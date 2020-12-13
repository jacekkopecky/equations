import { AppState } from '../../src/js/AppState';

import * as reactTools from '../../src/js/tools/react';

export function empty() {
  const spy = jest.spyOn(reactTools, 'useLocalStorage');
  spy.mockImplementation((key, initialValue) => [initialValue, () => {}]);

  return new AppState();
}
