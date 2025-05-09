/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Aquí le indicamos a Tailwind que escanee los archivos dentro de la carpeta src
  ],
  theme: {
    extend: {
      
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        'modal-slide-up': {
          '0%': { transform: 'translateY(100px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' }
        }
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
        'modal-slide-up': 'modal-slide-up 0.3s ease-out',
        'shake': 'shake 0.5s ease-in-out'
      },
      colors: {
        'escuela-primary': 'var(--color-primario, #3B82F6)',
        'escuela-secondary': 'var(--color-secundario, #6366F1)',
        'escuela-text': 'var(--color-texto, #1F2937)',
        'escuela-bg': 'var(--color-fondo, #F9FAFB)',
        'escuela-bg-secondary': 'var(--color-fondo-secundario, #F3F4F6)',
        'escuela-border': 'var(--color-borde, #E5E7EB)',
        'escuela-error': 'var(--color-error, #EF4444)',
        'escuela-success': 'var(--color-exito, #10B981)',
        'escuela-warning': 'var(--color-advertencia, #F59E0B)',
        'escuela-info': 'var(--color-info, #3B82F6)',
        'escuela-gradient': 'var(--color-info, #3B82F6)',
        'escuela-text-subtitulos': 'var(--color-subtitulos, #1c1c1c)',
        'escuela-text-titulos': 'var(--color-titulos, #1c1c1c)',
        'escuela-text-elementos': 'var(--color-texto-elementos, #1c1c1c)',
      },
      borderRadius: {
        'escuela-button': 'var(--button-radius, 0.375rem)',
        'escuela-card': 'var(--card-radius, 0.5rem)',
      },
      boxShadow: {
        'escuela-button': 'var(--button-shadow, 0 1px 2px rgba(0, 0, 0, 0.05))',
        'escuela-card': 'var(--card-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1))',
      },
      fontFamily: {
        'escuela-body': 'var(--font-family, "Roboto", sans-serif)',
        'escuela-title': 'var(--font-titles, "Montserrat", sans-serif)',
      },
      padding: {
        'escuela-button': 'var(--button-padding, 0.75rem 1.5rem)',
        'escuela-card': 'var(--card-padding, 1.5rem)',
      },
      backgroundImage: {
        'escuela-pattern': 'var(--bg-pattern)',
        'escuela-image': 'var(--bg-image)',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
