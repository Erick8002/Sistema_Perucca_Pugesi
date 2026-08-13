import React, { useState } from 'react';
import { 
  Search, 
  ChevronDown, 
  MoreHorizontal, 
  FileText, 
  Printer, 
  Send, 
  Plus, 
  Edit3, 
  Download, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export default function App() {
  const [openDropdown, setOpenDropdown] = useState(null);

  const transactions = [
    {
      id: 1,
      vencimento: '08/08/2026',
      fornecedor: 'Agrofértil Insumos',
      categoria: 'Fertilizantes & Adubos',
      valor: 'R$ 4.500,00',
      status: 'Pago',
    },
    {
      id: 2,
      vencimento: '10/08/2026',
      fornecedor: 'MaqCampo Peças e Manutenção',
      categoria: 'Manutenção de Maquinário',
      valor: 'R$ 1.580,00',
      status: 'Pendente',
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F4F4F6] text-gray-800 font-sans">
      
      {/* 1. SIDEBAR ESQUERDA (Estilo Fino/Clean do Figma) */}
      <aside className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 shrink-0">
        {/* Logo PD */}
        <div className="w-12 h-16 border-2 border-black flex items-center justify-center font-bold text-2xl tracking-tighter">
          <span className="text-black">P</span>
          <span className="text-gray-500">d</span>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* 2. CABEÇALHO */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Olá, Rosangela! 👋
              </h1>
              <p className="text-sm text-gray-500">
                Acompanhe e gerencie os lançamentos da sua empresa
              </p>
            </div>

            {/* Seletor de Conta */}
            <div className="flex flex-col items-end text-xs">
              <span className="text-gray-400 mb-1">Conta Selecionada:</span>
              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-3 py-1.5 shadow-sm text-gray-700">
                <span className="w-4 h-4 bg-gray-200 border border-gray-400 rounded-sm flex items-center justify-center text-[10px]">🏢</span>
                <span>Rosangela (PF)</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>
            </div>
          </div>

          {/* 3. CARDS DE KPI SUPERIORES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: Total de Gastos (Borda em Destaque) */}
            <div className="bg-white p-5 rounded-xl border-2 border-purple-900/30 shadow-sm relative">
              <span className="text-xs text-gray-500 font-medium">Total de Gastos (Mês)</span>
              <div className="text-2xl font-bold text-gray-900 mt-1">R$ 45.200,00</div>
              <span className="text-xs text-gray-400 mt-2 block">23 faturas no total</span>
            </div>

            {/* Card 2: Contas Pagas */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-medium">Contas Pagas</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">R$ 41.400,00</div>
              <span className="text-xs text-emerald-600 font-medium mt-2 block">18 faturas pagas</span>
            </div>

            {/* Card 3: Contas Pendentes */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-medium">Contas Pendentes</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">R$ 3.800,00</div>
              <span className="text-xs text-amber-600 font-medium mt-2 block">5 Faturas a pagar</span>
            </div>
          </div>

          {/* 4. SEÇÃO DA TABELA ("Todos os Gastos do Mês") */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            
            {/* Barra de Filtros da Tabela */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <h2 className="text-base font-bold text-gray-800">Todos os Gastos do Mês</h2>

              <div className="flex items-center gap-2 flex-1 max-w-xl">
                {/* Busca */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Pesquisar por fornecedor ou fatura..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-md pl-3 pr-8 py-1.5 text-xs focus:outline-none focus:border-purple-500"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2" />
                </div>

                {/* Filtro Categoria */}
                <select className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5 text-xs text-gray-600">
                  <option>Todas as Categorias</option>
                </select>

                {/* Botão Novo Gasto */}
                <button className="bg-[#4A2E56] hover:bg-[#382242] text-white font-medium px-3 py-1.5 rounded-md flex items-center gap-1 shrink-0">
                  <Plus className="w-3.5 h-3.5" /> Novo Gasto
                </button>
              </div>
            </div>

            {/* Sub-filtros (Mês / Datas) */}
            <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
              <select className="bg-white border border-gray-200 rounded px-2 py-1">
                <option>Agosto</option>
              </select>
              <div className="flex items-center gap-2">
                <span className="bg-white border border-gray-200 rounded px-2 py-1 text-gray-400">Data Inicial 🗓️</span>
                <span className="bg-white border border-gray-200 rounded px-2 py-1 text-gray-400">Data Final 🗓️</span>
              </div>
            </div>

            {/* Tabela de Lançamentos */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-medium">
                    <th className="pb-3 font-medium">Vencimento</th>
                    <th className="pb-3 font-medium">Fornecedor</th>
                    <th className="pb-3 font-medium">Categoria</th>
                    <th className="pb-3 font-medium">Valor</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right pr-4">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
                  {transactions.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="py-3">{item.vencimento}</td>
                      <td className="py-3 font-medium text-gray-900">{item.fornecedor}</td>
                      <td className="py-3 text-gray-500">{item.categoria}</td>
                      <td className="py-3 font-semibold">{item.valor}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
                          item.status === 'Pago' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 text-right relative pr-2">
                        <button 
                          onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                          className="p-1 hover:bg-gray-200 rounded text-gray-500"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Dropdown de Ações Fiel ao Figma */}
                        {openDropdown === item.id && (
                          <div className="absolute right-0 top-10 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 text-left text-xs">
                            <button className="w-full px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                              <FileText className="w-3.5 h-3.5" /> Ver / Baixar Boleto
                            </button>
                            <button className="w-full px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                              <Printer className="w-3.5 h-3.5" /> Imprimir Comprovante
                            </button>
                            <button className="w-full px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                              <Edit3 className="w-3.5 h-3.5" /> Editar Lançamento
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="flex justify-between items-center text-[11px] text-gray-400 pt-2 border-t border-gray-50">
              <span>Mostrando 1-10 de 23 lançamentos</span>
              <div className="flex items-center gap-1">
                <span>‹</span> <span className="font-bold text-gray-700">1</span> <span>2</span> <span>3</span> <span>›</span>
              </div>
              <div>Itens por página: <select className="bg-transparent border rounded text-[11px]"><option>10</option></select></div>
            </div>
          </div>

          {/* 5. BOTÕES DE AÇÃO CENTRALIZADOS */}
          <div className="flex justify-center gap-3 text-xs pt-2">
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-md flex items-center gap-2">
              <Download className="w-3.5 h-3.5" /> Exportar Relatório
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-md flex items-center gap-2">
              <Printer className="w-3.5 h-3.5" /> Imprimir Relatório
            </button>
            <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium px-4 py-2 rounded-md flex items-center gap-2">
              <Send className="w-3.5 h-3.5" /> Enviar para Contabilidade
            </button>
          </div>

          {/* 6. CARDS PASTEL (ABAIXO DA TABELA) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Card Bege/Roxo Pastel */}
            <div className="bg-[#FAF5EE] p-5 rounded-xl border border-amber-100/60 shadow-sm relative">
              <span className="text-xs text-gray-500">A Vencer na Semana</span>
              <div className="text-xl font-bold text-gray-800 mt-1">R$ 2.400,00</div>
              <p className="text-xs text-gray-400 mt-1">3 faturas nos próximos 7 dias</p>
              <ChevronDown className="w-4 h-4 text-amber-700 absolute bottom-3 left-1/2 -translate-x-1/2 cursor-pointer" />
            </div>

            {/* Card Roxo Pastel */}
            <div className="bg-[#F3EFEF] p-5 rounded-xl border border-purple-100/60 shadow-sm relative">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Contas Acima de R$</span>
                <span className="bg-white/80 px-2 py-0.5 rounded text-[10px] border">3.000,00</span>
              </div>
              <div className="text-xl font-bold text-gray-800 mt-1">R$ 18.500,00</div>
              <p className="text-xs text-gray-400 mt-1">3 Faturas com valor acima de R$ 3.000,00</p>
              <ChevronDown className="w-4 h-4 text-purple-700 absolute bottom-3 left-1/2 -translate-x-1/2 cursor-pointer" />
            </div>

            {/* Card Azul Pastel */}
            <div className="bg-[#EBF3F5] p-5 rounded-xl border border-blue-100/60 shadow-sm relative">
              <span className="text-xs text-gray-500">Gastos com Funcionários</span>
              <div className="text-xl font-bold text-gray-800 mt-1">R$ 14.200,00</div>
              <p className="text-xs text-gray-400 mt-1">Salários, encargos, e benefícios</p>
              <ChevronDown className="w-4 h-4 text-blue-600 absolute bottom-3 left-1/2 -translate-x-1/2 cursor-pointer" />
            </div>

            {/* Card Verde Pastel */}
            <div className="bg-[#EBF5EF] p-5 rounded-xl border border-emerald-100/60 shadow-sm relative">
              <span className="text-xs text-gray-500">Despesas Fixas Mensais</span>
              <div className="text-xl font-bold text-gray-800 mt-1">R$ 8.900,00</div>
              <p className="text-xs text-gray-400 mt-1">Custos recorrentes do mês</p>
              <ChevronDown className="w-4 h-4 text-emerald-600 absolute bottom-3 left-1/2 -translate-x-1/2 cursor-pointer" />
            </div>
          </div>

          {/* 7. ÁREA DOS GRÁFICOS DO RODAPÉ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Gráfico 1: Pizza */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-6">Gastos por Categoria</h3>
              <div className="flex items-center justify-around">
                {/* Simulação de Gráfico de Pizza SVG */}
                <div className="w-36 h-36 rounded-full border-8 border-gray-100 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#6B3A5D] via-[#A8A370] to-[#5F5F63] rounded-full"></div>
                  <div className="w-16 h-16 bg-white rounded-full z-10"></div>
                </div>

                {/* Legendas Féis */}
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

            {/* Gráfico 2: Barras */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-6">Evolução de Gastos (Últimos 6 Meses)</h3>
              
              {/* Simulação de Gráfico de Barras */}
              <div className="h-36 flex items-end justify-between gap-3 px-4 border-b border-l border-gray-400 pb-1">
                <div className="w-full bg-gray-400 rounded-t h-[50%]"></div>
                <div className="w-full bg-gray-400 rounded-t h-[35%]"></div>
                <div className="w-full bg-gray-400 rounded-t h-[42%]"></div>
                <div className="w-full bg-gray-400 rounded-t h-[25%]"></div>
                <div className="w-full bg-gray-400 rounded-t h-[60%]"></div>
                <div className="w-full bg-gray-400 rounded-t h-[30%]"></div>
              </div>

              {/* Meses */}
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

        </div>
      </main>
    </div>
  );
}