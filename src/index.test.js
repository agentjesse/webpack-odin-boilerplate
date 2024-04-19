// eslint-disable-next-line object-curly-newline
import { sum } from './index.js';
/* this test works, just hiding it.
test('use jsdom in this test file', () => {
  const element = document.createElement('div');
  expect(element).not.toBeNull();
});
*/
test.only('adds 1 + 2 to equal 3 and not 999', () => {
  //matcher for exact equality (Object.is)
  expect(sum(1, 2)).toBe(3);
});

