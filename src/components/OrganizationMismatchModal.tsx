import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

interface OrganizationMismatchModalProps {
  isOpen: boolean;
  pdfCompany: string;
  selectedOrganizationName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const OrganizationMismatchModal = ({
  isOpen,
  pdfCompany,
  selectedOrganizationName,
  onConfirm,
  onCancel
}: OrganizationMismatchModalProps) => {
  if (typeof document === 'undefined' || !isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-gray-950 shadow-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-start gap-4 px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Confirmação necessária</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  O PDF indica a organização <span className="font-semibold text-gray-900 dark:text-gray-100">"{pdfCompany}"</span>, diferente da organização selecionada <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedOrganizationName}</span>.
                </p>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  Deseja continuar mesmo assim? Esta ação poderá afetar a precisão da análise.
                </p>
              </div>
              <button
                onClick={onCancel}
                className="-mr-2 -mt-2 rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={onCancel}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-200 dark:hover:bg-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                Continuar análise
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OrganizationMismatchModal;

