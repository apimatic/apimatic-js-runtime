import { js } from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import { globals } from 'globals';
import { tseslint } from 'typescript-eslint';


export default defineConfig([
  { files: ["./src/**/*.{ts}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["./src/**/*.{ts}"], languageOptions: { globals: globals.node } },
  globalIgnores(["./dist"]),
  tseslint.configs.recommended,
]);
