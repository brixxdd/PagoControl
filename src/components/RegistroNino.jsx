import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaChild } from 'react-icons/fa';
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
    apellidoPaterno: '',
    apellidoMaterno: '',
    nombre: '',
    claveCURP: '',
    fechaNacimiento: '',
    tipoSangre: '',
    lugarNacimiento: '',
    estudios: '',
    municipioResidencia: '',
    codigoPostal: '',
    numeroCamiseta: '',
    alergias: '',
    cirugias: '',
    afecciones: '',
    nombrePadres: '',
    telefonos: ''
  });
  const [jugadoresRegistrados, setJugadoresRegistrados] = useState([]);

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

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar jugadores registrados al montar el componente
  useEffect(() => {
    const cargarJugadores = async () => {
      try {
        const token = sessionStorage.getItem('jwtToken');
        const user = JSON.parse(sessionStorage.getItem('currentUser'));

        const response = await fetch(`${BACKEND_URL}/auth/jugadores/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setJugadoresRegistrados(data);
        }
      } catch (error) {
        console.error('Error al cargar jugadores:', error);
      }
    };

    cargarJugadores();
  }, []);

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 
                    dark:from-blue-900 dark:via-purple-900 dark:to-pink-900">
      {/* Sección de jugadores registrados */}
      {jugadoresRegistrados.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
            Jugadores Registrados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jugadoresRegistrados.map(jugador => (
              <div key={jugador._id} 
                   className="p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow">
                <h4 className="font-medium">{jugador.nombre} {jugador.apellidoPaterno}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  CURP: {jugador.claveCURP}
                </p>
                {/* ... más detalles si se desean mostrar ... */}
              </div>
            ))}
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white/60 dark:bg-gray-900/50 rounded-3xl shadow-2xl p-6"
      >
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-bold bg-gradient-to-r ${themeStyles.gradient} bg-clip-text text-transparent`}>
            Registro de Jugador
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Primera columna */}
          <div className="space-y-4">
            <InputField
              label="Apellido Paterno"
              name="apellidoPaterno"
              value={formData.apellidoPaterno}
              onChange={handleChange}
              required
            />
            <InputField
              label="Clave CURP"
              name="claveCURP"
              value={formData.claveCURP}
              onChange={handleChange}
              required
            />
            <InputField
              label="Municipio (Residencia)"
              name="municipioResidencia"
              value={formData.municipioResidencia}
              onChange={handleChange}
              required
            />
            <InputField
              label="Alergias"
              name="alergias"
              value={formData.alergias}
              onChange={handleChange}
            />
          </div>

          {/* Segunda columna */}
          <div className="space-y-4">
            <InputField
              label="Apellido Materno"
              name="apellidoMaterno"
              value={formData.apellidoMaterno}
              onChange={handleChange}
              required
            />
            <InputField
              label="Fecha de Nacimiento"
              name="fechaNacimiento"
              type="date"
              value={formData.fechaNacimiento}
              onChange={handleChange}
              required
            />
            <InputField
              label="Lugar de Nacimiento"
              name="lugarNacimiento"
              value={formData.lugarNacimiento}
              onChange={handleChange}
              required
            />
            <InputField
              label="Código Postal"
              name="codigoPostal"
              value={formData.codigoPostal}
              onChange={handleChange}
              required
            />
            <InputField
              label="Cirugías"
              name="cirugias"
              value={formData.cirugias}
              onChange={handleChange}
            />
          </div>

          {/* Tercera columna */}
          <div className="space-y-4">
            <InputField
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
            <InputField
              label="Tipo de Sangre"
              name="tipoSangre"
              value={formData.tipoSangre}
              onChange={handleChange}
              required
            />
            <InputField
              label="Estudios"
              name="estudios"
              value={formData.estudios}
              onChange={handleChange}
              required
            />
            <InputField
              label="# de Camiseta"
              name="numeroCamiseta"
              value={formData.numeroCamiseta}
              onChange={handleChange}
              required
            />
            <InputField
              label="Afecciones"
              name="afecciones"
              value={formData.afecciones}
              onChange={handleChange}
            />
          </div>

          {/* Campos de ancho completo */}
          <div className="col-span-full space-y-4">
            <InputField
              label="Nombre de los Padres"
              name="nombrePadres"
              value={formData.nombrePadres}
              onChange={handleChange}
              required
            />
            <InputField
              label="Teléfonos"
              name="telefonos"
              value={formData.telefonos}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <div className="col-span-full text-red-500 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`col-span-full py-3 px-4 rounded-lg text-white font-medium
                     bg-gradient-to-r ${themeStyles.gradient}
                     hover:opacity-90 transition-opacity
                     ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Registrando...' : 'Registrar Jugador'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// Componente auxiliar para los campos de entrada
const InputField = ({ label, name, type = "text", value, onChange, required = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
               focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

export default RegistroNino; 