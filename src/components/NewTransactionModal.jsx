import { useState, useEffect, useRef } from 'react';
import CustomSelect from './CustomSelect';
import { X, Upload } from 'lucide-react';
import { supabase } from '../services/supabase';

const parseCurrencyInput = (value) => {
    const normalizedValue = String(value)
      .replace(/R\$/gi, "")
      .trim()
      .replace(/\s/g, "");
    if (!normalizedValue) return 0;

    let valueWithDecimalSeparator = normalizedValue;

    if (normalizedValue.includes(",")) {
      valueWithDecimalSeparator = normalizedValue.replace(/\./g, "").replace(",", ".");
    } else if ((normalizedValue.match(/\./g) || []).length > 1) {
      const lastDotIndex = normalizedValue.lastIndexOf(".");
      valueWithDecimalSeparator = `${normalizedValue.slice(0, lastDotIndex).replace(/\./g, "")}${normalizedValue.slice(lastDotIndex)}`;
    } else if (/^\d+\.\d{3}$/.test(normalizedValue)) {
      valueWithDecimalSeparator = normalizedValue.replace(".", "");
    }

    return Number(valueWithDecimalSeparator) || 0;
};

export function NewTransactionModal({ isOpen, onClose, onSave, categoryOptions, statusOptions, editingTransaction, isEditing, setEditingTransaction }) {
    const selectRef = useRef(null);
    const transactionCategoryOptions = categoryOptions.filter(
      (category) => category !== "Todas as Categorias"
    );
    const initialFormState = {
      vencimento: '',
      fornecedor: '',
      categoria: '',
      valor: '',
      status: '',
      installment: '1',
      group_id: '',
      file: null
    };
    const [formData, setFormData] = useState(initialFormState);
    const [categoria, setCategoria] = useState('Selecione');
    const [status, setStatus] = useState('Selecione');
    const [installment, setInstallment] = useState("1");
    const [attachedFiles, setAttachedFiles] = useState([]);
    
    useEffect(() => {
      function handleClickOutside(event) {
        if (selectRef.current && !selectRef.current.contains(event.target)) {
          resetForm();
          onClose();
        }
      }

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen, onClose]);
    
    useEffect(() => {
      if(!isOpen) return;
      console.log("2. Transação recebida no Modal:", editingTransaction);
      if (isEditing) {
        setFormData({
          fornecedor: editingTransaction.fornecedor || "",
          valor: editingTransaction.valor || "",
          vencimento: editingTransaction.vencimento || "",
          status: editingTransaction.status || "Pendente",
          installment: editingTransaction.total_installment || 1,
        });
        setCategoria(editingTransaction.categoria);
        setStatus(editingTransaction.status);
      } else {
        resetForm();
      }
    }, [editingTransaction, isOpen, isEditing]);

    const resetForm = () => {
      setFormData(initialFormState);
      setCategoria('Selecione');
      setStatus('Selecione');
      setInstallment("1");
      setEditingTransaction(null);
      setAttachedFiles([]);
    };
    function handleClose() {
      resetForm();
      onClose();
    }
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value}))
    };

    const handleTypeChange = (id, newType) => {
      setAttachedFiles((prev) =>
        prev.map((item) => (item.id === id ? { ...item, type: newType } : item))
      );
    };

    const handleRemoveFile = (id) => {
      setAttachedFiles((prev) => prev.filter((item) => item.id !== id));
    };

    const handleFileSelect = (e) => {
      const filesList = e.target.files || e.dataTransfer?.files;
      if (!filesList) return;

      const files = Array.from(filesList);

      const newFiles = files.map((file) => {
        const ext = file.name.split('.').pop().toLowerCase();
        const fileNameLower = file.name.toLowerCase();

        // Sugestão automática de tipo
        let defaultType = 'boleto_url';
        if (ext === 'xml') {
          defaultType = 'xml_url';
        } else if (fileNameLower.includes('nfe') || fileNameLower.includes('nota')) {
          defaultType = 'nfe_url';
        } else if (fileNameLower.includes('comprovante') || fileNameLower.includes('recibo')) {
          defaultType = 'receipt_url';
        }

        return {
          id: Math.random().toString(36).substr(2, 9),
          file: file,
          type: defaultType
        };
      });

      setAttachedFiles((prev) => [...prev, ...newFiles]);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!formData.fornecedor || !formData.valor || categoria === "Selecione") {
            alert('Por favor, preencha os campos obrigatórios.');
            return;
        }

        const parsedValue = parseCurrencyInput(formData.valor);

        if (parsedValue <= 0) {
            alert('Informe um valor válido maior que zero.');
            return;
        }

        try {
          const typeToColumnMap = {
            'NF-e': 'nfe_url',
            'nfe': 'nfe_url',
            'XML': 'xml_url',
            'xml': 'xml_url',
            'Boleto': 'boleto_url',
            'boleto': 'boleto_url',
            'Comprovante': 'receipt_url',
            'receipt': 'receipt_url'
          };

          const uploadedUrls = {
            nfe_url: null,
            xml_url: null,
            boleto_url: null,
            receipt_url: null
          };

          if (attachedFiles && attachedFiles.length > 0) {
            for (const item of attachedFiles) {
              if (!item.file) continue;

              // Nome único para evitar conflitos no bucket
              const fileExt = item.file.name.split('.').pop();
              const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
              const filePath = `documents/${fileName}`;

              // Upload direto para o Supabase Storage
              const { error: uploadError } = await supabase.storage
                .from('transaction_attachments')
                .upload(filePath, item.file);

              if (uploadError) {
                console.error(`Erro ao carregar o ficheiro (${item.type}):`, uploadError.message);
                continue;
              }

              // Resgate da URL pública
              const { data: publicUrlData } = supabase.storage
                .from('transaction_attachments')
                .getPublicUrl(filePath);

              // Converte o tipo selecionado para a coluna correspondente
              const targetColumn = typeToColumnMap[item.type] || item.type;

              // Atribui a URL ao campo correspondente (ex: nfe_url, xml_url, etc.)
              if (targetColumn && uploadedUrls.hasOwnProperty(targetColumn)) {
                uploadedUrls[targetColumn] = publicUrlData.publicUrl;
              }
            }
          }

          console.log("URLS GERADAS", uploadedUrls);
          

        await onSave({
          ...formData,
          ...uploadedUrls, // INCLUÍDO: Repassa as URLs salvas (nfe_url, xml_url, boleto_url, receipt_url) para o onSave
          categoria: categoria,
          valor: parsedValue,
          status: status === 'Selecione' || !status ? "Pendente" : status,
          installment: formData.installment || '1',
          group_id: formData.group_id
        });

        if(typeof setAttachedFiles === 'function') setAttachedFiles([]);
        resetForm();
        onClose();

      } catch (error) {
        console.error('Erro ao processar o envio da transação: ', error);
        alert('Ocorreu um erro ao salvar a transação com os anexos');
      }
    };

    if(!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
        {/* Container do Modal */}
        <div ref={selectRef} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl transition-all sm:p-6">
          {/* Cabeçalho */}
          <div className="flex items-start justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {isEditing ? "Editar Lançamento" : "Nova Transação"}
              </h2>
              <p className="text-sm text-slate-500">
                Preencha os dados abaixo para cadastrar uma nova fatura
              </p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" autoComplete='off'>
            {/* Fornecedor / Empresa */}
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Fornecedor / Empresa
              </label>
              <input
                type="text"
                name="fornecedor"
                value={formData.fornecedor || ""}
                onChange={handleChange}
                placeholder="Digite o fornecedor"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Grid de 2 Colunas: Categoria e Valor */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Categoria
                </label>
                {/* <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:bg-white focus:outline-none"
                > 
                    <option value="null">Selecione</option>
                    <option value="Sementes">Sementes</option>
                    <option value="Fertilizantes">Fertilizantes</option>
                    <option value="Defensivos">Defensivos</option>
                </select> */}
                <CustomSelect 
                    options={transactionCategoryOptions}
                    selected={categoria}
                    onSelect={setCategoria}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Valor (R$)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  name="valor"
                  value={formData.valor || ""}
                  onChange={handleChange}
                  placeholder="Digite o valor"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Grid de 2 Colunas: Data e Status */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  name="vencimento"
                  value={formData.vencimento || ""}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-600 focus:border-purple-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Status Inicial
                </label>
                {/* <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-600 focus:border-purple-500 focus:bg-white focus:outline-none"
                >
                  <option value='null'>Selecione</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Pago">Pago</option>
                  <option value="Vencido">Vencido</option>
                </select> */}
                <CustomSelect 
                    options={statusOptions}
                    selected={status}
                    onSelect={setStatus}
                  />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600">Parcelas</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.installment || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData((prev) => ({
                      ...prev,
                      installment: value,
                    }));
                  }}
                  onBlur={() => {
                    const num = parseInt(formData.installment, 10);
                    if(!formData.installment || isNaN(num) || num < 1) {
                      setFormData((prev) => ({ ...prev, installment: "1"}))
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            {/* Área de Upload de Comprovante */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Arquivos (Opcional)
              </label>
              <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/30 p-6 text-center hover:bg-slate-50 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.xml"
                  onChange={handleFileSelect}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                <div className="rounded-full bg-slate-100 p-3 mb-2 text-slate-600">
                  <Upload size={24} />
                </div>
                <span className="rounded-md bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 mb-1">
                  {formData.file ? formData.file.name : "Procurar"}
                </span>
                <p className="text-xs text-slate-400">
                  Arraste o arquivo aqui ou clique para selecionar <br /> (PDF,
                  PNG, JPG)
                </p>
              </div>
            </div>
            {attachedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <label className="text-xs font-semibold text-gray-600 block">
                  Arquivos Selecionados ({attachedFiles.length}):
                </label>

                {attachedFiles.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  >
                    {/* Nome do Arquivo */}
                    <span className="truncate max-w-[200px] font-medium text-gray-700" title={item.file.name}>
                      {item.file.name}
                    </span>

                    {/* Seleção de Tipo e Exclusão */}
                    <div className="flex items-center gap-2">
                      <select
                        value={item.type}
                        onChange={(e) => handleTypeChange(item.id, e.target.value)}
                        className="text-xs bg-white border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 text-gray-700"
                      >
                        <option value="boleto_url">Boleto</option>
                        <option value="nfe_url">Nota Fiscal (NF-e)</option>
                        <option value="xml_url">XML</option>
                        <option value="receipt_url">Comprovante</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveFile(item.id)}
                        className="text-gray-400 hover:text-red-500 p-1 font-bold text-xs"
                        title="Remover arquivo"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#3b233a] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#2b192b] transition-colors"
              >
                {isEditing ? "Salvar Edição" : "Salvar Lançamento"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
}