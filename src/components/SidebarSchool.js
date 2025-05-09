import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { FaHome, FaFileUpload, FaBars, FaTimes, FaCog, FaChild } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useEscuelaTheme } from '../contexts/EscuelaTemaContext';

const SidebarSchool = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { tema } = useEscuelaTheme();
  const location = useLocation();
  const { escuelaId } = useParams();
  
  // Determinar si un enlace está activo
  const isActive = (path) => location.pathname === path;
  
  // Obtener colores del tema de escuela
  const getPrimaryColor = () => tema?.colores?.primario || '#3B82F6';
  const getSecondaryColor = () => tema?.colores?.secundario || '#8B5CF6';
  
  // Generar gradient basado en colores del tema
  const getGradient = () => `from-[${getPrimaryColor()}] to-[${getSecondaryColor()}]`;
  
  // Clases dinámicas basadas en el tema de escuela
  const linkClasses = (path) => 
    isActive(path) 
      ? `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 
         bg-gradient-to-r ${getGradient()} text-white font-semibold` 
      : `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 
         hover:bg-gradient-to-r hover:from-white/5 hover:to-white/20 
         hover:scale-105 hover:shadow-md hover:shadow-black/10`;
  
  const iconClasses = "text-xl";

  return (
    <>
      {/* Botón hamburguesa con gradiente */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className={`fixed top-4 left-4 z-50 
                    bg-gradient-to-r ${getGradient()}
                    p-3 rounded-xl lg:hidden
                    shadow-lg hover:scale-110
                    transition-all duration-300`}
          style={{
            background: `linear-gradient(to right, ${getPrimaryColor()}, ${getSecondaryColor()})`,
            boxShadow: '0 0 15px rgba(0,0,0,0.2)'
          }}
        >
          <FaBars className="text-white w-5 h-5" />
        </button>
      )}

      {/* Overlay para cerrar el sidebar */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden 
                    transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar con gradiente del tema de escuela */}
      <div 
        className={`fixed top-0 left-0 h-screen 
                  text-white shadow-xl z-40 transition-all duration-300
                  ${isOpen ? 'w-[65vw] sm:w-56 translate-x-0' : '-translate-x-full w-[65vw] sm:w-56'} 
                  lg:translate-x-0 lg:w-56`}
        style={{
          background: `linear-gradient(to bottom, ${getPrimaryColor()}, ${getSecondaryColor()})`
        }}
      >
        {/* Header con gradiente de texto */}
        <div className="p-3 border-b border-white/10">
          <h1 className="text-xl font-bold text-white hover:scale-105 transition-transform duration-300 cursor-default">
            {tema?.nombrePortal || 'Portal Escuela'}
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          <Link 
            to={`/escuela/${escuelaId}/dashboard`}
            className={linkClasses(`/escuela/${escuelaId}/dashboard`)} 
            onClick={() => setIsOpen(false)}
          >
            <div className={`${isActive(`/escuela/${escuelaId}/dashboard`) 
              ? `p-1 rounded-full` 
              : "p-1 rounded-full transition-all duration-300 group-hover:bg-white/20"}`}>
              <FaHome className={iconClasses} />
            </div>
            <span className="font-medium">Dashboard</span>
          </Link>
          
          <Link 
            to={`/escuela/${escuelaId}/registro-jugadores`}
            className={linkClasses(`/escuela/${escuelaId}/registro-jugadores`)} 
            onClick={() => setIsOpen(false)}
          >
            <div className={`${isActive(`/escuela/${escuelaId}/registro-jugadores`) 
              ? `p-1 rounded-full` 
              : "p-1 rounded-full transition-all duration-300 group-hover:bg-white/20"}`}>
              <FaChild className={iconClasses} />
            </div>
            <span className="font-medium">Registro de Jugadores</span>
          </Link>

          {/* Enlace a las solicitudes del tutor */}
          <Link 
            to={`/escuela/${escuelaId}/solicitudes-escuela`}
            className={linkClasses(`/escuela/${escuelaId}/solicitudes-escuela`)} 
            onClick={() => setIsOpen(false)}
          >
            <div className={`${isActive(`/escuela/${escuelaId}/solicitudes-escuela`) 
              ? `p-1 rounded-full` 
              : "p-1 rounded-full transition-all duration-300 group-hover:bg-white/20"}`}>
              <FaFileUpload className={iconClasses} />
            </div>
            <span className="font-medium">Solicitudes</span>
          </Link>
        </nav>
      </div>
    </>
  );
};

export default SidebarSchool;
