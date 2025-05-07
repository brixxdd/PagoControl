import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
import { getCurrentThemeStyles } from '../themes/themeConfig';
import { Eye, Edit, ExternalLink } from 'lucide-react';

const AdminEscuelas = () => {
  const [escuelas, setEscuelas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentTheme } = useTheme();
  const themeStyles = getCurrentThemeStyles(currentTheme);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEscuelas = async () => {
      try {
        setIsLoading(true);
        const response = await authService.api.get('/api/escuelas');
        setEscuelas(response.data);
        //console.log(escuelas)
      } catch (error) {
        console.error('Error al obtener escuelas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEscuelas();
  }, []);

  const handleEditEscuela = (escuelaId) => {
    navigate(`/helpdesk/${escuelaId}`);
  };

  const handleVisitEscuela = (identificador) => {
    navigate(`/escuela/${identificador}`);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-3xl font-bold ${themeStyles.text} mb-2`}>Escuelas Registradas</h1>
        <button 
          onClick={() => navigate('/helpdesk')}
          className={`px-4 py-2 bg-gradient-to-r ${themeStyles.gradient} text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300`}
        >
          Registrar Nueva Escuela
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {escuelas.length === 0 ? (
            <div className="col-span-full text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No hay escuelas registradas aún. ¡Registra la primera!
              </p>
            </div>
          ) : (
            escuelas.map(escuela => (
              <div 
                key={escuela._id}
                className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 
                           ${!escuela.activa && 'opacity-70'}`}
              >
                {/*<div 
                  className={`h-3 w-full bg-gradient-to-r ${escuela.activa ? 
                    `from-[${escuela.tema?.colores?.primario || themeStyles.from}] to-[${escuela.tema?.colores?.secundario || themeStyles.to}]` : 
                    'from-gray-400 to-gray-500'}`}
                ></div>*/}
                <div
                  style={{
                    height: '0.75rem',
                    width:  '100%',
                    backgroundImage: escuela.activa
                      ? `linear-gradient(to right, ${escuela.tema.colores.primario}, ${escuela.tema.colores.secundario})`
                      : 'linear-gradient(to right, #9ca3af, #6b7280)',
                  }}
                />
                
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    {escuela.logoUrl ? (
                      <img 
                        src={escuela.logoUrl} 
                        alt={`Logo de ${escuela.nombre}`}
                        className="w-16 h-16 object-contain rounded-lg"
                      />
                    ) : (
                      <div 
                        className={`w-16 h-16 rounded-lg flex items-center justify-center 
                                  bg-gradient-to-br from-${escuela.tema?.colores?.primario?.replace('#', '') || themeStyles.from} 
                                  to-${escuela.tema?.colores?.secundario?.replace('#', '') || themeStyles.to}`}
                      >
                        <span className="text-2xl font-bold text-white">
                          {escuela.nombre.charAt(0)}
                        </span>
                      </div>
                    )}
                    
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {escuela.nombre}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {escuela.identificador}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className="flex gap-1 items-center">
                      <span className="w-4 h-4 rounded-full" style={{ backgroundColor: escuela.tema?.colores?.primario }}></span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {escuela.colores?.primario || '#3B82F6'}
                      </span>
                    </div>
                    <div className="flex gap-1 items-center">
                      <span className="w-4 h-4 rounded-full" style={{ backgroundColor: escuela.tema?.colores?.secundario }}></span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {escuela.colores?.secundario || '#6366F1'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Dirección: {escuela.direccion || 'No disponible'}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full 
                                    ${escuela.activa 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {escuela.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  
                  <div className="mt-6 flex justify-between gap-2">
                    <button
                      onClick={() => handleEditEscuela(escuela.identificador)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        window.location.href = `/escuela/${escuela.identificador}`;
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-${escuela.colores?.primario?.replace('#', '') || themeStyles.from} to-${escuela.colores?.secundario?.replace('#', '') || themeStyles.to} text-black rounded-lg`}
                    >
                      
                      <ExternalLink className="w-4 h-4" />
                      <span>Visitar</span>
                    </button>
                    {/*abrir otra pestaña por button<a
                      href={`/escuela/${escuela.identificador}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-${escuela.colores?.primario?.replace('#', '') || themeStyles.from} to-${escuela.colores?.secundario?.replace('#', '') || themeStyles.to} text-black rounded-lg`}
                    > 
                    <ExternalLink className="w-4 h-4" />
                      <span>Visitar</span>
                      </a>*/}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminEscuelas;

