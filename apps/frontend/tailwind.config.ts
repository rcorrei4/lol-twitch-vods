import { createGlobPatternsForDependencies } from '@nx/react/tailwind';
import { join } from 'path';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app,application}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6F2DBD',
        secondary: '#282C33',
        'gray-one': '#0F1216',
        'gray-two': '#181C23',
        'gray-three': '#282C33',
        'gray-four': '#383C44',
        'gray-five': '#5E605F',
        'gray-six': '#828282',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
    plugins: [],
  },
};
