import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChild, FaPlus, FaTimes } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { getCurrentThemeStyles } from '../themes/themeConfig';
import { BACKEND_URL } from '../config/config';
import { toast } from 'react-toastify';
import { TIPOS_SANGRE, getEstados, getMunicipios } from '../data/ubicaciones';

//Componente para registrar un jugador
const RegistroNino = () => {
  const { currentTheme } = useTheme();
  const themeStyles = getCurrentThemeStyles(currentTheme || 'default');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [jugadores, setJugadores] = useState([]);
  const [formData, setFormData] = useState({
    apellidoPaterno: '',
    apellidoMaterno: '',
    nombre: '',
    claveCURP: '',
    fechaNacimiento: '',
    genero: 'VARONIL',
    tipoSangre: '',
    estado: '',
    municipioResidencia: '',
    codigoPostal: '',
    numeroCamiseta: '',
    alergias: '',
    cirugias: '',
    afecciones: '',
    nombrePadres: '',
    telefonos: ''
  });
  const [municipiosDisponibles, setMunicipiosDisponibles] = useState([]);

  // Cargar jugadores al montar el componente
  useEffect(() => {
    cargarJugadores();
  }, []);

  const cargarJugadores = async () => {
    try {
      const token = sessionStorage.getItem('jwtToken');
      const response = await fetch(`${BACKEND_URL}/auth/jugadores`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setJugadores(data);
      }
    } catch (error) {
      console.error('Error al cargar jugadores:', error);
      toast.error('Error al cargar los jugadores');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Campos que deben ir en mayúsculas
    const upperCaseFields = [
      'apellidoPaterno',
      'apellidoMaterno',
      'nombre',
      'claveCURP',
      'alergias',
      'cirugias',
      'afecciones',
      'nombrePadres'
    ];

    if (upperCaseFields.includes(name)) {
      newValue = value.toUpperCase();
    }

    // Validación específica para teléfono
    if (name === 'telefonos') {
      newValue = value.replace(/\D/g, '').slice(0, 10);
    }

    // Validación específica para CURP
    if (name === 'claveCURP') {
      newValue = value.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 18);
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  // Función para manejar el cambio de estado
  const handleEstadoChange = (e) => {
    const estado = e.target.value;
    console.log('Estado seleccionado:', estado); // Para debugging
    setFormData(prev => ({
      ...prev,
      estado: estado,
      municipioResidencia: '', // Resetear municipio
    }));
    setMunicipiosDisponibles(getMunicipios(estado));
  };

  // Función para manejar el cambio de municipio
  const handleMunicipioChange = (e) => {
    const municipio = e.target.value;
    setFormData(prev => ({
      ...prev,
      municipioResidencia: municipio,
      codigoPostal: '' // Resetear CP
    }));
  };

  // Función para validar entrada de CURP
  const handleCURPChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 18);
    setFormData(prev => ({
      ...prev,
      claveCURP: value
    }));
  };

  // Función para validar teléfono
  const handleTelefonoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({
      ...prev,
      telefonos: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = sessionStorage.getItem('jwtToken');
      const response = await fetch(`${BACKEND_URL}/auth/registro-nino`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro del jugador');
      }

      toast.success('Jugador registrado exitosamente');
      setShowModal(false);
      cargarJugadores(); // Recargar la lista de jugadores
      setFormData({ // Limpiar el formulario
        apellidoPaterno: '',
        apellidoMaterno: '',
        nombre: '',
        claveCURP: '',
        fechaNacimiento: '',
        genero: 'VARONIL',
        tipoSangre: '',
        estado: '',
        municipioResidencia: '',
        codigoPostal: '',
        numeroCamiseta: '',
        alergias: '',
        cirugias: '',
        afecciones: '',
        nombrePadres: '',
        telefonos: ''
      });
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 
                    dark:from-blue-900 dark:via-purple-900 dark:to-pink-900">
      {/* Header y Botón de Agregar */}
      <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Mis Jugadores Registrados
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white
                     bg-gradient-to-r ${themeStyles.gradient} hover:opacity-90 transition-opacity`}
        >
          <FaPlus /> Registrar Nuevo Jugador
        </button>
      </div>

      {/* Grid de Jugadores */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jugadores.map(jugador => (
      <motion.div
            key={jugador._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {jugador.nombre} {jugador.apellidoPaterno}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  CURP: {jugador.claveCURP}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <FaChild className="text-white text-xl" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <InfoRow label="Fecha de Nacimiento" value={new Date(jugador.fechaNacimiento).toLocaleDateString()} />
              <InfoRow label="Género" value={jugador.genero} />
              <InfoRow label="Categoría" value={jugador.categoria} />
              <InfoRow label="Tipo de Sangre" value={jugador.tipoSangre} />
              <InfoRow label="# Camiseta" value={jugador.numeroCamiseta} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal de Registro */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-2xl font-bold bg-gradient-to-r ${themeStyles.gradient} bg-clip-text text-transparent`}>
                    Registro de Jugador
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FaTimes className="text-xl" />
                  </button>
              </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Primera fila */}
                  <div className="grid grid-cols-3 col-span-full gap-4">
                    <InputField
                      label="Apellido Paterno"
                      name="apellidoPaterno"
                      value={formData.apellidoPaterno}
                      onChange={handleChange}
                      required
                      tabIndex={1}
                    />
                    <InputField
                      label="Apellido Materno"
                      name="apellidoMaterno"
                      value={formData.apellidoMaterno}
                      onChange={handleChange}
                      required
                      tabIndex={2}
                    />
                    <InputField
                      label="Nombre"
                      name="nombre"
                      value={formData.nombre}
                  onChange={handleChange}
                  required
                      tabIndex={3}
                />
              </div>

                  {/* Segunda fila */}
                  <div className="grid grid-cols-3 col-span-full gap-4">
                    <InputField
                      label="Clave CURP"
                      name="claveCURP"
                      value={formData.claveCURP}
                      onChange={handleCURPChange}
                      maxLength={18}
                      required
                      pattern="[A-Z0-9]{18}"
                      title="La CURP debe tener 18 caracteres alfanuméricos"
                    />
                    <InputField
                      label="Fecha de Nacimiento"
                      name="fechaNacimiento"
                      type="date"
                      value={formData.fechaNacimiento}
                      onChange={handleChange}
                      required
                      tabIndex={5}
                    />
                    <SelectField
                      label="Género"
                      name="genero"
                      value={formData.genero}
                      onChange={handleChange}
                      required
                      options={['VARONIL', 'FEMENIL']}
                      placeholder="Seleccione género"
                    />
                  </div>

                  {/* Tercera fila */}
                  <div className="grid grid-3 col-span-full gap-4">
                    <SelectField
                      label="Tipo de Sangre"
                      name="tipoSangre"
                      value={formData.tipoSangre}
                      onChange={handleChange}
                      required
                      options={TIPOS_SANGRE}
                      placeholder="Seleccione tipo de sangre"
                    />
                    <SelectField
                      label="Estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleEstadoChange}
                      required
                      tabIndex={7}
                      options={getEstados()}
                      placeholder="Seleccione un estado"
                    />
                    <SelectField
                      label="Municipio"
                      name="municipioResidencia"
                      value={formData.municipioResidencia}
                      onChange={handleMunicipioChange}
                      required
                      tabIndex={8}
                      options={municipiosDisponibles}
                      disabled={!formData.estado}
                      placeholder="Seleccione un municipio"
                    />
                    <InputField
                      label="Código Postal"
                      name="codigoPostal"
                      value={formData.codigoPostal}
                      onChange={handleChange}
                      required
                      pattern="[0-9]{5}"
                      maxLength={5}
                      tabIndex={9}
                      title="El código postal debe tener 5 dígitos"
                    />
              </div>

                  {/* Cuarta fila */}
                  <div className="grid grid-3 col-span-full gap-4">
                    <InputField
                      label="Número de Camiseta"
                      name="numeroCamiseta"
                      value={formData.numeroCamiseta}
                      onChange={handleChange}
                      required
                      type="number"
                      min="0"
                      max="99"
                      tabIndex={10}
                      title="Ingrese un número entre 0 y 99"
                    />
                    <InputField
                      label="Alergias"
                      name="alergias"
                      value={formData.alergias}
                      onChange={handleChange}
                      tabIndex={11}
                    />
                    <InputField
                      label="Cirugías"
                      name="cirugias"
                      value={formData.cirugias}
                      onChange={handleChange}
                      tabIndex={12}
                    />
              </div>

                  {/* Campos de ancho completo */}
                  <div className="col-span-full space-y-4">
                    <InputField
                      label="Afecciones"
                      name="afecciones"
                      value={formData.afecciones}
                      onChange={handleChange}
                      tabIndex={13}
                    />
                    <InputField
                      label="Nombre de los Padres"
                      name="nombrePadres"
                      value={formData.nombrePadres}
                      onChange={handleChange}
                      required
                      tabIndex={14}
                    />
                    <InputField
                      label="Teléfonos"
                      name="telefonos"
                      value={formData.telefonos}
                      onChange={handleTelefonoChange}
                      required
                      pattern="[0-9]{10}"
                      tabIndex={15}
                      title="El teléfono debe tener 10 dígitos"
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
                    tabIndex={16}
              >
                    {loading ? 'Registrando...' : 'Registrar Jugador'}
              </button>
            </form>
        </div>
      </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente auxiliar para los campos de entrada
const InputField = ({ label, name, type = "text", value, onChange, required = false, tabIndex }) => (
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
      tabIndex={tabIndex}
      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
               focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

// Componente auxiliar para mostrar información
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}:</span>
    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{value}</span>
  </div>
);

// Nuevo componente para campos select
const SelectField = ({ 
  label, 
  name, 
  value, 
  onChange, 
  required, 
  options = [],
  disabled, 
  placeholder 
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                 disabled:bg-gray-100 dark:disabled:bg-gray-700
                 disabled:cursor-not-allowed"
    >
      <option value="">{placeholder || "Seleccione..."}</option>
      {options.map(opt => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default RegistroNino; 