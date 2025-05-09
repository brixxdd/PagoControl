// components/EscuelaForm.js
import React, { useState, useEffect } from 'react';
import EscuelaTemaEditor from './EscuelaTemaEditor';

const EscuelaForm = ({ escuela, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    identificador: '',
    logoUrl: '',
    direccion: '',
    activa: true,
    mision: '',
    vision: '',
    diasEntrenamiento: ['Martes', 'Jueves'],
    tema: {
      colores: {
        primario: '#3B82F6',
        secundario: '#6366F1',
        texto: '#1F2937',
        fondo: '#F9FAFB',
        fondoSecundario: '#F3F4F6',
        borde: '#E5E7EB',
        error: '#EF4444',
        exito: '#10B981',
        advertencia: '#F59E0B',
        info: '#3B82F6',
        titulos: '#1F2937',
        subtitulos: '#4B5563',
        textoElementos: '#6B7280'
      },
      tipografia: {
        fuente: "'Roboto', sans-serif",
        titulos: "'Montserrat', sans-serif",
        tamanioBase: "16px"
      },
      componentes: {
        botones: {
          radio: "0.375rem",
          padding: "0.75rem 1.5rem",
          sombra: "0 1px 2px rgba(0, 0, 0, 0.05)"
        },
        tarjetas: {
          radio: "0.5rem",
          sombra: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          padding: "1.5rem"
        }
      },
      imagenes: {
        fondo: "",
        patron: ""
      }
    }
  });
  
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basico');
  const diasDisponibles = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  useEffect(() => {
    if (escuela) {
      // Si la escuela ya existe, usamos sus datos
      setFormData({
        nombre: escuela.nombre || '',
        identificador: escuela.identificador || '',
        logoUrl: escuela.logoUrl || '',
        direccion: escuela.direccion || '',
        activa: escuela.activa !== undefined ? escuela.activa : true,
        mision: escuela.mision || '',
        vision: escuela.vision || '',
        diasEntrenamiento: escuela.diasEntrenamiento || ['Martes', 'Jueves'],
        // Si la escuela tiene tema, lo usamos. Si no, usamos el tema por defecto del estado inicial
        tema: escuela.tema || formData.tema
      });
    }
  }, [escuela]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDiasChange = (dia) => {
    setFormData(prev => {
      let nuevaLista;
      if (prev.diasEntrenamiento.includes(dia)) {
        nuevaLista = prev.diasEntrenamiento.filter(d => d !== dia);
      } else {
        nuevaLista = [...prev.diasEntrenamiento, dia];
      }
      return {
        ...prev,
        diasEntrenamiento: nuevaLista
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.identificador) {
      newErrors.identificador = 'El identificador es obligatorio';
    } else if (!/^[a-z0-9-]+$/.test(formData.identificador)) {
      newErrors.identificador = 'Solo letras minúsculas, números y guiones';
    }
    
    if (formData.diasEntrenamiento.length === 0) {
      newErrors.diasEntrenamiento = 'Selecciona al menos un día de entrenamiento';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          {escuela ? 'Editar Escuela' : 'Nueva Escuela'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
              <button
                type="button"
                className={`px-4 py-2 ${activeTab === 'basico' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('basico')}
              >
                Datos básicos
              </button>
              <button
                type="button"
                className={`px-4 py-2 ${activeTab === 'avanzado' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('avanzado')}
              >
                Tema avanzado
              </button>
            </div>
            
            {activeTab === 'basico' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre de la Escuela
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-lg ${
                        errors.nombre ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } dark:bg-gray-700 dark:text-white`}
                    />
                    {errors.nombre && (
                      <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Identificador (URL)
                    </label>
                    <input
                      type="text"
                      name="identificador"
                      value={formData.identificador}
                      onChange={handleChange}
                      disabled={escuela !== null}
                      className={`w-full p-2 border rounded-lg ${
                        errors.identificador ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } ${escuela ? 'bg-gray-100 dark:bg-gray-600' : 'dark:bg-gray-700'} dark:text-white`}
                      placeholder="mi-escuela"
                    />
                    {errors.identificador ? (
                      <p className="text-red-500 text-xs mt-1">{errors.identificador}</p>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                        Este valor se usará en la URL: /escuela/{formData.identificador || 'mi-escuela'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      URL del Logo
                    </label>
                    <input
                      type="text"
                      name="logoUrl"
                      value={formData.logoUrl}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      placeholder="https://ejemplo.com/logo.png"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      placeholder="Dirección de la escuela"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Días de Entrenamiento
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {diasDisponibles.map(dia => (
                        <label key={dia} className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg">
                          <input
                            type="checkbox"
                            checked={formData.diasEntrenamiento.includes(dia)}
                            onChange={() => handleDiasChange(dia)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {dia}
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.diasEntrenamiento && (
                      <p className="text-red-500 text-xs mt-1">{errors.diasEntrenamiento}</p>
                    )}
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Misión
                    </label>
                    <textarea
                      name="mision"
                      value={formData.mision}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      placeholder="Misión de la escuela"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Visión
                    </label>
                    <textarea
                      name="vision"
                      value={formData.vision}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      placeholder="Visión de la escuela"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="activa"
                      checked={formData.activa}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Escuela activa
                    </span>
                  </label>
                </div>
              </>
            ) : (
              <EscuelaTemaEditor 
                tema={formData.tema}
                onChange={(nuevoTema) => setFormData({...formData, tema: nuevoTema})}
              />
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {escuela ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EscuelaForm;