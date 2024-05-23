/** @type {import('tailwindcss').Config}*/
const config = {
  content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],

  plugins: [require('flowbite/plugin')],

  darkMode: 'selector',

  theme: {
    extend: {
      colors: {
        // flowbite-svelte
        primary: {
          50: '#FFF5F2',
          100: '#FFF1EE',
          200: '#FFE4DE',
          300: '#FFD5CC',
          400: '#FFBCAD',
          500: '#FE795D',
          600: '#EF562F',
          700: '#EB4F27',
          800: '#CC4522',
          900: '#A5371B'
        },
        red: {
          50: '#FFF5F5',
          100: '#FFEBEB',
          200: '#FFD6D6',
          300: '#FFC0C0',
          400: '#FF8B8B',
          500: '#FF0000',
          600: '#F50000',
          700: '#E50000',
          800: '#BF0000',
          900: '#990000'
        },
        green: {
          50: '#F2FDF9',
          100: '#E6FBF3',
          200: '#C0F4E0',
          300: '#99EDCC',
          400: '#4DEAA6',
          500: '#00E781',
          600: '#00D872',
          700: '#00C666',
          800: '#00A14D',
          900: '#007B39'
        }
      }
    }
  }
};

module.exports = config;
