import { AlertCircle, CheckCircle2, Edit3, Loader2 } from 'lucide-react';

interface PromptEditorProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onSave: () => void;
  isDirty: boolean;
  isSaving: boolean;
  status?: 'idle' | 'success' | 'error';
}

const PromptEditor = ({
  prompt,
  onPromptChange,
  onSave,
  isDirty,
  isSaving,
  status = 'idle',
}: PromptEditorProps) => {
  const handleSave = () => {
    if (!isDirty || isSaving) {
      return;
    }

    onSave();
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Edit3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Prompt de Análise
        </h3>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Este prompt será enviado junto com a transcrição para análise de IA. 
          Você pode editá-lo conforme necessário antes de processar a análise.
        </p>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        rows={12}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none font-mono text-sm leading-relaxed"
        placeholder="Digite o prompt personalizado para análise..."
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {prompt.length} caracteres
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Prompt baseado na organização selecionada
          </p>
          {status === 'success' && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Prompt salvo com sucesso.
            </span>
          )}
          {status === 'error' && (
            <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-3.5 w-3.5" />
              Não foi possível salvar o prompt. Tente novamente.
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ${
            !isDirty || isSaving
              ? 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar prompt'
          )}
        </button>
      </div>
    </div>
  );
};

export default PromptEditor;
