import * as React from 'react';
import renderer, { act } from 'react-test-renderer';

import { AppThemeProvider } from '../AppThemeProvider';
import { ThemedText } from '../ThemedText';

it(`renders correctly`, () => {
  let tree: renderer.ReactTestRenderer | undefined;

  act(() => {
    tree = renderer.create(
      <AppThemeProvider>
        <ThemedText>Snapshot test!</ThemedText>
      </AppThemeProvider>
    );
  });

  expect(tree?.toJSON()).toMatchSnapshot();
});
