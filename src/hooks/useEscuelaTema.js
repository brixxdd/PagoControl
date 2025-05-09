import { useEffect } from 'react';

export const useEscuelaTema = (tema) => {
  useEffect(() => {
    if (!tema) return;
    
    // Función para generar nombres de variables CSS válidos
    const toKebabCase = (str) => {
      return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
    };
    
    // Aplicar variables CSS para colores
    const root = document.documentElement;
    
    // Colores principales como variables CSS
    Object.entries(tema.colores || {}).forEach(([key, value]) => {
      root.style.setProperty(`--color-${toKebabCase(key)}`, value);
    });
    
    // Tipografía como variables CSS
    if (tema.tipografia) {
      root.style.setProperty('--font-family', tema.tipografia.fuente);
      root.style.setProperty('--font-titles', tema.tipografia.titulos);
      root.style.setProperty('--font-size-base', tema.tipografia.tamanioBase);
    }
    
    // Componentes como variables CSS
    if (tema.componentes?.botones) {
      root.style.setProperty('--button-radius', tema.componentes.botones.radio);
      root.style.setProperty('--button-padding', tema.componentes.botones.padding);
      root.style.setProperty('--button-shadow', tema.componentes.botones.sombra);
    }
    
    if (tema.componentes?.tarjetas) {
      root.style.setProperty('--card-radius', tema.componentes.tarjetas.radio);
      root.style.setProperty('--card-shadow', tema.componentes.tarjetas.sombra);
      root.style.setProperty('--card-padding', tema.componentes.tarjetas.padding);
    }
    
    // Imágenes de fondo
    if (tema.imagenes?.fondo) {
      root.style.setProperty('--bg-image', `url(${tema.imagenes.fondo})`);
    }
    
    if (tema.imagenes?.patron) {
      root.style.setProperty('--bg-pattern', `url(${tema.imagenes.patron})`);
    }
    
    // Generar clases CSS personalizadas
    const styleSheet = document.createElement('style');
    styleSheet.id = 'escuela-tema-styles';
    
    // Eliminar hoja de estilos anterior si existe
    const prevStyleSheet = document.getElementById('escuela-tema-styles');
    if (prevStyleSheet) {
      prevStyleSheet.remove();
    }
    
    // Definir clases de utilidad basadas en el tema
    styleSheet.textContent = `
      .escuela-btn-primary {
        background-color: var(--color-primario);
        color: white;
        border-radius: var(--button-radius);
        padding: var(--button-padding);
        box-shadow: var(--button-shadow);
      }
      
      .escuela-btn-secondary {
        background-color: var(--color-secundario);
        color: white;
        border-radius: var(--button-radius);
        padding: var(--button-padding);
        box-shadow: var(--button-shadow);
      }
      
      .escuela-btn-success {
        background-color: var(--color-exito);
        color: white;
        border-radius: var(--button-radius);
        padding: var(--button-padding);
        box-shadow: var(--button-shadow);
      }
      
      .escuela-btn-warning {
        background-color: var(--color-advertencia);
        color: white;
        border-radius: var(--button-radius);
        padding: var(--button-padding);
        box-shadow: var(--button-shadow);
      }
      
      .escuela-card {
        background-color: white;
        border-radius: var(--card-radius);
        box-shadow: var(--card-shadow);
        padding: var(--card-padding);
        border: 1px solid var(--color-borde, #E5E7EB);
      }
      
      .escuela-title {
        color: var(--color-primario);
        font-family: var(--font-titles);
      }
      
      .escuela-subtitle {
        color: var(--color-secundario);
        font-family: var(--font-titles);
      }
      
      .escuela-text {
        color: var(--color-texto);
        font-family: var(--font-family);
      }
      
      .escuela-bg {
        background-color: var(--color-fondo);
      }
    `;
    
    document.head.appendChild(styleSheet);
    
    // Limpiar al desmontar
    return () => {
      const properties = [
        '--color-primario', '--color-secundario', '--color-texto',
        '--color-fondo', '--color-fondo-secundario', '--color-borde',
        '--color-error', '--color-exito', '--color-advertencia', '--color-info',
        '--color-subtitulos', '--color-titulos', '--color-texto-elementos', 
        '--font-family', '--font-titles', '--font-size-base',
        '--button-radius', '--button-padding', '--button-shadow',
        '--card-radius', '--card-shadow', '--card-padding',
        '--bg-image', '--bg-pattern'
      ];
      
      properties.forEach(prop => root.style.removeProperty(prop));
      
      if (styleSheet) {
        styleSheet.remove();
      }
    };
  }, [tema]);
};
