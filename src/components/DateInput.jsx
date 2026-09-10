import { useRef } from "react";
import { Calendar } from "lucide-react";

export function DateInput({ value, onChange, placeholder }) {
  const inputRef = useRef(null);

  const handleClick = () => {
    if (inputRef.current) {
        if("showPicker" in HTMLInputElement.prototype){
            inputRef.current.showPicker();
        } else {
            inputRef.current.focus();
        }
    }
  };

  return (
    <div
      onClick={handleClick}
      className="relative flex w-36 cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm shadow-sm transition-all hover:border-gray-300 focus-within:ring-2 focus-within:ring-purple-500/20"
    >
      <input
        ref={inputRef}
        type="date"
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full cursor-pointer bg-transparent text-gray-600 outline-none text-xs sm:text-sm [&::-webkit-calendar-picker-indicator]:hidden"
      />
      <Calendar className="pointer-events-none h-4 w-4 shrink-0 text-gray-400" />
    </div>
  );
}