// import {  } from './index.js'; //uncomment and use this file once you learn UI mocking for jest
import { logToConsole as lg, objectToString as ots, log2DStringArray } from './logger.js';

test('use jsdom in this test file', () => {
  const element = document.createElement('div');
  expect(element).not.toBeNull();
});
