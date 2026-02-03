import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores([`dist`]), {
    files: [`**/*.{ts,tsx,js,jsx}`],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended
      // reactHooks.configs.flat.recommended,
      // reactRefresh.configs.vite
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      "indent": [
        `error`,
        2,
        {
          "SwitchCase": 1,
          "VariableDeclarator": 1,
          "outerIIFEBody": 1,
          "MemberExpression": 1,
          "FunctionDeclaration": {
            "parameters": 1,
            "body": 1
          },
          "FunctionExpression": {
            "parameters": 1,
            "body": 1
          },
          "CallExpression": {
            "arguments": 1
          },
          "ArrayExpression": 1,
          "ObjectExpression": 1,
          "ImportDeclaration": 1,
          "flatTernaryExpressions": true,
          "offsetTernaryExpressions": false,
          "ignoreComments": false
        }
      ],
      "semi": [
        `error`,
        `always`
      ],
      "quotes": [
        `error`,
        `backtick`
      ],
      "no-unused-vars": `off`,
      "no-undef": `off`,
      "no-empty": [
        `error`,
        {
          "allowEmptyCatch": true
        }
      ],
      "prefer-const": `error`,
      "no-dupe-keys": `off`,
      "linebreak-style": [`error`, `unix`],
      "arrow-parens": [
        `error`,
        `as-needed`
      ],
      "comma-dangle": [
        `error`,
        {
          "arrays": `never`,
          "objects": `only-multiline`,
          "imports": `never`,
          "exports": `never`,
          "functions": `never`
        }
      ],
      "max-len": [
        `error`,
        {
          "code": 160,
          "ignoreStrings": true,
          "ignoreTemplateLiterals": true,
          "ignoreComments": true
        }
      ],
      "keyword-spacing": [
        `error`,
        {
          "before": true,
          "after": true
        }
      ],
      "space-in-parens": [
        `error`,
        `never`
      ],
      "space-before-blocks": [
        `error`,
        `always`
      ],
      "space-before-function-paren": [
        `error`,
        {
          "anonymous": `never`,
          "named": `never`,
          "asyncArrow": `always`
        }
      ],
      "space-infix-ops": `error`,
      "no-multi-spaces": `error`,
      "block-spacing": [
        `error`,
        `always`
      ],
      "arrow-spacing": [
        `error`,
        {
          "before": true,
          "after": true
        }
      ],
      "no-trailing-spaces": [
        `error`
      ],
      "key-spacing": [
        `error`,
        {
          "beforeColon": false,
          "afterColon": true,
          "mode": `strict`
        }
      ],
      "object-curly-spacing": [
        `error`,
        `always`
      ],
      "no-import-assign": `off`,
      "no-fallthrough": `off`,
      "no-empty-function": `off`,
      "@typescript-eslint/no-unused-vars": `off`
    }
  }
]);
