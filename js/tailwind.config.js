/* ==========================================================================
   FETOC - Configuration Tailwind (CDN Play)
   Chargé juste après https://cdn.tailwindcss.com (script classique, non module)
   ========================================================================== */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        vert: {
          50: '#EDF7F1',
          100: '#D5EDE0',
          200: '#AFDBBF',
          300: '#7FC79E',
          400: '#4BAE7C',
          500: '#22905C',
          600: '#0E7048',
          700: '#0B5A3A',
          800: '#0A452C',
          900: '#083424',
          950: '#04211A'
        },
        soleil: {
          50: '#FFFBEB',
          100: '#FFF3C4',
          200: '#FFE68A',
          300: '#FFD64D',
          400: '#FFC72C',
          500: '#F0B100',
          600: '#C98A00',
          700: '#9C6800'
        },
        sable: {
          50: '#FAF8F3',
          100: '#F3EFE7',
          200: '#E7E0D2',
          300: '#D3C9B4'
        },
        encre: {
          DEFAULT: '#0B1A14',
          doux: '#3A4A42',
          clair: '#6B7B73'
        }
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif']
      },
      maxWidth: {
        ecran: '1536px',
        lecture: '70ch'
      },
      boxShadow: {
        doux: '0 1px 2px rgba(8,52,36,.04), 0 8px 24px -12px rgba(8,52,36,.16)',
        carte: '0 2px 4px rgba(8,52,36,.04), 0 18px 40px -22px rgba(8,52,36,.28)',
        haute: '0 30px 70px -30px rgba(8,52,36,.45)'
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      screens: {
        xs: '420px'
      },
      keyframes: {
        leve: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        flotte: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        defile: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        onde: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-25%)' }
        }
      },
      animation: {
        leve: 'leve .7s cubic-bezier(.22,1,.36,1) both',
        flotte: 'flotte 6s ease-in-out infinite',
        defile: 'defile 38s linear infinite',
        onde: 'onde 18s linear infinite'
      }
    }
  }
};
