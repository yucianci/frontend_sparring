import React from 'react';
import { Edit3 } from 'lucide-react';

interface PromptEditorProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ prompt, onPromptChange }) => {
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

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {prompt.length} caracteres
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          Prompt baseado na organização selecionada
        </p>
      </div>
    </div>
  );
};

export default PromptEditor;