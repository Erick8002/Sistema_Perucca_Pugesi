import { useState } from "react";
import { ChevronDown } from "lucide-react";

const options = ["Todas as Categorias", "Fertilizantes", "Defensivos", "Sementes",];

export default function CustomSelect() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Fertilizantes");

  return (
    <div className="relative w-52 text-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-gray-700 shadow-sm transition-all hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
      >
        <span>{selected}</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-10 mt-1.5 w-full overflow-hidden rounded-xl border border-gray-100 bg-white p-1 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                setSelected(option);
                setIsOpen(false);
              }}
              className={`flex w-full items-center rounded-lg px-3 py-2 text-left transition-colors ${
                selected === option
                  ? "bg-purple-50 text-purple-700 font-medium" // Estilo do selecionado
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
