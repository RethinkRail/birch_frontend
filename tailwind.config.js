/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",

        // Or if using `src` directory:
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            screens: {
                'sm': '100px',
                'md': '700px',
                'lg': '1400px',
            },
            colors: {
                'light-blue': "#DCE5FF",
                'theme-blue':"#002E54"
            }
        },

        fontFamily: {
            'custom': ['Inter', 'Inter', 'sans'],
        },
    },
    daisyui: {
        themes: [
            {
                mytheme: {
                    "primary": "#002E54",
                    "secondary": "#463aa1",
                    "accent": "#c149ad",
                    "neutral": "#021431",
                    "base-100": "#ffffff",
                    "info": "#93e6fb",
                    "success": "#80ced1",
                    "warning": "#efd8bd",
                    "error": "#e58b8b",
                    "transparent": "#fff0"
                },
            },
        ],
    },
    plugins: [require("daisyui")

    ],
}

