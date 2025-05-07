import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaMoneyBillWave, FaTshirt, FaRunning } from 'react-icons/fa';

const EscuelaDashboard = ({ escuela }) => {
  // Calcular fechas de pago - para el ejemplo usaremos fechas estáticas
  const fechasPago = useMemo(() => {
    const fechaActual = new Date();
    const mes = fechaActual.getMonth();
    const año = fechaActual.getFullYear();
    
    return {
      primerPeriodo: `1-5 de ${new Intl.DateTimeFormat('es', { month: 'long' }).format(new Date(año, mes))}`,
      segundoPeriodo: `15-20 de ${new Intl.DateTimeFormat('es', { month: 'long' }).format(new Date(año, mes))}`
    };
  }, []);
  
  // Información de cuotas
  const infoCuotas = {
    unNino: '250 MXN',
    dosOMas: '200 MXN por niño',
    uniforme: '650 MXN por niño (solo nuevos)'
  };
  
  // Después de todos los hooks, ahora podemos comprobar si escuela existe
  if (!escuela) return null;
  
  // Componentes con clases de Tailwind
  const Button = ({ children, variant = "primary", className = "", ...props }) => {
    let variantClass = '';
    
    switch (variant) {
      case 'primary':
        variantClass = 'bg-escuela-primary';
        break;
      case 'secondary':
        variantClass = 'bg-escuela-secondary';
        break;
      case 'success':
        variantClass = 'bg-escuela-success';
        break;
      case 'warning':
        variantClass = 'bg-escuela-warning';
        break;
      case 'info':
        variantClass = 'bg-escuela-info';
        break;
      default:
        variantClass = 'bg-escuela-primary';
    }
    
    return (
      <button
        className={`text-white font-medium rounded-escuela-button shadow-escuela-button ${variantClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  };
  
  const Card = ({ children, className = "", ...props }) => {
    return (
      <div
        className={`bg-white rounded-escuela-card shadow-escuela-card p-escuela-card border border-escuela-border ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  };
  
  // Nuevo componente para información destacada
  const InfoItem = ({ icon, title, children }) => {
    return (
      <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="text-escuela-primary text-xl mt-1">{icon}</div>
        <div>
          <h4 className="font-medium text-escuela-text">{title}</h4>
          <div className="text-sm text-gray-600 dark:text-gray-400">{children}</div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-escuela-text font-escuela-body">
          Bienvenido al Portal de {escuela.nombre}
        </h2>
        <header>
          {/* Botón para navegar a /dashboard */}
        <div className="container mx-auto mt-6 flex justify-end">
          <Link
            to="/dashboard"
            className="
              inline-block
              px-6 py-3
              bg-gradient-to-r from-escuela-primary to-escuela-secondary
              text-white font-semibold
              rounded-lg
              shadow-lg
              hover:from-blue-600 hover:to-blue-800
              focus:outline-none focus:ring-2 focus:ring-blue-300
              transition-all duration-200
            "
          >
            Ir al Dashboard
          </Link>
        </div>
        </header>
        
        {/* Información importante - NUEVA SECCIÓN */}
        <Card className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-escuela-primary font-escuela-title">
            Información Importante
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem 
              icon={<FaRunning />} 
              title="Días de Entrenamiento"
            >
              <p className="font-semibold">
  {escuela.diasEntrenamiento?.length
    ? escuela.diasEntrenamiento.join(' y ')
    : 'Martes y Jueves'}
</p>

              <p className="mt-1">Horario: 4:00 PM - 6:00 PM</p>
            </InfoItem>
            
            <InfoItem 
              icon={<FaCalendarAlt />} 
              title="Fechas de Pago"
            >
              <p>Primer periodo: <span className="font-semibold">{fechasPago.primerPeriodo}</span></p>
              <p>Segundo periodo: <span className="font-semibold">{fechasPago.segundoPeriodo}</span></p>
            </InfoItem>
            
            <InfoItem 
              icon={<FaMoneyBillWave />} 
              title="Cuotas Mensuales"
            >
              <p>1 niño: <span className="font-semibold">{infoCuotas.unNino}</span></p>
              <p>2 o más niños: <span className="font-semibold">{infoCuotas.dosOMas}</span></p>
            </InfoItem>
            
            <InfoItem 
              icon={<FaTshirt />} 
              title="Uniforme"
            >
              <p>Costo único: <span className="font-semibold">{infoCuotas.uniforme}</span></p>
              <p className="text-xs italic">Solo para jugadores nuevos</p>
            </InfoItem>
          </div>
        </Card>
        
        <p className="mb-6 text-escuela-text font-escuela-body">
          Aquí encontrarás toda la información relevante para nuestra comunidad escolar.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <h3 className="text-lg font-semibold mb-3 text-escuela-primary font-escuela-title">
              Próximos Eventos
            </h3>
            <ul className="space-y-2 text-escuela-text">
              <li className="flex justify-between">
                <span>Reunión de padres</span>
                <span>26/Oct</span>
              </li>
              <li className="flex justify-between">
                <span>Torneo deportivo</span>
                <span>05/Nov</span>
              </li>
              <li className="flex justify-between">
                <span>Evaluación bimestral</span>
                <span>15/Nov</span>
              </li>
            </ul>
            <div className="mt-4">
              <Button variant="primary">Ver todos</Button>
            </div>
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold mb-3 text-escuela-secondary font-escuela-title">
              Pagos Pendientes
            </h3>
            <div className="space-y-2">
              <div className="p-2 rounded bg-escuela-warning bg-opacity-10">
                <p className="text-escuela-text">Cuota mensual: {new Date().toLocaleDateString('es', { month: 'long', year: 'numeric' })}</p>
                <p className="text-sm opacity-75">Vence: {fechasPago.primerPeriodo.split(' ')[0]} de {fechasPago.primerPeriodo.split(' ').slice(2).join(' ')}</p>
              </div>
              <div className="p-2 rounded bg-escuela-warning bg-opacity-10">
                <p className="text-escuela-text">Uniforme (por única vez)</p>
                <p className="text-sm opacity-75">Vence: {fechasPago.segundoPeriodo.split(' ')[0]} de {fechasPago.segundoPeriodo.split(' ').slice(2).join(' ')}</p>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="warning">Realizar pago</Button>
            </div>
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold mb-3 text-escuela-success font-escuela-title">
              Acciones Rápidas
            </h3>
            <div className="space-y-3">
              <Button variant="secondary" className="w-full">Registro de jugadores</Button>
              <Button variant="success" className="w-full">Consultar calificaciones</Button>
              <Button variant="info" className="w-full">Soporte técnico</Button>
            </div>
          </Card>
        </div>
        
        <div className="mt-8">
          <Card>
            <h3 className="text-xl font-semibold mb-4 text-escuela-primary font-escuela-title">
              Información Institucional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium mb-2 text-escuela-text">Misión</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {escuela.mision}
                </p>
              </div>
              <div>
                <h4 className="text-lg font-medium mb-2 text-escuela-text">Visión</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {escuela.vision}
                </p>
              </div>
            </div>
            {escuela.direccion && (
              <div className="mt-4 pt-4 border-t border-escuela-border">
                <p className="text-escuela-info dark:text-gray-400">
                  <strong>Dirección:</strong> {escuela.direccion}
                </p>
              </div>
            )}
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default EscuelaDashboard;
