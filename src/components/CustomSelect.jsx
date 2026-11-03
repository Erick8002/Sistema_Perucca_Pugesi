import { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, X } from "lucide-react";

export default function CustomSelect({ options = [], selected, onSelect, currentOption, onAddNew, addNewLabel = "Nova Opção", onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Funções auxiliares para suportar tanto objetos quanto strings/primitivos de forma segura
  const isObject = (item) => item && typeof item === "object";
  
  const getLabel = (item) => {
    if (isObject(item)) return item.name || item.label || String(item);
    return item;
  };

  const displaySelected = isObject(selected) ? getLabel(selected) : (selected || "Selecione");

  const isCurrentOption = (option) => {
    if (isObject(option) && isObject(currentOption)) return option.id === currentOption.id;
    return option === currentOption;
  };

  const isSelectedOption = (option) => {
    if (option === selected) return true;
    if (isObject(option) && isObject(selected)) return option.id === selected.id;
    if (isObject(option) && typeof selected === "string") return option.name === selected || option.id === selected;
    return false;
  };

  const isSelectedCurrent = isObject(selected) 
    ? (currentOption && selected.id === currentOption.id) 
    : (selected === currentOption);

  return (
    <div ref={selectRef} className="relative min-w-44 w-fit text-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-gray-700 shadow-sm transition-all hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
      >
        <div className="flex items-center gap-2 truncate">
          <span className="truncate">{displaySelected}</span>

          {isSelectedCurrent && (
            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-px rounded font-semibold shrink-0">
              Atual
            </span>
          )}
        </div>

        <ChevronDown
          className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-10 mt-1.5 w-full overflow-hidden rounded-xl border border-gray-100 bg-white p-1 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 max-h-60 overflow-y-auto">
          {onAddNew && (
            <div className="mt-1 border-t border-gray-100 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onAddNew();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors text-emerald-600 hover:bg-emerald-50"
              >
                <Plus className="h-3.5 w-3.5" />
                {addNewLabel}
              </button>
            </div>
          )}
          {options.map((option, index) => {
            const isCurrent = isCurrentOption(option);
            const isSelected = isSelectedOption(option);
            const optionKey = isObject(option) ? (option.id || option.value || index) : option;
            const optionLabel = getLabel(option);

            return (
              <button
                key={optionKey}
                type="button"
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                  isSelected
                    ? "bg-purple-50 text-purple-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="truncate">{optionLabel}</span>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Badge do Mês Atual (se existir) */}
                  {isCurrent && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                      Mês atual
                    </span>
                  )}

                  {/* Botão X para Excluir */}
                  {onDelete && (
                    <span
                      role="button"
                      tabIndex={0}
                      title="Excluir item"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(e, option);
                      }}
                      className="hidden group-hover:flex items-center justify-center w-5 h-5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      &times;
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}