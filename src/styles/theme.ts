import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  globalCss: {
    'html, body, #root': {
      margin: 0,
      padding: 0,
      color: 'gray.800',
      background: '#edf1f5',
    },
    'button, [data-scope="button"][data-part="root"]': {
      transition: 'none !important',
      transform: 'none !important',
      boxShadow: 'none !important',
      filter: 'none !important',
    },
    'button:hover, [role="button"]:hover, [data-scope="button"][data-part="root"]:hover': {
      transition: 'none !important',
      transform: 'none !important',
      boxShadow: 'none !important',
      filter: 'none !important',
      opacity: '1 !important',
    },
    '[role="dialog"] button': {
      transition: 'none !important',
      transform: 'none !important',
      boxShadow: 'none !important',
    },
    '[role="dialog"] button:hover': {
      transition: 'none !important',
      transform: 'none !important',
      boxShadow: 'none !important',
      filter: 'none !important',
    },
    '[role="dialog"] [role="option"]:hover': {
      background: 'white !important',
      color: 'inherit !important',
    },
    '[role="dialog"] [role="option"][data-highlighted]': {
      background: 'white !important',
      color: 'inherit !important',
    },
    '[role="dialog"] [data-scope="tabs"][data-part="trigger"]:hover': {
      background: 'inherit !important',
      color: 'inherit !important',
    },
  },
  theme: {
    tokens: {
      colors: {
        brand: {
          '500': { value: 'tomato' },
        },
      },
      fonts: {
        body: {
          value: `'Poppins', system-ui, -apple-system, BlinkMacSystemFont, sans-serif`,
        },
      },
    },
    semanticTokens: {
      colors: {
        bg: { value: '#000000ff' },
        text: { value: '#000000' },
      },
      shadows: {
        lightGray: { value: '0px -1px 0px rgba(0, 0, 0, 0.03), 0px 6px 12px rgba(0, 0, 0, 0.21)' },
        lighterGray: {
          value: '0px -1px 0px rgba(0, 0, 0, 0.03), 0px 6px 12px rgba(0, 0, 0, 0.09)',
        },
      },
    },
    recipes: {
      button: {
        base: {
          fontWeight: '600',
          borderRadius: 'md',
          transitionProperty: 'none',
          transitionDuration: '0ms',
          transitionTimingFunction: 'linear',
          cursor: 'pointer',
          _disabled: {
            opacity: 0.5,
            cursor: 'not-allowed',
          },
        },
        variants: {
          solid: {
            _active: {
              transform: 'translateY(0)',
            },
          },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
