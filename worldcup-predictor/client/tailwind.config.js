/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background system
        'bg-primary': '#0a0e17',
        'bg-secondary': '#111827',
        'bg-card': '#1a2332',
        'bg-card-hover': '#1f2b3d',
        'bg-elevated': '#243044',
        
        // Accent colors
        'accent-gold': '#d4af37',
        'accent-gold-light': '#f4d03f',
        'accent-blue': '#3b82f6',
        'accent-green': '#10b981',
        'accent-red': '#ef4444',
        'accent-purple': '#8b5cf6',
        'accent-orange': '#f59e0b',
        
        // Text system
        'text-primary': '#f8fafc',
        'text-secondary': '#94a3b8',
        'text-muted': '#64748b',
        'text-inverse': '#0a0e17',
        
        // Border
        'border-color': '#1e293b',
        'border-hover': '#374151',
      },
      fontFamily: {
        'display': ['Oswald', 'sans-serif'],
        'body': ['Inter', 'Noto Sans SC', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'glow': '0 0 40px rgba(212, 175, 55, 0.15)',
        'glow-strong': '0 0 60px rgba(212, 175, 55, 0.25)',
        'glow-sm': '0 0 20px rgba(212, 175, 55, 0.1)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)',
        'gradient-blue': 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0a0e17 0%, #111827 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
      },
      zIndex: {
        'dropdown': '100',
        'sticky': '200',
        'fixed': '300',
        'modal': '400',
        'popover': '500',
        'tooltip': '600',
      },
    },
  },
  plugins: [],
}
