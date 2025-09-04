# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [0.7.20](https://github.com/apimatic/apimatic-js-runtime/compare/@apimatic/schema@0.7.19...@apimatic/schema@0.7.20) (2025-09-04)

**Note:** Version bump only for package @apimatic/schema

### [0.7.19](https://github.com/apimatic/apimatic-js-runtime/compare/@apimatic/schema@0.7.18...@apimatic/schema@0.7.19) (2025-09-02)

### Features

- **schema:** add isMappedValueValidForSchema function ([#274](https://github.com/apimatic/apimatic-js-runtime/issues/274)) ([4d66e0c](https://github.com/apimatic/apimatic-js-runtime/commit/4d66e0c615a6e766980c285d949f403221c2128e))

### [0.7.18](https://github.com/apimatic/apimatic-js-runtime/compare/@apimatic/schema@0.7.17...@apimatic/schema@0.7.18) (2025-08-13)

**Note:** Version bump only for package @apimatic/schema

### [0.7.17](https://github.com/apimatic/apimatic-js-runtime/compare/@apimatic/schema@0.7.16...@apimatic/schema@0.7.17) (2025-07-11)

### Bug Fixes

- **core:** populate error.result for all response types ([#250](https://github.com/apimatic/apimatic-js-runtime/issues/250)) ([6266f34](https://github.com/apimatic/apimatic-js-runtime/commit/6266f34bfb4cbfae2ade0958923aa55c0a81826b))

### [0.7.16](https://github.com/apimatic/apimatic-js-runtime/compare/@apimatic/schema@0.7.15...@apimatic/schema@0.7.16) (2025-05-15)

**Note:** Version bump only for package @apimatic/schema

### [0.7.15](https://github.com/apimatic/apimatic-js-runtime/compare/@apimatic/schema@0.7.14...@apimatic/schema@0.7.15) (2024-12-12)

**Note:** Version bump only for package @apimatic/schema

### [0.7.14](https://github.com/apimatic/apimatic-js-runtime/compare/@apimatic/schema@0.7.13...@apimatic/schema@0.7.14) (2024-11-28)

### Features

- **additional-properties:** adds typed expando object schema ([#193](https://github.com/apimatic/apimatic-js-runtime/issues/193)) ([b36ed4d](https://github.com/apimatic/apimatic-js-runtime/commit/b36ed4dd088341e6f69ced399f7d0b83a12c96ef))

### [0.7.13](https://github.com/apimatic/apimatic-js-runtime/compare/@apimatic/schema@0.7.12...@apimatic/schema@0.7.13) (2024-09-27)

**Note:** Version bump only for package @apimatic/schema

### [0.7.12](https://github.com/apimatic/apimatic-js-runtime/compare/@apimatic/schema@0.7.11...@apimatic/schema@0.7.12) (2024-07-22)

### Bug Fixes

- **schema:** adds support of selecting schema without discriminator fields in discriminatedSchema ([#184](https://github.com/apimatic/apimatic-js-runtime/issues/184)) ([74b5483](https://github.com/apimatic/apimatic-js-runtime/commit/74b54837f267cf8063ef6765402972c4a1fd7ba3))

### [0.7.11](https://github.com/apimatic/apimatic-js-runtime/compare/@apimatic/schema@0.7.10...@apimatic/schema@0.7.11) (2024-06-27)

### Bug Fixes

- **object-opt-null:** support for optional and nullable for inner obj fields ([#179](https://github.com/apimatic/apimatic-js-runtime/issues/179)) ([11f40e5](https://github.com/apimatic/apimatic-js-runtime/commit/11f40e5f707499fcec5da7e8733240139d1432c5))

### [0.7.10](https://github.com/apimatic/apimatic-js-runtime/compare/@apimatic/schema@0.7.9...@apimatic/schema@0.7.10) (2024-06-27)

### Features

- **optional-nullable:** adds optional nullable support in schema lib ([#178](https://github.com/apimatic/apimatic-js-runtime/issues/178)) ([6973087](https://github.com/apimatic/apimatic-js-runtime/commit/69730870f2998bc30330a957ace47aff857c09c4))

### 0.7.9 (2024-05-28)

### Features

- **schema:** add schemas for OneOf and AnyOf types ([#135](https://github.com/apimatic/apimatic-js-runtime/issues/135)) ([7b26d59](https://github.com/apimatic/apimatic-js-runtime/commit/7b26d59e9ada13e5f1aef69817950d0b43a7fb62)), closes [#125](https://github.com/apimatic/apimatic-js-runtime/issues/125)
- **schema:** add support for unknown enum values ([#160](https://github.com/apimatic/apimatic-js-runtime/issues/160)) ([e132c2c](https://github.com/apimatic/apimatic-js-runtime/commit/e132c2c3722b6cc4a6870c0c1ac8e82082415d26)), closes [#159](https://github.com/apimatic/apimatic-js-runtime/issues/159)
- **typescript:** add support for pluggable adapters ([a76ba7c](https://github.com/apimatic/apimatic-js-runtime/commit/a76ba7cbf2602bdc48b758816000330429ac4972))
- **unmapping:** adds inter-convertible optional and nullable values for responses ([#170](https://github.com/apimatic/apimatic-js-runtime/issues/170)) ([d3c9e09](https://github.com/apimatic/apimatic-js-runtime/commit/d3c9e0929c6d59cd3380b89e023c020ed5964f1a))

### Bug Fixes

- **schema:** fix lenient validation during mapping of oneof types ([#147](https://github.com/apimatic/apimatic-js-runtime/issues/147)) ([5cb7558](https://github.com/apimatic/apimatic-js-runtime/commit/5cb7558f40beafff913f1b1489801eadb61680b8)), closes [#146](https://github.com/apimatic/apimatic-js-runtime/issues/146)
- **schema:** fix lenient validation of string numbers in oneof ([#145](https://github.com/apimatic/apimatic-js-runtime/issues/145)) ([1eaa589](https://github.com/apimatic/apimatic-js-runtime/commit/1eaa5892dc18f0a295231f02079955e30e267a1a)), closes [#144](https://github.com/apimatic/apimatic-js-runtime/issues/144)
- **schema:** fix mapping of all optional fields model array to its object schema ([#152](https://github.com/apimatic/apimatic-js-runtime/issues/152)) ([92ba3ec](https://github.com/apimatic/apimatic-js-runtime/commit/92ba3ec094918426c6d8c6048041441db2bb0bfd)), closes [#151](https://github.com/apimatic/apimatic-js-runtime/issues/151)
- **typescript:** update rollup versions in all packages package.json ([#98](https://github.com/apimatic/apimatic-js-runtime/issues/98)) ([c7a1106](https://github.com/apimatic/apimatic-js-runtime/commit/c7a1106bfc8e7d10e28dee97fb30a4e2792f21df)), closes [#93](https://github.com/apimatic/apimatic-js-runtime/issues/93)

## 0.6.0 (2021-04-02)

### 0.5.2-alpha.1 (2021-03-07)

### 0.5.2-alpha.0 (2021-03-07)

### 0.5.1 (2021-02-23)

## 0.5.0 (2021-02-22)

### 0.4.1 (2020-10-23)

## 0.4.0 (2020-10-23)
