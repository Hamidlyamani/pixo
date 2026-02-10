import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
				'h1': ['36px', { lineHeight: '40px' }],
				'h1_b': ['40px', { lineHeight: "1.2" }],
				'h2-2': ['30px', { lineHeight: '1.2' }],
				'h3': ['24px', { lineHeight: '1.2'}],
				'h4': ['20px',{}],
				'p-large': ['18px', { lineHeight: '22px' }],
				'p': ['16px',{}],
				'p-small': ['14px',{}],
				'tag': ['12px', { lineHeight: '12px' }],
				'tag-small': ['10px', { lineHeight: '10px' }],
			},
			colors: {
				primary: {
					DEFAULT: '#73c2fb',
					foreground: '#73c2fb'
				},
				yallow: '#D6ED2F',
      }
    },
  },
  plugins: [],
};
export default config;
