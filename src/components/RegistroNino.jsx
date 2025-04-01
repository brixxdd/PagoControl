import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaChild, FaTint, FaExclamationTriangle, FaCalendarAlt, FaVenusMars } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { getCurrentThemeStyles } from '../themes/themeConfig';
import { BACKEND_URL } from '../config/config';

const RegistroNino = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const themeStyles = getCurrentThemeStyles(currentTheme || 'default');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    tipoSangre: '',
    alergias: '',
    edad: '',
    genero: 'Masculino',
    fechaNacimiento: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = sessionStorage.getItem('jwtToken');
      const user = JSON.parse(sessionStorage.getItem('currentUser'));

      const response = await fetch(`${BACKEND_URL}/auth/registro-nino`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          tutorId: user._id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro del niño');
      }

      // Redirigir al dashboard o mostrar mensaje de éxito
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 
                    dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-900/50 
                      rounded-3xl shadow-2xl overflow-hidden
                      border border-white/20 dark:border-gray-700/30">
          <div className="p-6 space-y-6">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2 
              }}
              className="relative w-20 h-20 mx-auto"
            >
              <div className={`absolute inset-0 bg-gradient-to-tr ${themeStyles.gradient}
                            rounded-full opacity-70 blur-xl`}></div>
              <div className={`relative bg-gradient-to-tr ${themeStyles.gradient}
                            rounded-full w-full h-full flex items-center justify-center
                            shadow-lg`}>
                <FaChild className="text-white text-3xl" />
              </div>
            </motion.div>

            {/* Título */}
            <div className="text-center space-y-2">
              <h2 className={`text-2xl font-bold bg-gradient-to-r ${themeStyles.gradient}
                           bg-clip-text text-transparent`}>
                Registro de Niño
              </h2>
              <p className="text-sm text-gray-600/90 dark:text-gray-300/90">
                Ingresa los datos del niño
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="nombreCompleto"
                  value={formData.nombreCompleto}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tipo de Sangre
                </label>
                <div className="relative">
                  <FaTint className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="tipoSangre"
                    value={formData.tipoSangre}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Alergias
                </label>
                <div className="relative">
                  <FaExclamationTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="alergias"
                    value={formData.alergias}
                    onChange={handleChange}
                    placeholder="Ninguna"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Edad
                </label>
                <input
                  type="number"
                  name="edad"
                  value={formData.edad}
                  onChange={handleChange}
                  required
                  min="1"
                  max="18"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Género
                </label>
                <div className="relative">
                  <FaVenusMars className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fecha de Nacimiento
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium
                         bg-gradient-to-r ${themeStyles.gradient}
                         hover:opacity-90 transition-opacity
                         ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Registrando...' : 'Registrar Niño'}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500/80 dark:text-gray-400/80">
              <p>Sistema de Control de Pagos</p>
              <p>© {new Date().getFullYear()} Todos los derechos reservados</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegistroNino; 