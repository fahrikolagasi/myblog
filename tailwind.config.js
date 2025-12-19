/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable manual dark mode toggle
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            },
            colors: {
                // Semantic Colors
                primary: {
                    light: '#3b82f6', // Bright Blue
                    dark: '#60a5fa',
                },
                surface: {
                    light: '#ffffff',
                    dark: '#18181b', // Zinc-900
                },
                background: {
                    light: '#f4f4f5', // Zinc-100
                    dark: '#09090b',  // Zinc-950
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
}
