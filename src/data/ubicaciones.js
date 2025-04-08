import estados from '../utils/estados.json';
import municipiosPorEstado from '../utils/estados-municipios.json';

export const TIPOS_SANGRE = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const getEstados = () => {
  return estados.map(estado => estado.nombre);
};

export const getMunicipios = (estado) => {
  // Convertir el nombre del estado a formato título (primera letra mayúscula, resto minúsculas)
  const estadoFormateado = estado.split(' ').map(palabra => 
    palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase()
  ).join(' ');
  
  // Casos especiales
  const casosEspeciales = {
    'CIUDAD DE MEXICO': 'Ciudad de Mexico',
    'ESTADO DE MEXICO': 'Estado de Mexico'
  };

  const nombreEstado = casosEspeciales[estado] || estadoFormateado;
  return municipiosPorEstado[nombreEstado] || [];
}; 