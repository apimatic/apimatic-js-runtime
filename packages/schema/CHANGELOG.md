# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [0.7.21-alpha.0](https://github.com/apimatic/apimatic-js-runtime/compare/@apimatic/schema@0.7.20...@apimatic/schema@0.7.21-alpha.0) (2025-09-04)

### Features

- add metaschema ([9e900a1](https://github.com/apimatic/apimatic-js-runtime/commit/9e900a120bdabcea3fbd9dfad5f6c4fbed6bc53b))
- allOf for extend schemas ([5380ec0](https://github.com/apimatic/apimatic-js-runtime/commit/5380ec0ea8ec4459eb2aa4e60f30c21175cf10e8))
- allOf without discriminator ([3172614](https://github.com/apimatic/apimatic-js-runtime/commit/31726143ab46b7532144306a68d0d1046c311362))
- anyOf w/ discriminator ([98a5317](https://github.com/apimatic/apimatic-js-runtime/commit/98a5317af48a85de6ac2e5e74b93c9e02101e5fa))
- basic object impl ([0fa6d9b](https://github.com/apimatic/apimatic-js-runtime/commit/0fa6d9b7d734e220e326c25118afdc66239ce982))
- discriminatorObject/allOf ([61ebe97](https://github.com/apimatic/apimatic-js-runtime/commit/61ebe97abfceb27b900c845ca02e03792ce94b3c))
- extend JSONSchema7 with OAS feats ([a15e781](https://github.com/apimatic/apimatic-js-runtime/commit/a15e781b1e6a4d676a8afbcd647874f8c1565845))
- extendTypedExpandoObject ([75d925b](https://github.com/apimatic/apimatic-js-runtime/commit/75d925b6610f286701a5b8675f00c98bc5a2818a))
- handle arrays and maps ([c739ba2](https://github.com/apimatic/apimatic-js-runtime/commit/c739ba269b2a76bd92b0d417cd9038f7d4cb54a2))
- handle context arg change for string ([1735ff3](https://github.com/apimatic/apimatic-js-runtime/commit/1735ff3158ee605d6dcb7759f13be6a4de95cb7c))
- handle context args ([ab067ce](https://github.com/apimatic/apimatic-js-runtime/commit/ab067cee7a439af3005f9f13e108a62f96a0a729))
- handle context args for array and map ([3dfc2e0](https://github.com/apimatic/apimatic-js-runtime/commit/3dfc2e0d3a86a29496e1e3f3f40662e2d6c59a5d))
- handle most primitive types ([745fa27](https://github.com/apimatic/apimatic-js-runtime/commit/745fa279520e4122441702ba50abd42824032d23))
- oneOf w/ discriminator ([4a688aa](https://github.com/apimatic/apimatic-js-runtime/commit/4a688aaf7734376256e5f9824d447f5fa35f293c))
- oneOf/anyOf w/o discriminator map ([a08341c](https://github.com/apimatic/apimatic-js-runtime/commit/a08341cf0d5ee900bc15b377bf9d4bd916e398ac))
- unsafe defaultValue and const handling ([4e97d86](https://github.com/apimatic/apimatic-js-runtime/commit/4e97d864de07a1fa48911faf921dd7ed273c5a62))
- update schema interface ([7b6fbbd](https://github.com/apimatic/apimatic-js-runtime/commit/7b6fbbd2c47aa2979620c66ec91135d60270dbd6))
- use $defs for circular refs ([bb299c1](https://github.com/apimatic/apimatic-js-runtime/commit/bb299c192106c3d7b7739735bedf7af6e00d8c13))
- use $defs for oneOf/anyOf ([7d9ddf7](https://github.com/apimatic/apimatic-js-runtime/commit/7d9ddf7fc1d18f80b1df6bd7bf697d33b127995b))
- use context type to keep track of $defs ([d7ab15d](https://github.com/apimatic/apimatic-js-runtime/commit/d7ab15d4267f2b83cfdbdd656379490e70008d68))
- use mutable context idea instead ([e0e5d17](https://github.com/apimatic/apimatic-js-runtime/commit/e0e5d171e754f36f9743b5a630921fa32fcd3e20))

### Bug Fixes

- avoid wrapping string enums in quotes ([59c89b7](https://github.com/apimatic/apimatic-js-runtime/commit/59c89b78a85970d7860c1abf11cfd9cee8681785))
- broken test ([a04fc60](https://github.com/apimatic/apimatic-js-runtime/commit/a04fc60db8808fb8498da8480eb45a960d72594a))
- can't export with extension ([0c3196c](https://github.com/apimatic/apimatic-js-runtime/commit/0c3196c14b4fa651632ad83333d4a32f5d94d1a5))
- confusing test value for discriminatedObject ([3cb3beb](https://github.com/apimatic/apimatic-js-runtime/commit/3cb3bebe0c8502be2094c9f5d362d0288a329be7))
- create global $defs for oneOf/anyOf ([1c602b6](https://github.com/apimatic/apimatic-js-runtime/commit/1c602b629275d3ae287459f64fe0b69f9f904c9c))
- drafts newer than 7 are not well supported ([8a09245](https://github.com/apimatic/apimatic-js-runtime/commit/8a0924556f18123a99bff2228df31d77d296dc78))
- extract schema from new context ([058a2ad](https://github.com/apimatic/apimatic-js-runtime/commit/058a2ad0a9e5643e5e0132741d4f84337ed5c494))
- handle context args for primitives ([09d768b](https://github.com/apimatic/apimatic-js-runtime/commit/09d768b012ed524031337e0c24f54e4a8c47b05d))
- keep parent schemas in $defs for allOf ([c305602](https://github.com/apimatic/apimatic-js-runtime/commit/c305602989712ef8d6717d204e9dad44cd16db9b))
- missing type predicate for numberEnum ([0cd9b03](https://github.com/apimatic/apimatic-js-runtime/commit/0cd9b035fa62eee430082e776b208a41e64708f0))
- move PartialJSONSchema to jsonSchemaTypes ([b7a422a](https://github.com/apimatic/apimatic-js-runtime/commit/b7a422ad60e783b08beb47bc73440c92b52d8c5d))
- never skip typeof check for some flows ([11fc133](https://github.com/apimatic/apimatic-js-runtime/commit/11fc13388f96c6d01711c19498a8817b3c81639f))
- oneOf is never valid for inheritance ([97f6e4d](https://github.com/apimatic/apimatic-js-runtime/commit/97f6e4d4cfc7b93403a691ff1f499f4fa5f3ea93))
- **pr-checks:** tslint errors forbidding T[] ([7d4c27a](https://github.com/apimatic/apimatic-js-runtime/commit/7d4c27ab825b5400218d2de92fe5cc007481eebf))
- recursive schemas ([4e3116c](https://github.com/apimatic/apimatic-js-runtime/commit/4e3116cb6a55333cadb58a71327bc0e0bc6b9b6f))
- strictObject handling ([64b04b2](https://github.com/apimatic/apimatic-js-runtime/commit/64b04b2209afc79109f230dfc4cfa071d0a55d55))
- type extension not recursive ([a9b56d9](https://github.com/apimatic/apimatic-js-runtime/commit/a9b56d99740f11006cc08d0eb2930df538451fd7))
- type imported from outDir instead of src ([f4e27ec](https://github.com/apimatic/apimatic-js-runtime/commit/f4e27ec6baf39145f17eedadf5b5f477b4eb113a))
- type-only import crash prettier ([a32dc81](https://github.com/apimatic/apimatic-js-runtime/commit/a32dc812bf83565b56b1c30d573a02ba07508a62))
- update string, number and boolean tests ([6130dbb](https://github.com/apimatic/apimatic-js-runtime/commit/6130dbbf929a7844224f2a0a70d7ebd5cc5a5ce5))
- use openapi json schema dialect ([424d9d0](https://github.com/apimatic/apimatic-js-runtime/commit/424d9d027349544d7f623d22ef7222b68b6d11f7))
- use unmapped prop key in objects ([06d15d1](https://github.com/apimatic/apimatic-js-runtime/commit/06d15d105061578113c310e809f6cf5315d2234b))

### Performance Improvements

- return refs for existing defs if found ([e7d7abc](https://github.com/apimatic/apimatic-js-runtime/commit/e7d7abc8799cadbeeb86383b75c7cf64c6284226))

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
