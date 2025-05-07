import axios from 'axios';
import { BACKEND_URL } from '../config/config';

// Reemplaza la definición de API_URL
const API_URL = BACKEND_URL;

// Crear instancia de axios con configuración base
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Configurar interceptor para añadir el token de autenticación a las peticiones
api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Función para login
export const loginUser = async (token) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  return response.json();
};

// Función para obtener proyectores
export const getProyectores = async () => {
  const response = await fetch(`${API_URL}/proyectores`);
  return response.json();
};

// Función para crear solicitud
export const createSolicitud = async (solicitudData) => {
  const response = await fetch(`${API_URL}/solicitudes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(solicitudData)
  });
  return response.json();
};
