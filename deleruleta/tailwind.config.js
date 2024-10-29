/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        // Simple 16 col grid
        '16': 'repeat(16, minmax(0, 1fr))',
      },
     fontFamily: {
      montserrat: ['Montserrat', 'sans-serif']
     },
     keyframes: {
      appear: {
       '0%': { marginLeft: '-50vw' },
       '100%': { marginLeft: '0vw' }
      },
      disappear: {
       '0%': { marginLeft: '0vw' },
       '100%': { marginLeft: '-50vw' }
      }
     },
     animation: {
      appear: 'appear 0.8s 1',
      disappear: 'disappear 0.8s 1'
     },
     colors: {
      'dele-primary': '#3BC4A0', // Color de la delegación EPS
      'dele-accent': '#FF6D2E', // Color de acento de la delegación EPS    
      },
    },
   },
  plugins: [],
}

