import js from "@eslint/js"
import { defineConfig } from "eslint/config"
import tseslint from "typescript-eslint"
import reactPlugin from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import importPlugin from "eslint-plugin-import"
import globals from "globals"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const higherThanShared = [
  "app",
  "app/**",
  "pages",
  "pages/**",
  "widgets",
  "widgets/**",
  "features",
  "features/**",
  "entities",
  "entities/**",
  "@/app",
  "@/app/**",
  "@/pages",
  "@/pages/**",
  "@/widgets",
  "@/widgets/**",
  "@/features",
  "@/features/**",
  "@/entities",
  "@/entities/**"
]

const higherThanEntities = [
  "app",
  "app/**",
  "pages",
  "pages/**",
  "widgets",
  "widgets/**",
  "features",
  "features/**",
  "@/app",
  "@/app/**",
  "@/pages",
  "@/pages/**",
  "@/widgets",
  "@/widgets/**",
  "@/features",
  "@/features/**"
]

const higherThanFeatures = [
  "app",
  "app/**",
  "pages",
  "pages/**",
  "widgets",
  "widgets/**",
  "features",
  "features/**",
  "@/app",
  "@/app/**",
  "@/pages",
  "@/pages/**",
  "@/widgets",
  "@/widgets/**",
  "@/features",
  "@/features/**"
]

const higherThanWidgets = [
  "app",
  "app/**",
  "pages",
  "pages/**",
  "widgets",
  "widgets/**",
  "@/app",
  "@/app/**",
  "@/pages",
  "@/pages/**",
  "@/widgets",
  "@/widgets/**"
]

const higherThanPages = [
  "app",
  "app/**",
  "pages",
  "pages/**",
  "@/app",
  "@/app/**",
  "@/pages",
  "@/pages/**"
]

export default defineConfig(
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "node_modules/**",
      ".agents/**",
      ".claude/**",
      "public/config.js",
      "*.d.ts",
      "eslint.config.mjs"
    ]
  },

  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  {
    plugins: {
      "react-hooks": reactHooks
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  },

  {
    files: ["src/**/*.{ts,tsx}", "vite.config.ts"],
    languageOptions: {
      globals: {
        ...globals.browser
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname
      }
    },
    settings: {
      react: {
        version: "detect"
      },
      "import/resolver": {
        typescript: {
          project: ["./tsconfig.app.json", "./tsconfig.node.json"],
          alwaysTryTypes: true
        }
      }
    },
    plugins: {
      import: importPlugin
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],

      "import/no-unresolved": "error",
      "import/no-duplicates": "error",
      "import/no-self-import": "error",
      "import/no-cycle": "error",
      "import/no-useless-path-segments": ["error", { noUselessIndex: true }],

      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "type"
          ],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
              position: "before"
            },
            {
              pattern: "{app,pages,widgets,features,entities,shared}{,/**}",
              group: "internal",
              position: "before"
            }
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          alphabetize: {
            order: "asc",
            caseInsensitive: true
          },
          "newlines-between": "always"
        }
      ],

      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports"
        }
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: {
            attributes: false
          }
        }
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }
      ],

      /**
       * Публичный API:
       * - внутри своего slice используем относительные импорты
       * - между slice/layer используем только public API
       * - для shared/ui и shared/lib разрешаем подмодули
       * - для entities @x оставляем разрешение
       */
      "import/no-internal-modules": [
        "error",
        {
          allow: [
            "./**",
            "../**",
            "../../**",
            "../../../**",
            "../../../../**",
            "../../../../../**",

            "react-dom/*",
            "zod/*",

            "app/*",
            "app/**",
            "pages/*",
            "widgets/*",
            "features/*",
            "entities/*",

            "@/app/*",
            "@/app/**",
            "@/pages/*",
            "@/widgets/*",
            "@/features/*",
            "@/entities/*",

            "shared/ui/**",
            "shared/lib/**",
            "shared/api/**",
            "shared/config/**",

            "@/shared/ui/**",
            "@/shared/lib/**",
            "@/shared/api/**",
            "@/shared/config/**",

            "entities/*/@x/*",
            "@/entities/*/@x/*"
          ]
        }
      ]
    }
  },

  {
    files: ["vite.config.ts"],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },

  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: higherThanShared,
              message:
                "shared может импортировать только shared и внешние пакеты"
            }
          ]
        }
      ]
    }
  },

  {
    files: ["src/entities/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: higherThanEntities,
              message:
                "entities не могут импортировать features/widgets/pages/app"
            }
          ]
        }
      ]
    }
  },

  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: higherThanFeatures,
              message:
                "features могут импортировать только entities/shared и внешние пакеты"
            }
          ]
        }
      ]
    }
  },

  {
    files: ["src/widgets/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: higherThanWidgets,
              message: "widgets не могут импортировать widgets/pages/app"
            }
          ]
        }
      ]
    }
  },

  {
    files: ["src/pages/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: higherThanPages,
              message: "pages не могут импортировать pages/app"
            }
          ]
        }
      ]
    }
  },

  // Slice index.ts files re-export from internal segments (ui/, model/, api/, lib/)
  // This is the standard FSD public API pattern
  {
    files: [
      "src/pages/*/index.ts",
      "src/widgets/*/index.ts",
      "src/features/*/index.ts",
      "src/entities/*/index.ts"
    ],
    rules: {
      "import/no-internal-modules": "off"
    }
  }
)
