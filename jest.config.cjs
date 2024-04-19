module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },
};

/* moduleNameMapper added for jest integration to webpack project. why?:
Jest tries to parse the CSS file, like it tries to with all imports, and this is not supported. Jest can handle CSS differently with a moduleNameMapper configuration which tells Jest to replace imports of certain file types with a mock file.
*/