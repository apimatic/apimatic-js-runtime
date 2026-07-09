const { jest: lernaAliases } = require('lerna-alias');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/test/setup.js'],
  moduleNameMapper: lernaAliases(),
  coverageReporters: [['lcov', { projectRoot: '../../' }]],
};
