import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaPhone, FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { getCurrentThemeStyles } from '../themes/themeConfig';
import { BACKEND_URL } from '../config/config';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const { user, updateUserData } = useAuth();
  const { currentTheme } = useTheme();
  const themeStyles = getCurrentThemeStyles(currentTheme || 'default');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellidos: user?.apellidos || '',
    numeroContacto: '',
    direccion: '',
    numeroEmergencia: '',
    email: user?.email || '',
    registroCompleto: false
  });
  const [showExitAlert, setShowExitAlert] = useState(false);

  // Función para validar el formulario
  const isFormValid = () => {
    const requiredFields = ['numeroContacto', 'direccion', 'numeroEmergencia'];
    return requiredFields.every(field => formData[field].trim() !== '');
  };

  // Función para validar número de teléfono
  const isValidPhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/; // Formato: 10 dígitos
    return phoneRegex.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    // Validación específica para números de teléfono
    if (name === 'numeroContacto' || name === 'numeroEmergencia') {
      finalValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  // Modificar el useEffect para verificar si el registro está completo
  React.useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Solo mostrar la alerta si hay datos sin guardar y el registro no está completo
      if (!isFormValid() && !formData.registroCompleto) {
        e.preventDefault();
        setShowExitAlert(true);
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData]);

  // Modificar el handleSubmit para actualizar el estado de registro completo
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = sessionStorage.getItem('jwtToken');
      const response = await fetch(`${BACKEND_URL}/auth/complete-registration`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          registroCompleto: true
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro');
      }

      // Actualizar el estado local para indicar que el registro está completo
      setFormData(prev => ({
        ...prev,
        registroCompleto: true
      }));
      
      // Cerrar el modal de alerta si está abierto
      setShowExitAlert(false);

      updateUserData(data.user);
      window.location.reload(); // Recargar para actualizar el estado
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 lg:p-8 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60]"
          >
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-lg">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-4 text-red-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                <p className="font-medium">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-[95%] md:max-w-2xl lg:max-w-3xl my-4 md:my-6"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden
                      border border-gray-100 dark:border-gray-700">
          <div className="px-6 md:px-8 py-6 border-b border-gray-100 dark:border-gray-700
                        flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 
                         bg-clip-text text-transparent">
              Completar Registro
            </h2>
              <p className="mt-2 text-sm md:text-base text-gray-500 dark:text-gray-400">
              Por favor, completa tus datos para continuar
            </p>
          </div>

            {/* Icono decorativo */}
            <div className="hidden md:block">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 
                            flex items-center justify-center">
                <FaUser className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {/* Grid para nombre y apellidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  disabled={user?.nombre}
                  className="w-full px-4 py-2.5 md:py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                           bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 transition-all duration-200
                           disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Apellidos
                </label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  required
                  disabled={user?.apellidos}
                  className="w-full px-4 py-2.5 md:py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                           bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 transition-all duration-200
                           disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Grid para los campos de contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Número de Contacto
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="numeroContacto"
                  value={formData.numeroContacto}
                  onChange={handleChange}
                  required
                    placeholder="Ej: 9611234567"
                    className={`w-full pl-10 pr-4 py-2.5 md:py-3 rounded-xl border 
                             ${formData.numeroContacto && !isValidPhone(formData.numeroContacto) 
                               ? 'border-red-500 focus:ring-red-500' 
                               : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500'}
                             bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 transition-all duration-200`}
                  />
                {formData.numeroContacto && !isValidPhone(formData.numeroContacto) && (
                  <p className="mt-1 text-xs text-red-500">
                    Ingresa un número válido de 10 dígitos
                  </p>
                )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Número de Emergencia
                </label>
                <div className="relative">
                  <FaExclamationTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="numeroEmergencia"
                    value={formData.numeroEmergencia}
                    onChange={handleChange}
                    required
                    placeholder="Número para emergencias"
                    className={`w-full pl-10 pr-4 py-2.5 md:py-3 rounded-xl border 
                             ${formData.numeroEmergencia && !isValidPhone(formData.numeroEmergencia) 
                               ? 'border-red-500 focus:ring-red-500' 
                               : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500'}
                           bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 transition-all duration-200`}
                />
                {formData.numeroEmergencia && !isValidPhone(formData.numeroEmergencia) && (
                  <p className="mt-1 text-xs text-red-500">
                    Ingresa un número válido de 10 dígitos
                  </p>
                )}
                </div>
              </div>
            </div>

            {/* Campos de dirección y correo */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Dirección
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  required
                  placeholder="Ingresa tu dirección completa"
                  className="w-full pl-10 pr-4 py-2.5 md:py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                           bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={user?.email}
                className="w-full px-4 py-2.5 md:py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                         bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 transition-all duration-200
                         disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              />
            </div>

            {/* Botón de submit con validación */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !isFormValid() || 
                         !isValidPhone(formData.numeroContacto) || 
                         !isValidPhone(formData.numeroEmergencia)}
                className={`w-full md:w-auto md:min-w-[200px] md:float-right
                         px-6 py-3 text-sm md:text-base font-medium text-white 
                         bg-gradient-to-r from-blue-600 to-purple-600 
                         rounded-xl hover:from-blue-700 hover:to-purple-700 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         transition-all duration-200
                         ${(loading || !isFormValid() || 
                            !isValidPhone(formData.numeroContacto) || 
                            !isValidPhone(formData.numeroEmergencia)) 
                           ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                         xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Completando registro...
                  </span>
                ) : 'Completar Registro'}
              </button>
              
              {/* Mensaje de ayuda */}
              {!isFormValid() && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center md:text-right">
                  Por favor, completa todos los campos requeridos
                </p>
              )}
            </div>
          </form>
        </div>
      </motion.div>

      {/* Modal de confirmación para salir */}
      <AnimatePresence>
        {showExitAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          >
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" 
                 onClick={() => setShowExitAlert(false)} />
            
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full
                         border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mr-4">
                  <FaExclamationTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    ¿Estás seguro?
                  </h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">
                    Si sales ahora, perderás toda la información ingresada
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse md:flex-row gap-3 md:gap-4">
                <button
                  onClick={() => setShowExitAlert(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600
                           text-gray-700 dark:text-gray-300 font-medium
                           hover:bg-gray-50 dark:hover:bg-gray-700/50
                           transition-colors duration-200"
                >
                  Permanecer en la página
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700
                           text-white font-medium transition-colors duration-200"
                >
                  Salir de todos modos
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register; 