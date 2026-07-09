import typescript from 'rollup-plugin-typescript2';

const getTsPlugin = ({ declaration = true, target } = {}) =>
  typescript({
    clean: true,
    tsconfigOverride: {
      compilerOptions: {
        declaration,
        ...(target && { target }),
      },
    },
  });

const getNpmConfig = ({ input, output, external }) => ({
  input,
  output,
  preserveModules: true,
  plugins: [getTsPlugin({ declaration: true })],
  external,
});

export default [
  getNpmConfig({
    input: 'src/index.ts',
    output: [
      {
        dir: 'es',
        format: 'esm',
      },
    ],
  }),
];
