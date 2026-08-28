import logoImg from '../assets/Logo.png';
import { BarChart3, LayoutDashboard, ReceiptText } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col items-center border-r border-gray-200 bg-white py-4 sm:w-24 sm:py-6 lg:w-36">
      <a href="#dashboard" aria-label="Ir para o início">
        <img src={logoImg} alt="Logo" className="w-12 sm:w-16 lg:w-28" />
      </a>

      <nav aria-label="Navegação principal" className="mt-10 flex flex-col gap-3">
        <a
          href="#dashboard"
          title="Visão geral"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4A2E56] text-white shadow-sm transition-colors hover:bg-[#382242]"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="sr-only">Visão geral</span>
        </a>
        <a
          href="#transactions"
          title="Lançamentos"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-purple-50 hover:text-[#4A2E56]"
        >
          <ReceiptText className="h-4 w-4" />
          <span className="sr-only">Lançamentos</span>
        </a>
        <a
          href="#charts"
          title="Relatórios"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-purple-50 hover:text-[#4A2E56]"
        >
          <BarChart3 className="h-4 w-4" />
          <span className="sr-only">Relatórios</span>
        </a>
      </nav>
    </aside>
  );
}