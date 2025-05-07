import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { AUTH_CONSTANTS } from '../constants/auth';
import { gapi } from 'gapi-script';

// Constantes de GAPI
const CLIENT_ID = "886510955429-fhmlsaufc5j85uhbuk1gb1skcsp89632.apps.googleusercontent.com";
const API_KEY = "AIzaSyCGngj5UlwBeDeynle9K-yImbSTwfgWTFg";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

export const useAuth = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isAdmin: false,
    user: null,
    userPicture: null,
    isLoading: true,
  });
  
  const navigate = useNavigate();

  const updateAuthState = useCallback((updates) => {
    setAuthState(prev => ({
      ...prev,
      ...updates,
      isLoading: false
    }));
  }, []);

  const handleError = useCallback((error) => {
    console.error('Auth Error:', error);
    
    setAuthState({
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      userPicture: null,
      isLoading: false
    });

    Swal.fire({
      icon: 'error',
      title: 'Error de autenticación',
      text: error.message || 'Ha ocurrido un error inesperado'
    });

    if (window.location.pathname !== '/signin') {
      const currentPath = window.location.pathname;
      // Verificar si estamos en un portal de escuela
      if (currentPath.includes('/escuela/')) {
        // Extraer el ID de la escuela de la URL
        const escuelaId = currentPath.split('/escuela/')[1].split('/')[0];
        navigate(`/escuela/${escuelaId}/signin`, { replace: true });
      } else {
        navigate('/signin', { replace: true });
      }
    }
  }, [navigate]);

  const handleLoginSuccess = useCallback(async (response) => {
    try {
      if (!response?.credential) {
        throw new Error('No se recibió credencial de Google');
      }

      const decoded = jwtDecode(response.credential);
      console.log('Google credential decoded:', decoded);
      
      sessionStorage.setItem('googleAccessToken', response.credential);
      console.log('Token de Google guardado:', response.credential.substring(0, 20) + '...');

      const authResponse = await authService.login(response.credential, decoded.picture);
      
      if (!authResponse?.user) {
        throw new Error('No se recibió información del usuario');
      }

      sessionStorage.setItem('currentUser', JSON.stringify(authResponse.user));
      sessionStorage.setItem('jwtToken', authResponse.token);
      
      const isAdmin = authResponse.user.isAdmin || AUTH_CONSTANTS.ADMIN_EMAILS.includes(decoded.email);
      console.log("¿Usuario es administrador?", isAdmin);
      
      setAuthState({
        isAuthenticated: true,
        isAdmin,
        user: authResponse.user,
        userPicture: decoded.picture,
        isLoading: false,
      });

      Swal.fire({
        icon: 'success',
        title: `Bienvenido${isAdmin ? ' Administrador' : ''}`,
        text: `Has iniciado sesión como ${decoded.email}`,
        timer: 2000,
        showConfirmButton: false
      });

      const currentPath = window.location.pathname;
      if (currentPath.includes('/escuela/')) {
        console.log('aver ver')
        const escuelaId = currentPath.split('/escuela/')[1].split('/')[0];
        navigate(`/escuela/${escuelaId}/dashboard`, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }

    } catch (error) {
      console.error('Login error:', error);
      handleError(error);
    }
  }, [navigate, handleError]);

  const initializeGapi = useCallback(async () => {
    try {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = resolve;
        document.body.appendChild(script);
      });
      console.log('Inicializando GAPI...');
      await gapi.load('client:auth2', async () => {
        await gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        });
          console.log('Gapi inicializado correctamente');
          updateAuthState({
            isAuthenticated: false,
            isAdmin: false,
            user: null,
            userPicture: null
          });
        //}
      });
    } catch (error) {
      handleError(error);
    }
  }, [handleLoginSuccess, handleError]);

  const checkAuth = useCallback(async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        console.log('check session - useAuth - SI hay usuario');
        setAuthState({
          isAuthenticated: true,
          isAdmin: currentUser.isAdmin,
          user: currentUser,
          userPicture: currentUser.picture,
          isLoading: false
        });
      } else {
        console.log('check session - useAuth - SI hay usuario');
        await initializeGapi();
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          user: null,
          userPicture: null,
          isLoading: false
        });
      }
      console.log('check session - useAuth')
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const handleLogout = useCallback(async () => {
    try {
      // Inicialización de GAPI en una función separada
      const initializeGapiAuth = async () => {
        if (!window.gapi?.auth2) {
          await new Promise((resolve) => {
            gapi.load('client:auth2', async () => {
              await gapi.client.init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: DISCOVERY_DOCS,
                scope: SCOPES
              });
              resolve();
            });
          });
        }
      };

      // Esperar a que GAPI se inicialice completamente
      await initializeGapiAuth();

      // Ahora podemos obtener la instancia de auth2 con seguridad
      const auth2 = gapi.auth2.getAuthInstance();
      if (auth2) {
        await auth2.signOut();
      }
      
      await authService.logout();
      setAuthState({
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        userPicture: null,
        isLoading: false
      });
      
      const currentPath = window.location.pathname;
      // Verificar si estamos en un portal de escuela
      if (currentPath.includes('/escuela/')) {
        // Extraer el ID de la escuela de la URL
        const escuelaId = currentPath.split('/escuela/')[1].split('/')[0];
        navigate(`/escuela/${escuelaId}/signin`, { replace: true });
      } else {
        navigate('/signin', { replace: true });
      }
    } catch (error) {
      console.error('Logout error:', error);
      handleError(error);
    }
  }, [navigate, handleError]);

  const handleGoogleLogin = useCallback(async () => {
    try {
      const auth2 = gapi.auth2.getAuthInstance();
      const googleUser = await auth2.signIn();
      const token = googleUser.getAuthResponse().id_token;
      const tokenGoogle = googleUser.getAuthResponse().access_token;
      sessionStorage.setItem('accessRequest', tokenGoogle);
      await handleLoginSuccess({ credential: token });
    } catch (error) {
      console.error('Error en login de Google:', error);
      handleError(error);
    }
  }, [handleLoginSuccess, handleError]);

  const updateUserData = useCallback((updatedData) => {
    // Actualizar el estado local
    setAuthState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        ...updatedData
      }
    }));
    
    // También actualizar en sessionStorage para persistencia
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        ...updatedData
      };
      sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...authState,
    handleLoginSuccess,
    handleLogout,
    checkAuth,
    handleGoogleLogin,
    updateUserData
  };
};