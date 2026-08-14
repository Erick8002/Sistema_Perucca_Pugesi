import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CustomSelect({
  options = [],
  selected,
  onSelect,
  currentOption,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isSelectedCurrent = selected === currentOption;

  return (
    <div className="relative w-52 text-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-gray-700 shadow-sm transition-all hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
      >
        <div className="flex items-center gap-2">
          <span>{selected}</span>

          {isSelectedCurrent && (
            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
              Atual
            </span>
          )}
        </div>

        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-10 mt-1.5 w-full overflow-hidden rounded-xl border border-gray-100 bg-white p-1 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1">
          {options.map((option) => {
            const isCurrent = option === currentOption;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                  selected === option
                    ? "bg-purple-50 text-purple-700 font-medium" // Estilo do selecionado
                    : "text-gray-600 hover:bg-gray-50" // Estilo do não selecionado
                }`}
              >
                {option}

                {isCurrent && (
                  <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                    Mês atual
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
