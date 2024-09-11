# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [0.10.14](https://github.com/apimatic/apimatic-js-runtime/compare/@apimatic/core@0.10.13...@apimatic/core@0.10.14) (2024-09-11)

### Bug Fixes

- **core:** query value type in request builder ([#189](https://github.com/apimatic/apimatic-js-runtime/issues/189)) ([26cbf51](https://github.com/apimatic/apimatic-js-runtime/commit/26cbf51aec8f1a183fe25c6ca9750424f839d907)), closes [#188](https://github.com/apimatic/apimatic-js-runtime/issues/188)

### [0.10.13](https://github.com/apimatic/apimatic-js-runtime/compare/@apimatic/core@0.10.12...@apimatic/core@0.10.13) (2024-08-29)

### Features

- support object and unkown header parameters ([#186](https://github.com/apimatic/apimatic-js-runtime/issues/186)) ([190d463](https://github.com/apimatic/apimatic-js-runtime/commit/190d463b48809e3d580b0d577836a95429f303d1))

### [0.10.12](https://github.com/apimatic/apimatic-js-runtime/compare/@apimatic/core@0.10.11...@apimatic/core@0.10.12) (2024-07-22)

### Bug Fixes

- **response-validation:** request builder schema validation and numeric value handling issues ([#183](https://github.com/apimatic/apimatic-js-runtime/issues/183)) ([ad18ad0](https://github.com/apimatic/apimatic-js-runtime/commit/ad18ad0e222209b76538fe7f6832f97858f74e0e))

### [0.10.11](https://github.com/apimatic/apimatic-js-runtime/compare/@apimatic/core@0.10.10...@apimatic/core@0.10.11) (2024-07-09)

### Features

- added support for handling empty responses with nullable types ([#181](https://github.com/apimatic/apimatic-js-runtime/issues/181)) ([7609254](https://github.com/apimatic/apimatic-js-runtime/commit/7609254693425f489e03b4202fe18794d1871b8d))

### [0.10.10](https://github.com/apimatic/apimatic-js-runtime/compare/@apimatic/core@0.10.9...@apimatic/core@0.10.10) (2024-06-27)

**Note:** Version bump only for package @apimatic/core

### [0.10.9](https://github.com/apimatic/apimatic-js-runtime/compare/@apimatic/core@0.10.8...@apimatic/core@0.10.9) (2024-06-27)

**Note:** Version bump only for package @apimatic/core

### 0.10.8 (2024-05-28)

### Features

- **configureable-logger:** add support of configurable logger ([#164](https://github.com/apimatic/apimatic-js-runtime/issues/164)) ([2b0a57a](https://github.com/apimatic/apimatic-js-runtime/commit/2b0a57a60de744159ac6f521311435ffc6f5ab34))
- **convert-to-stream:** add convert-to-stream in runtime libraries repo ([5b0f4c5](https://github.com/apimatic/apimatic-js-runtime/commit/5b0f4c5d9c84c0330ffa2feb98390c43d470909f))
- **core:** add support for unknown types in path parameters ([5bf6c9e](https://github.com/apimatic/apimatic-js-runtime/commit/5bf6c9e0e87ac13334e3d21c5db037a2db912d70))
- **typescript:** add support for complex query params ([aeeead0](https://github.com/apimatic/apimatic-js-runtime/commit/aeeead0a940bc7d78c78155531e3df0ff6cfe9ec)), closes [#51](https://github.com/apimatic/apimatic-js-runtime/issues/51)
- **typescript:** add support for pluggable adapters ([a76ba7c](https://github.com/apimatic/apimatic-js-runtime/commit/a76ba7cbf2602bdc48b758816000330429ac4972))

### Bug Fixes

- **core-ts:** add support of boolean array in query-value ([#49](https://github.com/apimatic/apimatic-js-runtime/issues/49)) ([60dc89e](https://github.com/apimatic/apimatic-js-runtime/commit/60dc89e4cc6b30eedf799e9a763f910e241336f0)), closes [#48](https://github.com/apimatic/apimatic-js-runtime/issues/48)
- **core:** fix deserialization exception in error template messeage ([#150](https://github.com/apimatic/apimatic-js-runtime/issues/150)) ([78cef3c](https://github.com/apimatic/apimatic-js-runtime/commit/78cef3c6f84f8269a8c7995049150e619111e1ff)), closes [#27](https://github.com/apimatic/apimatic-js-runtime/issues/27)
- **nullable-headers:** adds the capability to set null headers in request builder ([#171](https://github.com/apimatic/apimatic-js-runtime/issues/171)) ([817211f](https://github.com/apimatic/apimatic-js-runtime/commit/817211f63f2e92d26db9cdff7b23891befccf78b))
- **typescript:** bump axios major version ([#157](https://github.com/apimatic/apimatic-js-runtime/issues/157)) ([da3b168](https://github.com/apimatic/apimatic-js-runtime/commit/da3b1681f1d317249e3a5e64e58ba4d60cded6d5)), closes [#153](https://github.com/apimatic/apimatic-js-runtime/issues/153)
- **typescript:** fix custom error classes to set error prototype ([13957d6](https://github.com/apimatic/apimatic-js-runtime/commit/13957d6110c8347d07e1692c462619022c30a21f)), closes [#83](https://github.com/apimatic/apimatic-js-runtime/issues/83)
- **typescript:** fix wrong import in es modules. ([21e76a8](https://github.com/apimatic/apimatic-js-runtime/commit/21e76a80e384df2cf399c6b36ca0a4fd2b42bcf4)), closes [#93](https://github.com/apimatic/apimatic-js-runtime/issues/93)
- **typescript:** update rollup versions in all packages package.json ([#98](https://github.com/apimatic/apimatic-js-runtime/issues/98)) ([c7a1106](https://github.com/apimatic/apimatic-js-runtime/commit/c7a1106bfc8e7d10e28dee97fb30a4e2792f21df)), closes [#93](https://github.com/apimatic/apimatic-js-runtime/issues/93)

### 0.7.6 (2022-05-09)

### Features

- **core:** add forceful retries ([2e0879c](https://github.com/apimatic/apimatic-js-runtime/commit/2e0879c44595c9223501437e41509713be61e94e))

### Bug Fixes

- **core:** bump json-bigint version to enable parsing large floats ([eb4ff36](https://github.com/apimatic/apimatic-js-runtime/commit/eb4ff364bfe6fde41b260bb3884e9c8b66e4ef53))
- **core:** remove convert to stream in a separate library ([810be61](https://github.com/apimatic/apimatic-js-runtime/commit/810be610b604ee3b76a07fc428a7fb9539ee08dc))

### 0.7.2 (2022-01-05)

### Features

- **core:** make http client configurable and add retry support ([07ff535](https://github.com/apimatic/apimatic-js-runtime/commit/07ff53524823886b2ae78f30048f1bdf7498955a)), closes [#31](https://github.com/apimatic/apimatic-js-runtime/issues/31)

## 0.7.0 (2021-12-22)

### Features

- **core:** add platform and os detection for user-agent Closes [#29](https://github.com/apimatic/apimatic-js-runtime/issues/29) ([a3d0023](https://github.com/apimatic/apimatic-js-runtime/commit/a3d00236254c4c5391e9b5db73a0af351d4382cc))

### 0.6.2 (2021-09-29)

### Features

- **ts:** add support for bigint in template params ([#16](https://github.com/apimatic/apimatic-js-runtime/issues/16)) ([384146c](https://github.com/apimatic/apimatic-js-runtime/commit/384146c4af24d9ffdbfb9ecad18b8686c37240f5))

### 0.6.1 (2021-05-07)

### 0.6.1-alpha.1 (2021-05-04)

### 0.6.1-alpha.0 (2021-05-02)
