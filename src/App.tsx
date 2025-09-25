import { useEffect, useState } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import OrganizationCards from './components/OrganizationCards';
import FileUpload from './components/FileUpload';
import PromptEditor from './components/PromptEditor';
import { useApp } from './hooks/useApp';
import { analyzePdfWithExtraction } from './utils/pdfAnalysis';
import { Loader2, Brain } from 'lucide-react';
import AnalysisModal from './components/AnalysisModal';

const AppContent = () => {
  const { selectedOrganization, analysisResult, setAnalysisResult } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (selectedOrganization) {
      setPrompt(selectedOrganization.prompt);
      setAnalysisResult(null);
    }
  }, [selectedOrganization, setAnalysisResult]);

  useEffect(() => {
    if (analysisResult) {
      setIsModalOpen(true);
    }
  }, [analysisResult]);

  const handleAnalyze = async () => {
    if (!selectedFile || !selectedOrganization || !prompt.trim()) {
      return;
    }

    setIsAnalyzing(true);
    try {
      console.log('Iniciando extração de texto do PDF...');
      const result = await analyzePdfWithExtraction(
        selectedFile,
        prompt,
        selectedOrganization.id,
        {
          onBeforeAnalysis: ({ metadata }) => {
            if (metadata.company && metadata.company !== selectedOrganization.name) {
              return window.confirm(
                `O PDF indica a organização "${metadata.company}", diferente da organização selecionada (${selectedOrganization.name}). Deseja continuar mesmo assim?`
              );
            }

            return true;
          }
        }
      );
      setAnalysisResult(result);
      console.log('Processamento concluído com sucesso!');
    } catch (error) {
      if (error instanceof Error && error.message === 'ANALYSIS_CANCELLED') {
        console.info('Processamento cancelado pelo usuário devido a divergência de organização.');
      } else {
        console.error('Error analyzing transcript:', error);
        alert(`Erro ao processar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasRequiredData = Boolean(selectedFile && selectedOrganization && prompt.trim());
  const canAnalyze = hasRequiredData && !isAnalyzing;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedOrganization && (
          <>
            <OrganizationCards />
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
              <FileUpload 
                onFileSelect={setSelectedFile} 
                selectedFile={selectedFile} 
              />
              
              <div className="xl:col-span-1">
                <PromptEditor 
                  prompt={prompt} 
                  onPromptChange={setPrompt} 
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center mb-8 gap-4">
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className={`w-full sm:w-auto px-8 py-3 rounded-lg font-medium flex items-center justify-center space-x-3 transition-all duration-200 ${
                  canAnalyze
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Extraindo Texto do PDF...</span>
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5" />
                    <span>Processar PDF</span>
                  </>
                )}
              </button>

              {analysisResult && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto px-8 py-3 rounded-lg font-medium flex items-center justify-center space-x-3 bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition"
                >
                  <Brain className="h-5 w-5" />
                  <span>Ver Resultado</span>
                </button>
              )}
            </div>
          </>
        )}
      </main>

      <AnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        result={analysisResult}
      />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
