/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'db-ticket-blue': '#e4f6fa',
        'db-red': '#ec0016',
      }
    },
  },
  plugins: [
    require("daisyui"),
  ],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#ec0016",
          // "secondary": "#e4f6fa",
          "base-100": "#ffffff",
        },
      },
    ],
  }
}

