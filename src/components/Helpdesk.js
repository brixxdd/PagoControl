// components/Helpdesk.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { useNavigate, useParams } from 'react-router-dom';
import EscuelaForm from './EscuelaForm';

const Helpdesk = () => {
  const { isAdmin } = useAuth();
  const [escuelas, setEscuelas] = useState([]);
  const [selectedEscuela, setSelectedEscuela] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { identificador } = useParams(); // Obtener el identificador de la URL

  useEffect(() => {
    const fetchEscuelas = async () => {
      try {
        setIsLoading(true);
        const response = await authService.api.get('/api/escuelas');
        setEscuelas(response.data);
      } catch (error) {
        console.error('Error al obtener escuelas:', error);
        
        // Mostrar un mensaje amigable en la interfaz
        if (error.response && error.response.status === 403) {
          // Puedes mostrar una alerta o un mensaje en la interfaz
          alert('No tienes permiso para acceder a la gestión de escuelas.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEscuelas();
  }, []);

  useEffect(() => {
    if (identificador && escuelas.length > 0) {
      console.log('Hay escuelas en HelpDesk----------')
      const escuela = escuelas.find(e => e.identificador === identificador);
      if (escuela) {
        console.log('Si es una school valida..')
        setSelectedEscuela(escuela);
        setIsFormOpen(true);
      }else{
        console.log('No es una school valida..')
        navigate('/helpdesk');
      }
    }
  }, [identificador, escuelas]);

  const handleCreateEscuela = () => {
    setSelectedEscuela(null);
    setIsFormOpen(true);
  };

  const handleEditEscuela = (escuela) => {
    setSelectedEscuela(escuela);
    setIsFormOpen(true);
    navigate(`/helpdesk/${escuela.identificador}`);
  };

  const handleSaveEscuela = async (formData) => {
    try {
      let response;      
      if (selectedEscuela) {
        // Actualizar
        response = await authService.api.put(`/api/escuelas/${selectedEscuela._id}`, formData);
        
        // Actualizar la lista de escuelas
        setEscuelas(prevEscuelas => 
          prevEscuelas.map(e => 
            e._id === response.data._id ? response.data : e
          )
        );
      } else {
        // Crear nueva
        response = await authService.api.post('/api/escuelas', formData);
        setEscuelas(prev => [...prev, response.data]);
      }
      setIsFormOpen(false);
      setSelectedEscuela(null);
      navigate('/helpdesk');
    } catch (error) {
      console.error('Error al guardar escuela:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Soporte - Helpdesk
        </h1>
        
        {isAdmin && (
          <button
            onClick={handleCreateEscuela}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Nueva Escuela
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {escuelas.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600 dark:text-gray-400">
                No hay escuelas registradas. ¡Crea la primera!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {escuelas.map(escuela => (
                <div 
                  key={escuela._id}
                  className={`p-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105
                           ${escuela.activa 
                              ? 'bg-white dark:bg-gray-800' 
                              : 'bg-gray-200 dark:bg-gray-700 opacity-70'}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    {escuela.logoUrl ? (
                      <img 
                        src={escuela.logoUrl} 
                        alt={escuela.nombre}
                        className="w-12 h-12 object-contain rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-500 dark:text-gray-400">
                          {escuela.nombre.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {escuela.nombre}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ID: {escuela.identificador}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Dirección: {escuela.direccion || 'No disponible'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mb-2">
                    <span 
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: escuela.tema.colores.primario }}
                    ></span>
                    <span 
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: escuela.tema.colores.secundario }}
                    ></span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded ${
                      escuela.activa 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {escuela.activa ? 'Activa' : 'Inactiva'}
                    </span>
                    
                    <button 
                      onClick={() => handleEditEscuela(escuela)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {isFormOpen && (
        <EscuelaForm 
          escuela={selectedEscuela}
          onSave={handleSaveEscuela}
          onCancel={() => {
            setIsFormOpen(false);
            navigate('/helpdesk');
          }}
        />
      )}
    </div>
  );
};

export default Helpdesk;