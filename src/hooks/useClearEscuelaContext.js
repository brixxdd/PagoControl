import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useClearEscuelaContext = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.pathname.includes('/escuela/')) {
      // Limpiar storage
      sessionStorage.removeItem('currentEscuelaContext');
    }
  }, [location]);
};

export default useClearEscuelaContext;
