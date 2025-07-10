import typescript from 'rollup-plugin-typescript2';
import packageJson from '@apimatic/core/package.json';

const getTsPlugin = ({ declaration = true, target } = {}) =>
  typescript({
    clean: true,
    tsconfigOverride: {
      compilerOptions: {
        declaration,
        ...(target && { target })
      }
    }
  });

const getNpmConfig = ({ input, output, external }) => ({
  input,
  output,
  preserveModules: true,
  plugins: [getTsPlugin({ declaration: true })],
  external
});

export default [
  getNpmConfig({
    input: 'src/index.ts',
    output: [
      {
        dir: 'es',
        format: 'esm'
      }
    ],
    external: Object.keys(packageJson.dependencies)
  })
];
