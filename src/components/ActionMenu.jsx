import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, FileText, Printer, Edit3 } from "lucide-react";

export function ActionMenu({ item }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const updateMenuPosition = () => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 176;
    const menuHeight = 120;
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const showAbove = spaceBelow < menuHeight && buttonRect.top > menuHeight;

    setMenuPosition({
      top: showAbove ? buttonRect.top - menuHeight - 8 : buttonRect.bottom + 8,
      left: Math.max(8, buttonRect.right - menuWidth),
    });
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
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

  useEffect(() => {
    if (!isOpen) return undefined;

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen]);

  return (
    <div className="relative py-3 pr-2 text-right">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          updateMenuPosition();
        }}
        className="p-1 hover:bg-gray-200 rounded text-gray-500"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && menuPosition && createPortal(
        <div
          ref={menuRef}
          style={{ top: menuPosition.top, left: menuPosition.left }}
          className="fixed z-[100] w-44 rounded-lg border border-gray-200 bg-white py-1 text-left text-xs shadow-lg"
        >
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
        </div>,
        document.body
      )}
    </div>
  );
}
