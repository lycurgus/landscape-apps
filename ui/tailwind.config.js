const defaultTheme = require('tailwindcss/defaultTheme');
const resolveConfig = require('tailwindcss/resolveConfig');
const { Theme, ThemeManager } = require('tailwindcss-theming/api');

const themableProperties = [
  'spacing',
  'fontFamily',
  //'fontSize', would require change in tailwindcss-theming
  'fontWeight',
  'letterSpacing',
  'lineHeight',
  'borderRadius',
  'borderWidth',
  'boxShadow',
];

function variablizeTheme(themeConfig, theme) {
  themableProperties.forEach((prop) => {
    const propSet = themeConfig[prop];
    Object.entries(propSet).forEach(([key, value]) => {
      theme.setVariable(key, value, prop, prop);
    });
  });
}

const config = resolveConfig({
  theme: {
    fontFamily: {
      sans: [
        'Inter',
        'Inter UI',
        '-apple-system',
        'BlinkMacSystemFont',
        'San Francisco',
        'Helvetica Neue',
        'Arial',
        'sans-serif',
      ],
      mono: ['Source Code Pro', 'Roboto mono', 'Courier New', 'monospace'],
    },
    extend: {
      lineHeight: {
        tight: 1.2,
        snug: 1.33334,
        relaxed: 1.66667,
      },
    },
  },
});

const base = new Theme().addColors({
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F5F5F5',
    100: '#E5E5E5',
    200: '#CCCCCC',
    300: '#B3B3B3',
    400: '#999999',
    500: '#808080',
    600: '#666666',
    700: '#4C4C4C',
    800: '#333333',
    900: '#1A1A1A',
  },
  red: {
    DEFAULT: '#FF6240',
    soft: '#FFEFEC',
  },
  orange: {
    DEFAULT: '#FF9040',
    soft: '#FFF4EC',
  },
  yellow: {
    DEFAULT: '#FADE7A',
    soft: '#FAF5D9',
  },
  green: {
    DEFAULT: '#2AD546',
    soft: '#EAFBEC',
  },
  blue: {
    DEFAULT: '#008EFF',
    soft: '#E5F4FF',
  },
  indigo: {
    DEFAULT: '#615FD3',
    soft: '#EFEFFB',
  },
});
variablizeTheme(config.theme, base);

const dark = new Theme()
  .setName('dark')
  .targetable()
  .addColors({
    transparent: 'transparent',
    white: '#000000',
    black: '#FFFFFF',
    gray: {
      50: '#1A1A1A',
      100: '#333333',
      200: '#4C4C4C',
      300: '#666666',
      400: '#808080',
      500: '#999999',
      600: '#B3B3B3',
      700: '#CCCCCC',
      800: '#E5E5E5',
      900: '#F5F5F5',
    },
    red: {
      DEFAULT: '#FF6240',
      soft: '#FFEFEC',
    },
    orange: {
      DEFAULT: '#FF9040',
      soft: '#FFF4EC',
    },
    yellow: {
      DEFAULT: '#FADE7A',
      soft: '#FAF5D9',
    },
    green: {
      DEFAULT: '#2AD546',
      soft: '#EAFBEC',
    },
    blue: {
      DEFAULT: '#008EFF',
      soft: '#E5F4FF',
    },
    indigo: {
      DEFAULT: '#615FD3',
      soft: '#EFEFFB',
    },
  });

const themes = new ThemeManager().setDefaultTheme(base).addTheme(dark);

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    fontSize: {
      xs: ['.625rem', '1rem'],
      sm: ['.75rem', '1rem'],
      base: ['.875rem', '1rem'],
      lg: ['1rem', '1.5rem'],
      xl: ['1.25rem', '2rem'],
      '2xl': ['1.5rem', '2rem'],
      '3xl': ['2rem', '3rem'],
    },
    extend: {
      minWidth: (theme) => theme('spacing'),
    },
  },
  screens: {
    ...defaultTheme.screens,
    xl: '1440px',
    '2xl': '2200px',
  },
  variants: {
    extend: {
      opacity: ['hover-none'],
      display: ['group-hover'],
    },
  },
  plugins: [
    require('tailwindcss-scoped-groups'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-theming')({
      themes,
      strategy: 'class',
    }),
  ],
};
