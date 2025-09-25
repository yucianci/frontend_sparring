import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Clipboard, ClipboardCheck, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { AnalysisResult } from '../types';
import FeedbackDisplay from './FeedbackDisplay';
import { formatAnalysisResult } from '../utils/analysisFormatter';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnalysisResult | null;
}

const AnalysisModal = ({ isOpen, onClose, result }: AnalysisModalProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const formattedText = useMemo(() => (result ? formatAnalysisResult(result) : ''), [result]);

  useEffect(() => {
    if (!isOpen) {
      setIsCopied(false);
    }
  }, [isOpen]);

  if (typeof document === 'undefined' || !isOpen || !result) {
    return null;
  }

  const handleCopy = async () => {
    if (!formattedText) return;
    try {
      await navigator.clipboard.writeText(formattedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar texto da análise:', error);
      alert('Não foi possível copiar o texto. Tente novamente.');
    }
  };

  const handleDownloadPdf = () => {
    if (!result) return;
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const margin = 40;
      const maxLineWidth = doc.internal.pageSize.getWidth() - margin * 2;
      const lines = doc.splitTextToSize(formattedText, maxLineWidth);
      doc.text(lines, margin, margin);
      doc.save(`analise-${result.transcriptId}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Não foi possível gerar o PDF. Tente novamente.');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-950 shadow-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Resultado da Análise
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 transition"
            >
              <Download className="h-4 w-4" />
              Baixar PDF
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              {isCopied ? (
                <ClipboardCheck className="h-4 w-4 text-green-500" />
              ) : (
                <Clipboard className="h-4 w-4" />
              )}
              {isCopied ? 'Copiado!' : 'Copiar Texto'}
            </button>
          </div>

          <FeedbackDisplay result={result} />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AnalysisModal;
