import { useState } from 'react';
import { createPortal } from 'react-dom';

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title, description }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(); // Executa a função de exclusão passada por prop
    } catch (error) {
      console.error("Erro ao excluir:", error);
    } finally {
      setLoading(false);
      onClose(); // Fecha o modal após concluir
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl transition-all">
        {/* Título */}
        <h3 className="text-lg font-semibold text-gray-900">
          {title || "Confirmar Exclusão"}
        </h3>

        {/* Descrição / Mensagem */}
        <p className="mt-2 text-sm text-gray-600">
          {description || "Tem certeza que deseja apagar este lançamento? Esta ação não poderá ser desfeita."}
        </p>

        {/* Botões de Ação */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="h-10 min-w-[120px] flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin text-white shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Excluindo...</span>
              </>
            ) : (
              "Sim, Excluir"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}