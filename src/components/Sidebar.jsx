import React from 'react';

export default function Sidebar() {
  return (
    <aside className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 shrink-0">
      <div className="w-12 h-16 border-2 border-black flex items-center justify-center font-bold text-2xl tracking-tighter">
        <span className="text-black">P</span>
        <span className="text-gray-500">d</span>
      </div>
    </aside>
  );
}