/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 패션/스타일 톤: 채도 낮은 로즈-샌드 계열
        studio: {
          50: '#faf7f5',
          100: '#f1e9e4',
          200: '#e2d0c6',
          300: '#ceae9d',
          400: '#b48871',
          500: '#9c6c53',
          600: '#835844',
          700: '#6b4838',
          800: '#583c30',
          900: '#4a332b',
          950: '#291a15'
        },
        alert: {
          amber: '#b7791f',
          red: '#b3423a'
        }
      },
      fontFamily: {
        sans: ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
