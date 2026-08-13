import React from 'react';

export default function ChartsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-800 mb-6">Gastos por Categoria</h3>
        <div className="flex items-center justify-around">
          <div className="w-36 h-36 rounded-full border-8 border-gray-100 relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#6B3A5D] via-[#A8A370] to-[#5F5F63] rounded-full"></div>
            <div className="w-16 h-16 bg-white rounded-full z-10"></div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#A8A370] rounded-sm"></span>
              <span className="text-gray-600">Adubos <strong className="text-gray-900">(45%)</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#5F5F63] rounded-sm"></span>
              <span className="text-gray-600">Peças <strong className="text-gray-900">(30%)</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#6B3A5D] rounded-sm"></span>
              <span className="text-gray-600">Outros <strong className="text-gray-900">(25%)</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-800 mb-6">Evolução de Gastos (Últimos 6 Meses)</h3>
        
        <div className="h-36 flex items-end justify-between gap-3 px-4 border-b border-l border-gray-400 pb-1">
          <div className="w-full bg-gray-400 rounded-t h-[50%]"></div>
          <div className="w-full bg-gray-400 rounded-t h-[35%]"></div>
          <div className="w-full bg-gray-400 rounded-t h-[42%]"></div>
          <div className="w-full bg-gray-400 rounded-t h-[25%]"></div>
          <div className="w-full bg-gray-400 rounded-t h-[60%]"></div>
          <div className="w-full bg-gray-400 rounded-t h-[30%]"></div>
        </div>

        <div className="flex justify-between text-[11px] font-medium text-gray-700 px-4 mt-2">
          <span>Mar</span>
          <span>Abr</span>
          <span>Mai</span>
          <span>Jun</span>
          <span>Jul</span>
          <span>Ago</span>
        </div>
      </div>
    </div>
  );
}