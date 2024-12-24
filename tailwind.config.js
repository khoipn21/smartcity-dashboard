/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: {
					light: "#A2BFC7",
					DEFAULT: "#2E6583",
					dark: "#2B4E64",
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
