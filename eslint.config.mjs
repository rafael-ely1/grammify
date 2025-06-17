import eslint from "@eslint/js"
import tseslint from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import reactPlugin from "eslint-plugin-react"
import reactHooksPlugin from "eslint-plugin-react-hooks"
import globals from "globals"

export default [
  eslint.configs.recommended,
  {
    ignores: [
      ".next/**/*",
      "node_modules/**/*",
      "dist/**/*",
      "build/**/*"
    ]
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
        React: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "react": reactPlugin,
      "react-hooks": reactHooksPlugin
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": ["warn", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      
      // React rules
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // Base rules
      "no-unused-vars": "off", // Use @typescript-eslint/no-unused-vars instead
      "no-undef": "off" // TypeScript handles this
    }
  }
]
