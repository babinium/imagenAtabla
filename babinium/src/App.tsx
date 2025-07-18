import React, { useState, useCallback } from 'react';
import React, { useState, useCallback } from 'react';
import { AppState as AppStateValues } from './types';
import type { TableData, AppState } from './types';
import { extractTableFromImage } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import DataTable from './components/DataTable';
import Spinner from './components/Spinner';
import { FileScan, AlertTriangle, ArrowLeft, Download } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppStateValues.IDLE);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = useCallback((file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setAppState(AppState.PREVIEW);
    setTableData(null);
    setError(null);
  }, []);

  const handleSubmit = async () => {
    if (!imageFile) return;

    setAppState(AppState.PROCESSING);
    setError(null);

    try {
      const extractedData = await extractTableFromImage(imageFile);
      if (extractedData && extractedData.length > 0) {
        setTableData(extractedData);
        setAppState(AppState.SUCCESS);
      } else {
        throw new Error("La IA no pudo extraer ningún dato de la tabla. Por favor, intenta con una imagen diferente con una estructura de tabla más clara.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
      console.error(err);
      setError(errorMessage);
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setImageFile(null);
    setTableData(null);
    setError(null);
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl('');
    }
  };
  
  const renderContent = () => {
    switch (appState) {
      case AppState.IDLE:
        return <ImageUploader onImageSelect={handleImageSelect} isProcessing={false} />;
      
      case AppState.PREVIEW:
      case AppState.PROCESSING:
      case AppState.ERROR:
        return (
          <div className="w-full max-w-2xl text-center">
            <h2 className="text-2xl font-bold mb-4 text-slate-700 dark:text-slate-300">Vista Previa de la Imagen</h2>
            <div className="mb-6 rounded-lg overflow-hidden border-2 border-slate-300 dark:border-slate-700 shadow-lg">
              <img src={imageUrl} alt="Vista previa de la tabla" className="w-full h-auto max-h-[40vh] object-contain bg-slate-100 dark:bg-slate-800" />
            </div>
            {appState === AppState.ERROR && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 text-left rounded-r-lg" role="alert">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <p className="font-bold">Error al Procesar la Imagen</p>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={handleReset}
                className="flex items-center justify-center px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                disabled={appState === AppState.PROCESSING}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Elegir Otra Imagen
              </button>
              <button
                onClick={handleSubmit}
                disabled={appState === AppState.PROCESSING}
                className="flex items-center justify-center px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all"
              >
                {appState === AppState.PROCESSING ? (
                  <>
                    <Spinner />
                    Procesando...
                  </>
                ) : (
                  <>
                    <FileScan className="w-5 h-5 mr-2" />
                    Generar Hoja de Cálculo
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case AppState.SUCCESS:
        return tableData && (
          <div className="w-full max-w-5xl">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">Datos Extraídos</h2>
                 <div className="flex items-center space-x-4">
                     <button
                        onClick={handleReset}
                        className="flex items-center justify-center px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Empezar de Nuevo
                      </button>
                      <button
                        onClick={() => document.getElementById('download-csv-btn')?.click()}
                        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar CSV
                      </button>
                 </div>
            </div>
            <DataTable data={tableData} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Babi<span className="text-indigo-500">nium</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Sube una imagen de una tabla y deja que la IA la transforme en una hoja de cálculo estructurada, lista para que la uses y descargues.
        </p>
      </div>
      <div className="w-full flex items-center justify-center">
        {renderContent()}
      </div>
       <footer className="text-center text-sm text-slate-500 dark:text-slate-400 mt-12">
        <p>&copy; {new Date().getFullYear()} Babinium. Potenciado por Gemini.</p>
      </footer>
    </main>
  );
};

export default App;
