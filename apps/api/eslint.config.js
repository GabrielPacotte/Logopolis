import { configApp } from '@adonisjs/eslint-config'

export default [
  ...configApp(),
  {
    rules: {
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
    },
  },
]
