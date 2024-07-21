const { jest: lernaAliases } = require('lerna-alias');

module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: lernaAliases(),
  setupFilesAfterEnv: ["jest-extended/all"],
  coverageReporters: [['lcov', { projectRoot: '../../' }]]
};
