import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTv, faClockRotateLeft, faFileUpload, faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import useShowGradeGroupModal from '../hooks/useShowGradeGroupModal';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
import { getCurrentThemeStyles } from '../themes/themeConfig';

function Dashboard({ isAuthenticated, isAdmin, setShowGradeGroupModal }) {
  const { currentTheme } = useTheme();
  const themeStyles = getCurrentThemeStyles(currentTheme);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [schools, setSchools] = useState([]);
  const [registeredSchools, setRegisteredSchools] = useState([]);
  const [isLoadingRegisteredSchools, setIsLoadingRegisteredSchools] = useState(true);
  const [registeredSchoolsError, setRegisteredSchoolsError] = useState(null);

  // Escuchar cambios de tema
  useEffect(() => {
    const handleThemeChange = (event) => {
      setForceUpdate(prev => prev + 1);
      // Forzar re-render de los componentes que usan gradientes
      document.documentElement.setAttribute('data-theme', event.detail);
    };

    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  // Forzar re-render cuando cambia el tema
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [currentTheme]);

  // Usar el custom hook
  useShowGradeGroupModal(isAuthenticated, isAdmin, setShowGradeGroupModal);
  const [stats, setStats] = useState({
    solicitudesActivas: 0,
    misSolicitudes: 0
  });
 
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await authService.api.get('/dashboard-stats');
        setStats({
          solicitudesActivas: response.data.solicitudesActivas || 0,
          misSolicitudes: response.data.misSolicitudes || 0
        });
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await authService.api.get('/noapi/escuelas');
        setSchools(response.data);
      } catch (error) {
        console.error('Error al obtener escuelas:', error);
      }
    };

    const fetchRegisteredSchools = async () => {
      setIsLoadingRegisteredSchools(true);
      try {
        const response = await authService.api.get('/api/escuelas-registradas');
        setRegisteredSchools(response.data);
        setRegisteredSchoolsError(null);
      } catch (error) {
        console.error('Error al obtener escuelas registradas:', error);
        setRegisteredSchoolsError('No se pudieron cargar las escuelas registradas. Intenta de nuevo más tarde.');
      } finally {
        setIsLoadingRegisteredSchools(false);
      }
    };

    fetchSchools();
    fetchRegisteredSchools();
  }, []);
  

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen w-full">
      <div className="w-full max-w-[2412px] mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
          Panel de Control de Escuelas
        </h1>
        
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Portales a Escuelas Disponibles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {schools.map(school => (
            <DashboardCard 
              key={school._id}
              title={school.nombre}
              value="Acceder"
              direccion={school.direccion}
              logoUrl={school.logoUrl || 'https://th.bing.com/th/id/R.75df72d204abdeaf2bb93451a5b54233?rik=9U863Dc0d43quA&pid=ImgRaw&r=0'}
              themeStyles={themeStyles}
              identificador={school.identificador}
            />
          ))}
        </div>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          Mis Escuelas Registradas
          {isLoadingRegisteredSchools && (
            <span className="ml-2 inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
          )}
        </h2>
        
        {registeredSchoolsError && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
            {registeredSchoolsError}
          </div>
        )}

        {!isLoadingRegisteredSchools && registeredSchools.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No tienes jugadores registrados en ninguna escuela aún.
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Navega a una escuela y registra a tus jugadores para verlas aquí.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
            {registeredSchools.map(school => (
              <RegisteredSchoolCard 
                key={school._id}
                school={school}
                themeStyles={themeStyles}
              />
            ))}
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700/20 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <ActionButton 
              to="/historial-solicitudes" 
              label="Mis Solicitudes"
              icon={faClockRotateLeft}
            />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700/20 p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Solicitudes Activas
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="p-3 text-gray-700 dark:text-gray-200">Fecha</th>
                  <th className="p-3 text-gray-700 dark:text-gray-200">Horario</th>
                  <th className="p-3 text-gray-700 dark:text-gray-200">Estado</th>
                </tr>
              </thead>
              <tbody className="dark:text-gray-300">
                {stats.solicitudesActivas > 0 ? (
                  <TableRow 
                    date={new Date().toLocaleDateString()}
                    schedule="En curso"
                    status="Activo"
                  />
                ) : (
                  <tr>
                    <td colSpan="3" className="p-3 text-center text-gray-500 dark:text-gray-400">
                      No hay solicitudes activas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, value, direccion, logoUrl, themeStyles, identificador }) {
  return (
    {/*Por si solo quieres navegar <Link to={`/escuela/${identificador}`} className="w-full"> */},
    <Link to={`/escuela/${identificador}`} className="w-full" onClick={() => {
      window.location.href = `/escuela/${identificador}`;
    }}>
      <div className={`bg-gradient-to-r ${themeStyles.gradient} rounded-lg shadow-md 
                      dark:shadow-gray-700/20 p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <img src={logoUrl} alt={`${title} Logo`} className="w-16 h-16 mb-2" />
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm opacity-80">{direccion}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
        </div>
        <div className="mt-4">
          <button 
            className={`bg-white text-gray-800 py-2 px-4 rounded-lg 
                        hover:bg-gray-200 transition duration-300 w-full`}
          >
            Ir al portal
          </button>
        </div>
      </div>
    </Link>
  );
}

function ActionButton({ to, label, icon }) {
  const { currentTheme } = useTheme();
  const themeStyles = getCurrentThemeStyles(currentTheme);

  return (
    <Link 
      to={to} 
      className={`flex items-center justify-center gap-2
                 bg-gradient-to-r ${themeStyles.gradient}
                 text-white py-3 px-4 rounded-xl
                 transition duration-300 text-center
                 shadow-md hover:shadow-lg
                 ${themeStyles.hover}
                 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800`}
    >
      <FontAwesomeIcon icon={icon} />
      <span>{label}</span>
    </Link>
  );
}

function TableRow({ date, subject, schedule, status }) {
  const statusStyles = {
    Pendiente: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
    Aprobado: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
    Rechazado: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
  }[status];
  
  return (
    <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="p-3">{date}</td>
      <td className="p-3">{subject}</td>
      <td className="p-3">{schedule}</td>
      <td className="p-3">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles}`}>
          {status}
        </span>
      </td>
    </tr>
  );
}

function RegisteredSchoolCard({ school, themeStyles }) {
  const {
    _id,
    nombre,
    direccion,
    logoUrl,
    identificador,
    diasEntrenamiento = ['Martes', 'Jueves'], // Valores predeterminados por si acaso
    jugadoresRegistrados = 0
  } = school;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className={`bg-gradient-to-r ${themeStyles.gradient} p-4 text-white`}>
        <div className="flex items-center space-x-4">
          <img 
            src={logoUrl || 'https://th.bing.com/th/id/R.75df72d204abdeaf2bb93451a5b54233?rik=9U863Dc0d43quA&pid=ImgRaw&r=0'} 
            alt={`${nombre} Logo`} 
            className="w-16 h-16 rounded-full object-cover border-2 border-white"
          />
          <div>
            <h3 className="text-xl font-bold">{nombre}</h3>
            <p className="text-white/80 text-sm">{direccion}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Jugadores</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{jugadoresRegistrados}</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Entrenamientos</p>
            <p className="text-sm font-bold text-gray-800 dark:text-white">{diasEntrenamiento.join(', ')}</p>
          </div>
        </div>
        
        <Link 
          to={`/escuela/${identificador}`}
          className={`block w-full text-center py-2 px-4 rounded-lg
                   bg-gradient-to-r ${themeStyles.gradient}
                   text-white font-medium transition-opacity hover:opacity-90`}
                   onClick={() => {
                    window.location.href = `/escuela/${identificador}`;
                  }}
        >
          Ir al portal
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
