import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import CustomSelect from './CustomSelect';

const initialFormData = {
  name: '',
  document_type: '',
  document: '',
};

const defaultDocumentTypes = [
  'CPF',
  'CNPJ',
];

export default function AddAccountModal({
  isOpen,
  onClose,
  onSubmit,
  documentTypes = defaultDocumentTypes,
  handleDeleteAccount,
}) {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previousData) => ({ ...previousData, [name]: value }));
    setError('');
  };

  const handleClose = () => {
    if (loading) return;
    setFormData(initialFormData);
    setError('');
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const account = {
      name: formData.name.trim(),
      document_type: formData.document_type,
      document: formData.document.trim(),
    };

    if (!account.name || !account.document_type || !account.document) {
      setError('Preencha todos os campos para continuar.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(account);
      setFormData(initialFormData);
      onClose();
    } catch (submitError) {
      console.error('Erro ao criar conta:', submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível salvar a conta. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-account-title"
        className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3
          id="add-account-title"
          className="mb-1 text-lg font-bold text-gray-900"
        >
          Nova Conta
        </h3>
        <p className="mb-4 text-xs text-gray-500">
          Cadastre uma nova conta para gerenciar os lançamentos.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label
              htmlFor="account-name"
              className="mb-1 block text-xs font-medium text-gray-700"
            >
              Nome da Conta
            </label>
            <input
              id="account-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Conta principal"
              required
              autoFocus
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="document-type"
              className="mb-1 block text-xs font-medium text-gray-700"
            >
              Tipo de Conta
            </label>
            {/* <select
              id="document-type"
              name="documentType"
              value={formData.document_type}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="" disabled>
                Selecione o tipo de documento
              </option>
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select> */}
            <CustomSelect 
              options={documentTypes}
              selected={formData.document_type || 'Selecione'}
              onSelect={(value) => {
                setFormData((prev) => ({ ...prev, document_type: value}));
                setError('');
              }}
            />
          </div>

          <div>
            <label
              htmlFor="account-document"
              className="mb-1 block text-xs font-medium text-gray-700"
            >
              CPF/CNPJ
            </label>
            <input
              id="account-document"
              name="document"
              type="text"
              value={formData.document}
              onChange={handleChange}
              placeholder="Digite o CPF ou CNPJ"
              autoComplete="off"
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700"
            >
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-xl px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  );
}
