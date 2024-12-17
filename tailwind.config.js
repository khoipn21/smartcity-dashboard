/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: {
					light: "#6EE7B7",
					DEFAULT: "#10B981",
					dark: "#059669",
				},
				secondary: {
					light: "#818CF8",
					DEFAULT: "#6366F1",
					dark: "#4F46E5",
				},
			},
			maxWidth: {
				"8xl": "1920px",
			},
			fontFamily: {
				merienda: ["Merienda", "cursive"],
			},
		},
	},
	plugins: [],
};
