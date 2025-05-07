import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

const EscuelaRouteGuard = ({ children, isAuthenticated }) => {
  const { escuelaId } = useParams();
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar la carga

  // Guardar el contexto de la escuela en sessionStorage
  useEffect(() => {
    if (escuelaId) {
      console.log('Identificador en EscuelaRouterGuard: ', escuelaId);
    }else{
      console.log('no no f')
    }

    setIsLoading(false); // Cambiar el estado a no cargando
  }, [escuelaId]);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('Autenticado en EscuelaRouteGuard');
    }else{
      console.log('No autenticado en EscuelaRouteGuard');
    }
  }, [isAuthenticated]);
  
  

  /*if (!isAuthenticated) {
    console.log('No autenticado, entraras a la escuela pero te mandara a login component');
  }else{
    if (escuelaId && !sessionStorage.getItem('currentEscuelaContext') && isAuthenticated) {
      console.log('Valor del usuario autenticado en EscuelaRouterGuard: ' + isAuthenticated + ' guardar identificador: ',escuelaId)
      console.log('Guardando... ',escuelaId)
      sessionStorage.setItem('currentEscuelaContext', escuelaId);
    }
  }*/
  if (escuelaId && !sessionStorage.getItem('currentEscuelaContext') && isAuthenticated) {
    console.log('Valor del usuario autenticado en EscuelaRouterGuard: ' + isAuthenticated + ' guardar identificador: ',escuelaId)
    console.log('Guardando... ',escuelaId)
    sessionStorage.setItem('currentEscuelaContext', escuelaId);
  }

  const storedEscuelaId = sessionStorage.getItem('currentEscuelaContext');
  // Verificar si el ID de la escuela en la URL coincide con el almacenado
  if (escuelaId !== storedEscuelaId && storedEscuelaId != null) {
    console.log('Verificando si el ID de la escuela en la URL coincide con el almacenado en EscuelaRouteGuard.js')
    return <Navigate to={`/escuela/${storedEscuelaId}`} replace />;
  }

  return children;
};

export default EscuelaRouteGuard;
