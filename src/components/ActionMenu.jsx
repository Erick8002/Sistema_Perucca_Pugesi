import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, FileText, Printer, Edit3 } from "lucide-react";

export function ActionMenu({ item }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="py-3 text-right relative pr-2">
      <button
        ref={menuRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1 hover:bg-gray-200 rounded text-gray-500"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-10 top-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 text-left text-xs ">
          <button 
            onClick={() => setIsOpen(false)}
            className="w-full px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
          >
            <FileText className="w-3.5 h-3.5" /> Ver / Baixar Boleto
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-full px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
          >
            <Printer className="w-3.5 h-3.5" /> Imprimir Comprovante
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-full px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
          >
            <Edit3 className="w-3.5 h-3.5" /> Editar Lançamento
          </button>
        </div>
      )}
    </div>
  );
}
