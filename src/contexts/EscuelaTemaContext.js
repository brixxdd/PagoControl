import React, { createContext, useContext, useEffect } from 'react';
import { useEscuelaTema } from '../hooks/useEscuelaTema';

const EscuelaTemaContext = createContext();

export const EscuelaTemaProvider = ({ children, tema }) => {
  // Aplicar las variables CSS basadas en el tema
  useEscuelaTema(tema);
  //lolita la trailera
  // Guardar el tema actual global y aplicar el de escuela
  /*
  //Solo usarlo por si no se recarga la pagina
  useEffect(() => {
    // Guardar el tema global actual antes de cambiarlo
    const prevTheme = document.documentElement.getAttribute('data-theme');
    console.log('Tema global en EscuelaContext.js',prevTheme)
    
    // Desactivar las clases dark/light del ThemeContext para evitar conflictos
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      console.log('Si hay dark en EscuelaContext.js')
      //sessionStorage.setItem('was-dark-mode', 'true');
      document.documentElement.classList.remove('dark');
    } else {
      console.log('No hay dark en EscuelaContext.js')
      //sessionStorage.setItem('was-dark-mode', 'false');
    }
    
    // Limpiar tema global mientras estamos en contexto de escuela
    document.documentElement.removeAttribute('data-theme');
    
    return () => {
      // Restaurar tema global al salir
      const prevGlobalTheme = sessionStorage.getItem('prev-global-theme');
      if (prevGlobalTheme) {
        //document.documentElement.setAttribute('data-theme', prevGlobalTheme);
      }
      
      // Restaurar modo oscuro si estaba activo
      const wasDarkMode = sessionStorage.getItem('was-dark-mode');
      if (wasDarkMode === 'true') {
        //document.documentElement.classList.add('dark');
      }
    };
  }, []);*/
  
  return (
    <EscuelaTemaContext.Provider value={{ tema }}>
      {children}
    </EscuelaTemaContext.Provider>
  );
};

export const useEscuelaTheme = () => {
  const context = useContext(EscuelaTemaContext);
  if (!context) {
    throw new Error('useEscuelaTheme debe usarse dentro de un EscuelaTemaProvider');
  }
  return context;
};
