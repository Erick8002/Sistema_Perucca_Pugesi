import { useState, useEffect, useRef } from 'react';
import CustomSelect from './CustomSelect';
import { X, Upload } from 'lucide-react';

const categoryOptions = [
    "Fertilizantes",
    "Defensivos",
    "Sementes",
];

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

export function NewTransactionModal({ isOpen, onClose, onSave}) {
    const selectRef = useRef(null);

    useEffect(() => {
      function handleClickOutside(event) {
        if (selectRef.current && !selectRef.current.contains(event.target)) {
          onClose();
        }
      }

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen, onClose]);

    const [formData, setFormaData] = useState({
        fornecedor: '',
        categoria: '',
        valor: '',
        dueDate: '',
        status: '',
        file: null,
    })

    const [categoria, setCategoria] = useState('Selecione')

    if(!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormaData((prev) => ({ ...prev, [name]: value}))
    };

    const handleFileChange = (e) => {
        if(e.target.files && e.target.files[0]){
            setFormaData((prev) => ({ ...prev, file: e.target.files[0] }));
        }
    };
    
    const handleSubmit = (e) => {
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

        onSave({
          ...formData,
          categoria: categoria,
          valor: parsedValue
        });

        setFormaData({
          fornecedor: '',
          valor: '',
          dueDate: '',
          status: '',
          file: null,
        });
        setCategoria('Selecione');

        onClose();
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
        {/* Container do Modal */}
        <div ref={selectRef} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl transition-all">
          {/* Cabeçalho */}
          <div className="flex items-start justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Novo Lançamento
              </h2>
              <p className="text-sm text-slate-500">
                Preencha os dados abaixo para cadastrar uma nova fatura
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Fornecedor / Empresa */}
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Fornecedor / Empresa
              </label>
              <input
                type="text"
                name="fornecedor"
                value={formData.fornecedor}
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
                    options={categoryOptions}
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
                  value={formData.valor}
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
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-600 focus:border-purple-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Status Inicial
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-600 focus:border-purple-500 focus:bg-white focus:outline-none"
                >
                  <option value="">Selecione</option>
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="overdue">Vencido</option>
                </select>
              </div>
            </div>

            {/* Área de Upload de Comprovante */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Comprovante/ Boleto (Opcional)
              </label>
              <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/30 p-6 text-center hover:bg-slate-50 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
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

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#3b233a] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#2b192b] transition-colors"
              >
                Salvar Lançamento
              </button>
            </div>
          </form>
        </div>
      </div>
    );
}