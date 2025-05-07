import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getCurrentThemeStyles } from '../themes/themeConfig';
import { QRCodeCanvas } from 'qrcode.react';

const QRCodeGenerator = () => {
  const [qrValue, setQrValue] = useState('https://pagocontrol.mx');
  const [qrSize, setQrSize] = useState(200);
  const [qrFgColor, setQrFgColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [includeMargin, setIncludeMargin] = useState(true);
  const [qrLevel, setQrLevel] = useState('L');
  
  const { currentTheme } = useTheme();
  const themeStyles = getCurrentThemeStyles(currentTheme);
  
  const handleDownload = () => {
    const canvas = document.getElementById('qr-code');
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'qrcode.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };
  
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen p-8">
      <h1 className={`text-3xl font-bold ${themeStyles.text} mb-6`}>Generador de Códigos QR</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel de Configuración */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Configuración</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contenido del QR
              </label>
              <textarea
                value={qrValue}
                onChange={(e) => setQrValue(e.target.value)}
                rows="4"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="URL o texto que deseas codificar en el QR"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tamaño del QR (px)
              </label>
              <input
                type="range"
                min="100"
                max="400"
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">{qrSize}px</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color del QR
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={qrFgColor}
                    onChange={(e) => setQrFgColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={qrFgColor}
                    onChange={(e) => setQrFgColor(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color de Fondo
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={qrBgColor}
                    onChange={(e) => setQrBgColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={qrBgColor}
                    onChange={(e) => setQrBgColor(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nivel de Corrección
                </label>
                <select
                  value={qrLevel}
                  onChange={(e) => setQrLevel(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="L">Bajo (7%)</option>
                  <option value="M">Medio (15%)</option>
                  <option value="Q">Cuartil (25%)</option>
                  <option value="H">Alto (30%)</option>
                </select>
              </div>
              
              <div className="flex items-end mb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeMargin}
                    onChange={(e) => setIncludeMargin(e.target.checked)}
                    className="w-4 h-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Incluir Margen
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Vista Previa y Descarga */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Vista Previa</h2>
          
          <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
            <QRCodeCanvas
              id="qr-code"
              value={qrValue || " "}
              size={qrSize}
              fgColor={qrFgColor}
              bgColor={qrBgColor}
              level={qrLevel}
              includeMargin={includeMargin}
              renderAs="canvas"
            />
          </div>
          
          <button
            onClick={handleDownload}
            className={`mt-6 px-4 py-2 bg-gradient-to-r ${themeStyles.gradient} text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300`}
          >
            Descargar QR
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
