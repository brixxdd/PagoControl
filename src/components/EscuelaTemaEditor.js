import React, { useState } from 'react';
import { ChromePicker } from 'react-color';
import { motion } from 'framer-motion';

// Componente envoltorio para ChromePicker que soluciona la advertencia
const ColorPickerWrapper = ({ 
  color = '#3B82F6', 
  onChange = () => {}, 
  ...props 
}) => {
  return (
    <ChromePicker 
      color={color}
      onChange={onChange}
      {...props}
    />
  );
};

const EscuelaTemaEditor = ({ tema, onChange }) => {
  const [activeTab, setActiveTab] = useState('colores');
  const [colorPickerOpen, setColorPickerOpen] = useState(null);
  
  const handleColorChange = (color, key) => {
    onChange({
      ...tema,
      colores: {
        ...tema.colores,
        [key]: color.hex
      }
    });
  };
  
  const handleInputChange = (section, key, value) => {
    onChange({
      ...tema,
      [section]: {
        ...tema[section],
        [key]: value
      }
    });
  };
  
  const handleNestedInputChange = (section, subsection, key, value) => {
    onChange({
      ...tema,
      [section]: {
        ...tema[section] || {},
        [subsection]: {
          ...(tema[section]?.[subsection] || {}),
          [key]: value
        }
      }
    });
  };
  
  const handleImageChange = (key, value) => {
    onChange({
      ...tema,
      imagenes: {
        ...tema.imagenes || {},
        [key]: value
      }
    });
  };

  // Asegurarnos de que tema.colores esté inicializado
  const colores = tema.colores || {
    primario: '#3B82F6',
    secundario: '#6366F1',
    texto: '#1F2937',
    fondo: '#F9FAFB',
    fondoSecundario: '#F3F4F6',
    borde: '#E5E7EB',
    error: '#EF4444',
    exito: '#10B981',
    advertencia: '#F59E0B',
    info: '#3B82F6'
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 overflow-x-auto">
        {['colores', 'tipografia', 'componentes', 'imagenes'].map(tab => (
          <button
            key={tab}
            type="button"
            className={`px-4 py-2 text-sm font-medium capitalize whitespace-nowrap ${
              activeTab === tab 
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {activeTab === 'colores' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(colores).map(([key, value]) => (
            <div key={key} className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                {key}
              </label>
              <div 
                className="w-full h-10 rounded-lg cursor-pointer flex items-center justify-center"
                style={{ backgroundColor: value }}
                onClick={() => setColorPickerOpen(key)}
              >
                <span className="text-xs font-mono" style={{ 
                  color: key === 'primario' || key === 'secundario' || key === 'error' ? 'white' : 'black',
                  textShadow: '0px 0px 1px rgba(0,0,0,0.3)'
                }}>
                  {value}
                </span>
              </div>
              
              {colorPickerOpen === key && (
                <div className="absolute z-10 mt-2">
                  <div 
                    className="fixed inset-0" 
                    onClick={() => setColorPickerOpen(null)}
                  />
                  <ColorPickerWrapper 
                    color={value}
                    onChange={(color) => handleColorChange(color, key)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {activeTab === 'tipografia' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fuente principal
            </label>
            <select
              value={tema.tipografia?.fuente || "'Roboto', sans-serif"}
              onChange={(e) => handleInputChange('tipografia', 'fuente', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="'Roboto', sans-serif">Roboto</option>
              <option value="'Open Sans', sans-serif">Open Sans</option>
              <option value="'Montserrat', sans-serif">Montserrat</option>
              <option value="'Lato', sans-serif">Lato</option>
              <option value="'Poppins', sans-serif">Poppins</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fuente para títulos
            </label>
            <select
              value={tema.tipografia?.titulos || "'Montserrat', sans-serif"}
              onChange={(e) => handleInputChange('tipografia', 'titulos', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="'Roboto', sans-serif">Roboto</option>
              <option value="'Open Sans', sans-serif">Open Sans</option>
              <option value="'Montserrat', sans-serif">Montserrat</option>
              <option value="'Lato', sans-serif">Lato</option>
              <option value="'Poppins', sans-serif">Poppins</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tamaño base de fuente
            </label>
            <select
              value={tema.tipografia?.tamanioBase || "16px"}
              onChange={(e) => handleInputChange('tipografia', 'tamanioBase', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="14px">Pequeño (14px)</option>
              <option value="16px">Medio (16px)</option>
              <option value="18px">Grande (18px)</option>
            </select>
          </div>
        </div>
      )}
      
      {activeTab === 'componentes' && (
        <div className="space-y-6">
          {/* Sección Botones */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-white">Botones</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Radio de borde
                </label>
                <select
                  value={tema.componentes?.botones?.radio || "0.375rem"}
                  onChange={(e) => handleNestedInputChange('componentes', 'botones', 'radio', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="0">Sin redondeo</option>
                  <option value="0.125rem">Muy pequeño (2px)</option>
                  <option value="0.25rem">Pequeño (4px)</option>
                  <option value="0.375rem">Medio (6px)</option>
                  <option value="0.5rem">Grande (8px)</option>
                  <option value="9999px">Completamente redondeado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Relleno (padding)
                </label>
                <select
                  value={tema.componentes?.botones?.padding || "0.75rem 1.5rem"}
                  onChange={(e) => handleNestedInputChange('componentes', 'botones', 'padding', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="0.5rem 1rem">Compacto</option>
                  <option value="0.75rem 1.5rem">Normal</option>
                  <option value="1rem 2rem">Amplio</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sombra
                </label>
                <select
                  value={tema.componentes?.botones?.sombra || "0 1px 2px rgba(0, 0, 0, 0.05)"}
                  onChange={(e) => handleNestedInputChange('componentes', 'botones', 'sombra', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="none">Sin sombra</option>
                  <option value="0 1px 2px rgba(0, 0, 0, 0.05)">Sutil</option>
                  <option value="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)">Media</option>
                  <option value="0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)">Prominente</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <div className="mt-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Vista previa</h4>
                  <button 
                    type="button"
                    className="mr-2 mb-2"
                    style={{
                      backgroundColor: tema.colores?.primario || '#3B82F6',
                      color: '#FFFFFF',
                      borderRadius: tema.componentes?.botones?.radio || '0.375rem',
                      padding: tema.componentes?.botones?.padding || '0.75rem 1.5rem',
                      boxShadow: tema.componentes?.botones?.sombra || '0 1px 2px rgba(0, 0, 0, 0.05)',
                      border: 'none',
                      fontWeight: 500
                    }}
                  >
                    Botón Primario
                  </button>
                  <button 
                    type="button"
                    style={{
                      backgroundColor: tema.colores?.secundario || '#6366F1',
                      color: '#FFFFFF',
                      borderRadius: tema.componentes?.botones?.radio || '0.375rem',
                      padding: tema.componentes?.botones?.padding || '0.75rem 1.5rem',
                      boxShadow: tema.componentes?.botones?.sombra || '0 1px 2px rgba(0, 0, 0, 0.05)',
                      border: 'none',
                      fontWeight: 500
                    }}
                  >
                    Botón Secundario
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sección Tarjetas */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-white">Tarjetas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Radio de borde
                </label>
                <select
                  value={tema.componentes?.tarjetas?.radio || "0.5rem"}
                  onChange={(e) => handleNestedInputChange('componentes', 'tarjetas', 'radio', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="0">Sin redondeo</option>
                  <option value="0.25rem">Pequeño (4px)</option>
                  <option value="0.5rem">Medio (8px)</option>
                  <option value="0.75rem">Grande (12px)</option>
                  <option value="1rem">Muy grande (16px)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sombra
                </label>
                <select
                  value={tema.componentes?.tarjetas?.sombra || "0 4px 6px -1px rgba(0, 0, 0, 0.1)"}
                  onChange={(e) => handleNestedInputChange('componentes', 'tarjetas', 'sombra', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="none">Sin sombra</option>
                  <option value="0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)">Sutil</option>
                  <option value="0 4px 6px -1px rgba(0, 0, 0, 0.1)">Media</option>
                  <option value="0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)">Prominente</option>
                  <option value="0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)">Elevada</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Relleno (padding)
                </label>
                <select
                  value={tema.componentes?.tarjetas?.padding || "1.5rem"}
                  onChange={(e) => handleNestedInputChange('componentes', 'tarjetas', 'padding', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="1rem">Compacto (16px)</option>
                  <option value="1.5rem">Normal (24px)</option>
                  <option value="2rem">Amplio (32px)</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <div className="mt-2 overflow-hidden"
                  style={{
                    backgroundColor: 'white',
                    borderRadius: tema.componentes?.tarjetas?.radio || "0.5rem",
                    boxShadow: tema.componentes?.tarjetas?.sombra || "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    padding: tema.componentes?.tarjetas?.padding || "1.5rem",
                    border: `1px solid ${tema.colores?.borde || '#E5E7EB'}`
                  }}
                >
                  <h4 style={{
                    color: tema.colores?.primario || '#3B82F6',
                    fontFamily: tema.tipografia?.titulos || "'Montserrat', sans-serif",
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem'
                  }}>
                    Vista previa de tarjeta
                  </h4>
                  <p style={{
                    color: tema.colores?.texto || '#1F2937',
                    fontFamily: tema.tipografia?.fuente || "'Roboto', sans-serif"
                  }}>
                    Este es un ejemplo de cómo se verá una tarjeta con la configuración actual.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'imagenes' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Imagen de fondo
            </label>
            <input
              type="text"
              value={tema.imagenes?.fondo || ""}
              onChange={(e) => handleImageChange('fondo', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="URL de la imagen de fondo (opcional)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Ingresa la URL de una imagen para usar como fondo del portal
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Patrón de fondo
            </label>
            <input
              type="text"
              value={tema.imagenes?.patron || ""}
              onChange={(e) => handleImageChange('patron', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="URL del patrón de fondo (opcional)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Ingresa la URL de una imagen para usar como patrón repetitivo
            </p>
          </div>
          
          {(tema.imagenes?.fondo || tema.imagenes?.patron) && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Vista previa</h3>
              <div 
                className="w-full h-32 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
                style={{
                  backgroundImage: tema.imagenes?.patron 
                    ? `url(${tema.imagenes.patron})` 
                    : tema.imagenes?.fondo 
                      ? `url(${tema.imagenes.fondo})` 
                      : 'none',
                  backgroundSize: tema.imagenes?.patron ? 'auto' : 'cover',
                  backgroundRepeat: tema.imagenes?.patron ? 'repeat' : 'no-repeat',
                  backgroundPosition: 'center'
                }}
              >
                <div className="w-full h-full flex items-center justify-center" style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.7)'
                }}>
                  <p className="text-gray-800 font-medium">
                    {tema.imagenes?.patron 
                      ? 'Patrón aplicado' 
                      : tema.imagenes?.fondo 
                        ? 'Imagen de fondo aplicada' 
                        : 'Sin imágenes configuradas'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EscuelaTemaEditor;
