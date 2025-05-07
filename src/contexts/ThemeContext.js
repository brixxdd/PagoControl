import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import { alertService } from '../services/alertService';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserTheme = async () => {
      console.log('Verificando cuantas veces se usa ThemeContext.js en el runtime')
      try {
        const token = sessionStorage.getItem('jwtToken');
        let themeData;
        
        if (token) {
          const response = await authService.api.get('/user-theme');
          themeData = response.data;
        } else {
          const lastTheme = await authService.api.get('/last-theme');
          themeData = lastTheme.data;
        }

        if (themeData) {
          setCurrentTheme(themeData.theme || 'default');
          setDarkMode(themeData.darkMode);
          document.documentElement.classList.toggle('dark', themeData.darkMode);
        }
      } catch (error) {
        console.error('Error al cargar el tema:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserTheme();
  }, []); // Remover dependencias para que solo se ejecute al montar

  const changeTheme = async (newTheme) => {
    try {
      // Verificar si hay un token válido
      const token = sessionStorage.getItem('jwtToken');
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      await authService.api.put('/update-theme', { 
        theme: newTheme,
        darkMode
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setCurrentTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      document.documentElement.classList.toggle('dark', darkMode);
    } catch (error) {
      console.error('Error al actualizar el tema:', error);
      // Si es error de autenticación, redirigir al login
      if (error.response?.status === 401) {
        sessionStorage.removeItem('jwtToken');
        window.location.href = '/signin';
        return;
      }
      if (alertService.canShowAlert('theme-error')) {
        toast.error('Error al actualizar el tema');
      }
    }
  };

  const toggleDarkMode = async (isDark) => {
    try {
      setDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
      
      // Actualizar en el backend con el tema actual
      await authService.api.put('/update-theme', {
        theme: currentTheme,
        darkMode: isDark
      });

      // No mostrar toast para una experiencia más fluida
    } catch (error) {
      console.error('Error al cambiar modo oscuro:', error);
      setDarkMode(!isDark); // Revertir en caso de error
      document.documentElement.classList.toggle('dark', !isDark);
      toast.error('Error al cambiar modo oscuro');
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ 
      currentTheme, 
      changeTheme,
      darkMode,
      toggleDarkMode 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

/*export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};*/

export const useTheme = () => {
  const context = useContext(ThemeContext);
  const { escuelaId } = useParams();
  if (!context) {
    if(escuelaId){
      // Si no hay provider,devolvemos no-op para los setters
      return {
        currentTheme: 'escuela',
        changeTheme: () => {},
        darkMode:     false,
        toggleDarkMode: () => {},
      };
    }else throw new Error('useTheme must be used within a ThemeProvider');
    
  }
  return context;
};