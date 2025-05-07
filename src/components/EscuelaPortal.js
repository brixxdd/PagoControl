// src/components/EscuelaPortal.js
import React, { useState, useEffect } from 'react';
import { useParams, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import SignIn from './SignIn';
import SidebarSchool from './SidebarSchool';
import RegistroNino from './RegistroNino';
import EscuelaDashboard from './EscuelaDashboard';
import { EscuelaTemaProvider } from '../contexts/EscuelaTemaContext';
import AdminSolicitudesInscripcion from './AdminSolicitudesInscripcion';
import AdminSidebarSchool from './AdminSidebarSchool';


const EscuelaPortal = ({ isAuthenticated, isAdmin }) => {
  const { escuelaId } = useParams();
  const navigate = useNavigate();
  const [escuela, setEscuela] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ruta = isAdmin
    ? `/api/escuelas/${escuelaId}`          // si es admin
    : `/api/escuela-config/${escuelaId}`;   // si no lo es

  useEffect(() => {
    console.log('Estamos en el portal de una escuela...')
    const fetchEscuelaConfig = async () => {
      try {
        setLoading(true);
        const response = await authService.api.get(ruta);
        setEscuela(response.data);
        
        // Configura el título de la página
        document.title = `${response.data.nombre} - Portal`;
        
      } catch (error) {
        console.error('Error al cargar configuración de escuela:', error);
        setError('Esta escuela no existe o no está disponible');
        // Si hay error, limpiar el contexto de escuela
        sessionStorage.removeItem('currentEscuelaContext');
      } finally {
        setLoading(false);
      }
    };

    fetchEscuelaConfig();
    
    return () => {
      document.title = 'Sistema de Control';
    };
  }, [escuelaId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <Navigate to="/" replace />;
    /*(
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          {/*<button 
            onClick={() => window.location.href = '/'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >}
          <button 
            onClick={() => navigate('/', { replace: true })}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );*/
  }

  const getHeaderStyles = () => {
    return {
      background: `linear-gradient(to right, var(--color-primario), var(--color-secundario))`,
      color: `var(--color-texto, #1F2937)`,
      boxShadow: escuela.tema.componentes?.header?.sombra || '0 1px 3px rgba(0,0,0,0.12)'
    };
  };

  const getFooterStyles = () => {
    return {
      backgroundColor: `var(--color-fondo-secundario, #F3F4F6)`,
      color: `var(--color-texto, #4B5563)`,
      borderTop: `1px solid var(--color-borde, #E5E7EB)`
    };
  };

  return (
    <EscuelaTemaProvider tema={escuela.tema}>
      <div className="min-h-screen flex flex-col" 
      style={{ 
        backgroundColor: `var(--color-fondo, #F9FAFB)`,
        backgroundImage: escuela.tema?.imagenes?.fondo ? `var(--bg-image)` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        isolation: "isolate"
      }}>
        
        {/*isAuthenticated && !isAdmin && <SidebarSchool />*/}
        {isAuthenticated && (
          isAdmin
            ? <AdminSidebarSchool />
            : <SidebarSchool />
        )}

        {/* Cabecera personalizada para la escuela */}
        <header 
          className="shadow-md p-4"
          style={getHeaderStyles()}
        >
          <div className="container mx-auto flex items-center gap-4">
            {escuela.logoUrl && (
              <img 
                src={escuela.logoUrl} 
                alt={escuela.nombre}
                className="h-10 object-contain"
              />
            )}
            <h1 className="text-xl font-bold text-white">
              {escuela.nombre}
            </h1>
          </div>
        </header>
        
        {/* Contenido principal - Aquí irán las rutas específicas */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={
              isAuthenticated ? 
                <Navigate to={`/escuela/${escuelaId}/dashboard`} replace /> : 
                <Navigate to={`/escuela/${escuelaId}/signin`} replace />
            } />
            <Route path="/dashboard" element={
              isAuthenticated ? 
                <EscuelaDashboard escuela={escuela} /> : 
                <Navigate to={`/escuela/${escuelaId}/signin`} replace />
            } />
            <Route path="/registro-jugadores" element={
              isAuthenticated ? 
                <RegistroNino /> : 
                <Navigate to={`/escuela/${escuelaId}/signin`} replace />
            } />
            {/*Veremos si jala */}
            <Route 
              path="/admin-solicitudes-escuela" 
              element={
                isAuthenticated && isAdmin 
                  ? <AdminSolicitudesInscripcion /> 
                  : <Navigate to={`/escuela/${escuelaId}/signin`} replace />
              } 
            />
            
            <Route path="/signin" element={<SignIn escuelaPortal={true} escuela={escuela} />} />
            <Route path="*" element={<Navigate to={`/escuela/${escuelaId}`} replace />} />
          </Routes>
        </div>
        
        {/* Footer con información de la escuela */}
        <footer 
          className="p-4 text-center text-sm"
          style={getFooterStyles()}
        >
          <p>&copy; {new Date().getFullYear()} {escuela.nombre}</p>
          {escuela.direccion && (
            <p className="mt-1 text-xs opacity-75">{escuela.direccion}</p>
          )}
        </footer>
      </div>
    </EscuelaTemaProvider>
  );
};

export default EscuelaPortal;