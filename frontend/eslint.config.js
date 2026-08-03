import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import importX from 'eslint-plugin-import-x'

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      import: importX,
      "import-x": importX,
    },
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      
      // disables cross-feature imports:
      // eg. src/features/discussions should not import from src/features/comments, etc.
      // Disables cross-feature imports (Bulletproof React Architecture Rule)
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: "./src/features/auth",
              from: "./src/features",
              except: ["./auth"],
            },
            {
              target: "./src/features/dashboard",
              from: "./src/features",
              except: ["./dashboard"],
            },
            {
              target: "./src/features/faculty",
              from: "./src/features",
              except: ["./faculty"],
            },
            {
              target: "./src/features/question-bank",
              from: "./src/features",
              except: ["./question-bank"],
            },
            {
              target: "./src/features/review-center",
              from: "./src/features",
              except: ["./review-center"],
            },
            {
              target: "./src/features/students",
              from: "./src/features",
              except: ["./students"],
            },
            {
              target: "./src/features/logs",
              from: "./src/features",
              except: ["./logs"],
            },
            {
              target: "./src/features/settings",
              from: "./src/features",
              except: ["./settings"],
            },
            {
              target: "./src/features/misc",
              from: "./src/features",
              except: ["./misc"],
            },

            // enforce unidirectional codebase:
            // e.g. src/app can import from src/features but not the other way around
            {
              target: "./src/features",
              from: "./src/app",
            },

            // e.g src/features and src/app can import from these shared modules but not the other way around
            {
              target: [
                "./src/components",
                "./src/hooks",
                "./src/lib",
                "./src/types",
                "./src/utils",
              ],
              from: ["./src/features", "./src/app"],
            },
          ],
        },
      ],
    },
  },
]);
