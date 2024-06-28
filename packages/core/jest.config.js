const { jest: lernaAliases } = require('lerna-alias');

module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: { 
    "^axios$": "axios/dist/node/axios.cjs",
    ...lernaAliases(),
  },
  coverageReporters: [['lcov', { projectRoot: '../../' }]]
};
