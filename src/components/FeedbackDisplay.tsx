import { CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react';
import { AnalysisResult, ChecklistItem } from '../types';

interface FeedbackDisplayProps {
  result: AnalysisResult;
}

const FeedbackDisplay = ({ result }: FeedbackDisplayProps) => {
  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getPatternStatus = (checklists: ChecklistItem[]) => {
    const totalItems = checklists.reduce((acc, checklist) => acc + Object.keys(checklist).length, 0);
    const passedItems = checklists.reduce((acc, checklist) => {
      return acc + Object.values(checklist).filter(Boolean).length;
    }, 0);
    
    const percentage = Math.round((passedItems / totalItems) * 100);
    
    if (percentage >= 80) return { color: 'green', status: 'Excelente' };
    if (percentage >= 60) return { color: 'yellow', status: 'Parcial' };
    return { color: 'red', status: 'Crítico' };
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Resultado da Análise
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ID da Transcrição: {result.transcriptId} | Piloto: {result.pilotId}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {result.patterns.map((pattern, index) => {
          const patternStatus = getPatternStatus(pattern.checklists);
          
          return (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-5"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-0">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  {pattern.title}
                </h4>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                  patternStatus.color === 'green' 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : patternStatus.color === 'yellow'
                    ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                    : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                } self-start sm:self-auto`}>
                  {patternStatus.color === 'green' 
                    ? <CheckCircle className="h-4 w-4" />
                    : patternStatus.color === 'yellow'
                    ? <AlertTriangle className="h-4 w-4" />
                    : <XCircle className="h-4 w-4" />
                  }
                  <span>{patternStatus.status}</span>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {pattern.feedback}
              </p>

              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                  Checklist de Verificação:
                </h5>
                {pattern.checklists.map((checklist, checkIndex) => (
                  <div key={checkIndex} className="space-y-2">
                    {Object.entries(checklist).map(([item, status]) => (
                      <div
                        key={item}
                        className="flex items-center space-x-3 text-sm"
                      >
                        {getStatusIcon(status)}
                        <span className="text-gray-700 dark:text-gray-300">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeedbackDisplay;
