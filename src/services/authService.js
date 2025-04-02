import axios from 'axios';
import { AUTH_CONFIG } from '../config/config';
import { gapi } from 'gapi-script';
import Swal from 'sweetalert2';
import { AUTH_CONSTANTS } from '../constants/auth';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: AUTH_CONFIG.API_BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': true
      }
    });

    // Interceptor para manejar errores
    this.api.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        // Condiciones para intentar renovar el token
        const is401Error = error.response?.status === 401;
        const isNotRefreshTokenEndpoint = originalRequest.url !== '/refresh-token';
        const hasNotExceededRetries = !originalRequest._retryCount || originalRequest._retryCount < 2;

        if (is401Error && isNotRefreshTokenEndpoint && hasNotExceededRetries) {
          // Incrementar el contador de reintentos
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
          
          try {
            // Intentar renovar el token
            const response = await this.refreshToken();
            
            if (response?.data?.token) {
              // Actualizar token en sesión y encabezados
              this._handleAuthResponse(response.data);
              
              // Clonar y actualizar la configuración original
              const updatedConfig = {
                ...originalRequest,
                headers: {
                  ...originalRequest.headers,
                  Authorization: `Bearer ${response.data.token}`
                }
              };

              // Reintentar la solicitud original
              return this.api(updatedConfig);
            }
          } catch (refreshError) {
            console.error('Error al renovar token:', refreshError);
            // Limpiar autenticación y redirigir
            this._clearAuth();
            // Mostrar la alerta personalizada
            Swal.fire({
              icon: 'error',
              title: 'Es necesario volver a iniciar sesión',
              text:  'Token expirado',
              timer: 3000,
              showConfirmButton: false,
            }).then(() => {
              // Redirigir al usuario después de cerrar la alerta
              window.location.href = '/login';
            });
            // Rechazar la promesa para detener cualquier reintento adicional
            return Promise.reject(refreshError);
          }
        }

        // Para cualquier otro caso de error, rechazar la promesa
        return Promise.reject(error);
      }
    );


    this.api.interceptors.request.use(config => {
      const token = sessionStorage.getItem('jwtToken');
      // Evitar configurar encabezados globales en solicitudes de refresh
      if (token && config.url !== '/refresh-token') {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Cargar la lista de administradores al inicializar
    this.loadAdminEmails();
  }

  setAuthHeader(token) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  getAuthHeaderWithRefreshToken() {
    const token = sessionStorage.getItem(AUTH_CONSTANTS.STORAGE_KEYS.JWT_REFRESH_TOKEN);
    if (!token) {
      // En lugar de lanzar error, devolver null o un objeto vacío
      return {};
    }
    return { Authorization: `Bearer ${token}` };
  }

  async login(googleCredential, userPicture) {
    try {
      const response = await this.api.post('/login', {
        token: googleCredential,
        picture: userPicture
      });

      if (!response.data?.token) {
        throw new Error('No se recibió token del servidor');
      }

      // Guardar datos de autenticación
      this._handleAuthResponse(response.data);
      
      // Verificar si el usuario necesita completar registro
      const tutor = response.data.user;
      const needsRegistration = !tutor.registroCompleto;

      return {
        ...response.data,
        needsRegistration
      };
    } catch (error) {
      console.error('Error detallado en login:', error.response?.data || error.message);
      throw this._handleError(error);
    }
  }

  async checkSession() {
    try {
      const token = this.getStoredToken();
      if (!token) {
        console.log('check session - no token - authServices')
        return { authenticated: false };
      }

      this.setAuthHeader(token);
      const response = await this.api.get('/check-session');
      
      // Verificar que los datos del tutor estén completos
      const tutor = response.data.user;
      const datosCompletos = tutor && 
                           tutor.numeroContacto && 
                           tutor.direccion && 
                           tutor.numeroEmergencia;
      
      return { 
        ...response.data, 
        authenticated: true,
        datosCompletos
      };
    } catch (error) {
      console.error("Error en checkSession:", error);
      return { authenticated: false, error };
    }
  }

  async logout() {
    try {
      await this.api.post('/logout');
      this._clearAuth();
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async updateUserProfile(data) {
    try {
      const token = this.getStoredToken();
      this.setAuthHeader(token);
      const response = await this.api.put('/tutores/update', data);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  isAdmin(email) {
    // Intentar obtener la lista actualizada del sessionStorage
    const storedAdminEmails = sessionStorage.getItem(AUTH_CONSTANTS.STORAGE_KEYS.ADMIN_EMAILS);
    if (storedAdminEmails) {
      try {
        const adminEmails = JSON.parse(storedAdminEmails);
        return adminEmails.includes(email);
      } catch (e) {
        console.error('Error al parsear la lista de administradores:', e);
      }
    }
    
    // Si no hay lista en sessionStorage, usar la constante
    return AUTH_CONSTANTS.ADMIN_EMAILS.includes(email);
  }

  getStoredToken() {
    return sessionStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.JWT_TOKEN);
  }

  _handleAuthResponse(data) {
    if (data.token) {
      sessionStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.JWT_TOKEN, data.token);
      if(data.refreshToken) {
        sessionStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.JWT_REFRESH_TOKEN, data.refreshToken);
      }
      this.setAuthHeader(data.token);
    }

    if (data.user) {
      const userData = {
        ...data.user,
        picture: data.user.picture || sessionStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER_PICTURE),
        registroCompleto: data.user.registroCompleto
      };
      sessionStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    }
  }

  _clearAuth() {
    sessionStorage.clear();
    localStorage.clear();
    this.setAuthHeader(null);
  }

  _handleError(error) {
    if (error.response) {
      console.error('Server Error:', error.response.data);
      return error.response.data;
    } else if (error.request) {
      console.error('Network Error:', error.request);
      return { message: 'Error de conexión al servidor' };
    } else {
      console.error('Auth Error:', error.message);
      return { message: error.message };
    }
  }

  // Agregar método para renovar token
  async refreshToken() {
    try {
      const headers = this.getAuthHeaderWithRefreshToken();
      // Si no hay refresh token, no intentar renovar
      if (!Object.keys(headers).length) {
        return null;
      }
      return await this.api.post('/refresh-token', {}, { headers });
    } catch (error) {
      console.error('Error al renovar token:', error);
      return null;
    }
  }

  getToken() {
    return sessionStorage.getItem('jwtToken');
  }

  // Método para cargar la lista de administradores
  async loadAdminEmails() {
    try {
      const response = await this.api.get('/api/admin-emails');
      if (response.data && response.data.adminEmails) {
        // Guardar en sessionStorage
        sessionStorage.setItem(
          AUTH_CONSTANTS.STORAGE_KEYS.ADMIN_EMAILS, 
          JSON.stringify(response.data.adminEmails)
        );
        // Actualizar la constante
        AUTH_CONSTANTS.ADMIN_EMAILS = response.data.adminEmails;
      }
    } catch (error) {
      console.error('Error al cargar la lista de administradores:', error);
      // Si falla, se usa la lista predeterminada
    }
  }

  getCurrentUser() {
    try {
      const userStr = sessionStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER_DATA);
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      return {
        ...user,
        registroCompleto: Boolean(user.registroCompleto)
      };
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  }

  // También agregar este método para verificar si el usuario necesita completar registro
  needsRegistration() {
    const user = this.getCurrentUser();
    return user && !user.registroCompleto;
  }

  async updateUserData(data) {
    try {
      // Actualizar datos en sessionStorage
      const currentUser = this.getCurrentUser();
      const updatedUser = {
        ...currentUser,
        ...data
      };
      sessionStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      
      // Forzar una actualización del estado de autenticación
      return updatedUser;
    } catch (error) {
      console.error('Error al actualizar datos del usuario:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();