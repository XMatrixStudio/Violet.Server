module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
      transform: {
        '^.+\\.(ts|tsx)$': './node_modules/ts-jest/preprocessor.js'
      }
    }
  },
  moduleFileExtensions: ['ts', 'js'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts']
}
